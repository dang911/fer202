"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  filterExpenses, sortExpenses, summarizeExpenses,
  type Expense, type ExpenseInput,
} from "@/lib/expenses";

type SpendWiseContextValue = {
  session: Session | null | undefined;
  expenses: Expense[];
  filteredExpenses: Expense[];
  categoryFilter: string;
  monthFilter: string;
  setCategoryFilter: (category: string) => void;
  setMonthFilter: (month: string) => void;
  clearFilters: () => void;
  summary: ReturnType<typeof summarizeExpenses>;
  isLoading: boolean;
  loadError: string;
  addExpense: (input: ExpenseInput) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
};

const SpendWiseContext = createContext<SpendWiseContextValue | null>(null);
const expenseColumns = "id,user_id,amount,category,spent_on,note,created_at";

export function SpendWiseProvider({ children }: { children: ReactNode }) {
  // undefined: SDK chưa kiểm tra xong; null: chưa đăng nhập.
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const userId = session?.user.id;
  const activeUser = useRef<string | undefined>(undefined);
  const sessionVersion = useRef(0);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      const nextUserId = nextSession?.user.id;
      if (activeUser.current !== nextUserId) {
        activeUser.current = nextUserId;
        sessionVersion.current += 1;
        // Xóa dữ liệu ngay trong sự kiện đổi tài khoản, không chờ fetch mới xong.
        setExpenses([]);
        setCategoryFilter("");
        setMonthFilter("");
        setLoadError("");
        setIsLoading(Boolean(nextUserId));
      }
      setSession(nextSession);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    const version = sessionVersion.current;

    async function loadExpenses() {
      try {
        // Chỉ tải khi đổi userId, không tải lại mỗi lần token được làm mới.
        // Phân trang để không bỏ sót dữ liệu khi vượt giới hạn trả về của Supabase.
        const rows: Expense[] = [];
        const pageSize = 1000;
        for (let offset = 0; ; offset += pageSize) {
          const { data, error } = await supabase
            .from("expenses")
            .select(expenseColumns)
            .eq("user_id", userId)
            .order("spent_on", { ascending: false })
            .order("created_at", { ascending: false })
            .order("id", { ascending: false })
            .range(offset, offset + pageSize - 1);
          if (cancelled || version !== sessionVersion.current) return;
          if (error) {
            setLoadError(error.message);
            return;
          }
          rows.push(...((data ?? []) as Expense[]));
          if (!data || data.length < pageSize) break;
        }
        setExpenses(rows);
      } catch (error) {
        if (!cancelled && version === sessionVersion.current) {
          setLoadError(error instanceof Error ? error.message : "Unable to load expenses.");
        }
      } finally {
        if (!cancelled && version === sessionVersion.current) setIsLoading(false);
      }
    }

    // Gọi API ngoài callback onAuthStateChange để tránh giữ khóa của Supabase Auth.
    void loadExpenses();
    return () => { cancelled = true; };
  }, [userId]);

  async function addExpense(input: ExpenseInput) {
    if (!userId || activeUser.current !== userId) throw new Error("Please log in again.");
    const version = sessionVersion.current;
    const { data, error } = await supabase
      .from("expenses")
      .insert({ ...input, user_id: userId })
      // insert mặc định không trả lại hàng; select().single() lấy khoản vừa lưu.
      .select(expenseColumns)
      .single();

    // Bỏ phản hồi cũ nếu người dùng đã đăng xuất hoặc chuyển tài khoản trong lúc chờ.
    if (version !== sessionVersion.current) throw new Error("Your session changed. Please try again.");
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Unable to add expense.");

    // Chỉ cập nhật Context sau khi Supabase lưu thành công, không cần tải lại trang.
    setExpenses((previous) => sortExpenses([...previous, data as Expense]));
  }

  async function deleteExpense(id: string) {
    if (!userId || activeUser.current !== userId) throw new Error("Please log in again.");
    const version = sessionVersion.current;
    const { data, error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", userId)
      .select("id");

    if (version !== sessionVersion.current) throw new Error("Your session changed. Please try again.");
    if (error) throw new Error(error.message);
    if (!data?.length) throw new Error("Expense could not be deleted. Please refresh and try again.");
    setExpenses((previous) => previous.filter((expense) => expense.id !== id));
  }

  // Danh sách và thống kê dùng cùng kết quả lọc để số liệu luôn khớp với màn hình.
  const filteredExpenses = filterExpenses(expenses, categoryFilter, monthFilter);
  const summary = summarizeExpenses(filteredExpenses);

  function clearFilters() {
    setCategoryFilter("");
    setMonthFilter("");
  }

  return (
    <SpendWiseContext.Provider value={{
      session, expenses, filteredExpenses, categoryFilter, monthFilter,
      setCategoryFilter, setMonthFilter, clearFilters, summary,
      isLoading, loadError, addExpense, deleteExpense,
    }}>
      {children}
    </SpendWiseContext.Provider>
  );
}

// Form và danh sách cùng đọc Context này, không truyền dữ liệu qua nhiều lớp props.
export function useSpendWise() {
  const context = useContext(SpendWiseContext);
  if (!context) throw new Error("useSpendWise must be used inside SpendWiseProvider.");
  return context;
}
