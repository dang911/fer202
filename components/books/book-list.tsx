"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useShelfLife } from "@/components/providers/shelflife-provider";

export function BookList() {
  const { filteredBooks, isLoading, loadError, advanceBook, deleteBook } = useShelfLife();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const pending = useRef(false);

  async function handleAction(id: string, action: "advance" | "delete") {
    if (pending.current) return;
    pending.current = true;
    setPendingId(id);
    setActionError("");
    try {
      if (action === "advance") await advanceBook(id);
      else await deleteBook(id);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Unable to update book.");
    } finally {
      pending.current = false;
      setPendingId(null);
    }
  }

  return (
    <Card className="min-w-0">
      <CardHeader><h2 className="text-xl font-semibold">Your shelf</h2></CardHeader>
      <CardContent className="space-y-4">
        {actionError && <p role="alert" className="break-words text-sm text-destructive">{actionError}</p>}
        {isLoading ? <p role="status" className="text-muted-foreground">Loading books...</p>
          : loadError ? <p role="alert" className="break-words text-sm text-destructive">{loadError}</p>
          : filteredBooks.length === 0 ? (
            <p data-testid="books-empty" className="text-muted-foreground">No books found</p>
          ) : (
            <ul data-testid="book-list" className="space-y-3">
              {filteredBooks.map((book) => (
                <li key={book.id} data-testid="book-item"
                  className="flex min-w-0 flex-wrap items-start justify-between gap-4 rounded-xl border p-4">
                  <div className="min-w-0 basis-full space-y-1 sm:flex-1 sm:basis-0">
                    <h3 data-testid="book-title" className="break-words font-semibold">{book.title}</h3>
                    <p data-testid="book-author" className="break-words text-sm text-muted-foreground">{book.author}</p>
                    <p data-testid="book-pages" className="text-sm">{book.pages} pages</p>
                    <p data-testid="book-status" className="text-sm font-medium text-emerald-800">{book.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2" aria-busy={pendingId === book.id}>
                    {book.status !== "Finished" && (
                      <Button type="button" data-testid="btn-advance-status" disabled={pendingId !== null}
                        onClick={() => handleAction(book.id, "advance")}>Advance</Button>
                    )}
                    <Button type="button" variant="outline" data-testid="btn-delete-book"
                      disabled={pendingId !== null} onClick={() => handleAction(book.id, "delete")}>Delete</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
      </CardContent>
    </Card>
  );
}
