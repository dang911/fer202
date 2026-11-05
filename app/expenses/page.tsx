"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSpendWise } from "@/components/providers/spendwise-provider";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseList } from "@/components/expenses/expense-list";
import { ExpenseFilters } from "@/components/expenses/expense-filters";
import { ExpenseSummary } from "@/components/expenses/expense-summary";

export default function ExpensesPage() {
  const router = useRouter();
  const { session } = useSpendWise();

  useEffect(() => {
    // Chỉ chuyển trang khi đã biết chắc không có phiên; undefined vẫn đang chờ.
    if (session === null) router.replace("/login");
  }, [session, router]);

  // Không render nội dung riêng tư khi đang kiểm tra hoặc chưa đăng nhập.
  // RLS trên Supabase tiếp tục bảo vệ dữ liệu ở phía database.
  if (!session) return null;

  return (
    <main
      data-testid="expenses-page"
      className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6"
    >
      <h1 className="text-2xl font-bold">Expenses</h1>
      {/* Header và Logout đã chuyển lên layout để dùng chung trên mọi trang. */}
      {/* Xếp dọc trên điện thoại, hai cột trên màn hình lớn. */}
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="min-w-0 space-y-6">
          <ExpenseForm key={session.user.id} />
          <ExpenseSummary />
        </div>
        <div className="min-w-0 space-y-6">
          <ExpenseFilters />
          <ExpenseList key={session.user.id} />
        </div>
      </div>
    </main>
  );
}
