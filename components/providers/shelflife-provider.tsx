"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { filterBooks, nextStatus, sortBooks, summarizeBooks, type Book, type BookInput } from "@/lib/books";

type ShelfLifeContextValue = {
  session: Session | null | undefined;
  filteredBooks: Book[];
  statusFilter: string;
  search: string;
  setStatusFilter: (status: string) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
  summary: ReturnType<typeof summarizeBooks>;
  isLoading: boolean;
  loadError: string;
  addBook: (input: BookInput) => Promise<void>;
  advanceBook: (id: string) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
};

const ShelfLifeContext = createContext<ShelfLifeContextValue | null>(null);
const bookColumns = "id,user_id,title,author,pages,status,created_at";

export function ShelfLifeProvider({ children }: { children: ReactNode }) {
  // undefined means Auth has not resolved yet; null means signed out.
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [books, setBooks] = useState<Book[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
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
        setBooks([]);
        setStatusFilter("");
        setSearch("");
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

    async function loadBooks() {
      try {
        const rows: Book[] = [];
        const pageSize = 1000;
        for (let offset = 0; ; offset += pageSize) {
          const { data, error } = await supabase.from("books").select(bookColumns)
            .eq("user_id", userId)
            .order("created_at", { ascending: false }).order("id", { ascending: false })
            .range(offset, offset + pageSize - 1);
          if (cancelled || version !== sessionVersion.current) return;
          if (error) throw new Error(error.message);
          rows.push(...((data ?? []) as Book[]));
          if (!data || data.length < pageSize) break;
        }
        setBooks(rows);
      } catch (error) {
        if (!cancelled && version === sessionVersion.current) {
          setLoadError(error instanceof Error ? error.message : "Unable to load books.");
        }
      } finally {
        if (!cancelled && version === sessionVersion.current) setIsLoading(false);
      }
    }

    // Keep database calls outside the Auth callback and fetch only when the user changes.
    void loadBooks();
    return () => { cancelled = true; };
  }, [userId]);

  function requireUser() {
    if (!userId || activeUser.current !== userId) throw new Error("Please log in again.");
    return userId;
  }

  function checkSession(version: number) {
    // Ignore stale responses after logout/account changes, including A -> B -> A.
    if (version !== sessionVersion.current) throw new Error("Your session changed. Please try again.");
  }

  async function addBook(input: BookInput) {
    const owner = requireUser();
    const version = sessionVersion.current;
    const { data, error } = await supabase.from("books").insert({ ...input, user_id: owner })
      .select(bookColumns).single();
    checkSession(version);
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Unable to add book.");
    setBooks((previous) => sortBooks([...previous, data as Book]));
  }

  async function advanceBook(id: string) {
    const owner = requireUser();
    const book = books.find((row) => row.id === id);
    if (!book) throw new Error("Book could not be found. Please refresh and try again.");
    const status = nextStatus(book.status);
    if (!status) return;
    const version = sessionVersion.current;
    const { data, error } = await supabase.from("books").update({ status })
      .eq("id", id).eq("user_id", owner).eq("status", book.status)
      .select(bookColumns).single();
    checkSession(version);
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Unable to advance book status.");
    setBooks((previous) => previous.map((row) => row.id === id ? data as Book : row));
  }

  async function deleteBook(id: string) {
    const owner = requireUser();
    const version = sessionVersion.current;
    const { data, error } = await supabase.from("books").delete()
      .eq("id", id).eq("user_id", owner).select("id");
    checkSession(version);
    if (error) throw new Error(error.message);
    if (!data?.length) throw new Error("Book could not be deleted. Please refresh and try again.");
    setBooks((previous) => previous.filter((row) => row.id !== id));
  }

  const filteredBooks = filterBooks(books, statusFilter, search);
  const summary = summarizeBooks(filteredBooks);

  function clearFilters() {
    setStatusFilter("");
    setSearch("");
  }

  return (
    <ShelfLifeContext.Provider value={{
      session, filteredBooks, statusFilter, search, setStatusFilter, setSearch,
      clearFilters, summary, isLoading, loadError, addBook, advanceBook, deleteBook,
    }}>
      {children}
    </ShelfLifeContext.Provider>
  );
}

export function useShelfLife() {
  const context = useContext(ShelfLifeContext);
  if (!context) throw new Error("useShelfLife must be used inside ShelfLifeProvider.");
  return context;
}
