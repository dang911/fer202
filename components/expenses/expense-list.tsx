"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useSpendWise } from "@/components/providers/spendwise-provider";
import { formatAmount } from "@/lib/expenses";

export function ExpenseList() {
  const { filteredExpenses: expenses, isLoading, loadError, deleteExpense } = useSpendWise();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const deleting = useRef(false);

  async function handleDelete(id: string) {
    if (deleting.current) return;
    deleting.current = true;
    setDeletingId(id);
    setDeleteError("");
    try {
      // Context chỉ gỡ khoản chi khỏi danh sách sau khi database xóa thành công.
      await deleteExpense(id);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Unable to delete expense.");
    } finally {
      deleting.current = false;
      setDeletingId(null);
    }
  }

  return (
    <Card className="min-w-0">
      <CardHeader><h2 className="text-xl font-semibold">Your expenses</h2></CardHeader>
      <CardContent className="space-y-4">
        {deleteError && <p role="alert" className="text-sm text-destructive">{deleteError}</p>}
        {isLoading ? (
          <p role="status" className="text-muted-foreground">Loading expenses...</p>
        ) : loadError ? (
          <p role="alert" className="text-sm text-destructive">{loadError}</p>
        ) : expenses.length === 0 ? (
          <p data-testid="expenses-empty" className="text-muted-foreground">No expenses found</p>
        ) : (
          <ul data-testid="expense-list" className="space-y-3">
            {expenses.map((expense) => (
              <li key={expense.id} data-testid="expense-item"
                className="flex min-w-0 flex-wrap items-start justify-between gap-3 rounded-lg border p-4">
                <div className="min-w-0 flex-1 space-y-1">
                  <p data-testid="expense-category" className="font-semibold">{expense.category}</p>
                  <p data-testid="expense-amount" className="font-medium">{formatAmount(expense.amount)}</p>
                  <p data-testid="expense-date" className="text-sm text-muted-foreground">{expense.spent_on}</p>
                  <p data-testid="expense-note" className="whitespace-pre-wrap break-all text-sm">{expense.note}</p>
                </div>
                <Button type="button" variant="outline" data-testid="btn-delete-expense"
                  disabled={deletingId !== null} onClick={() => handleDelete(expense.id)}>
                  {deletingId === expense.id ? "Deleting..." : "Delete"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
