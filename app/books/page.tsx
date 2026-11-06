"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useShelfLife } from "@/components/providers/shelflife-provider";
import { BookForm } from "@/components/books/book-form";
import { BookList } from "@/components/books/book-list";
import { BookFilters } from "@/components/books/book-filters";
import { BookSummary } from "@/components/books/book-summary";

export default function BooksPage() {
  const router = useRouter();
  const { session } = useShelfLife();

  useEffect(() => {
    if (session === null) router.replace("/login");
  }, [session, router]);

  if (!session) return null;

  return (
    <main data-testid="books-page" className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 sm:p-6">
      <div><h1 className="text-2xl font-bold">Your books</h1>
        <p className="mt-1 text-muted-foreground">Make room for your next great read.</p></div>
      <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="min-w-0 space-y-6">
          <BookForm key={session.user.id} />
          <BookSummary />
        </div>
        <div className="min-w-0 space-y-6">
          <BookFilters />
          <BookList key={session.user.id} />
        </div>
      </div>
    </main>
  );
}
