"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useSpendWise } from "@/components/providers/spendwise-provider";
import { formatAmount } from "@/lib/expenses";

export function ExpenseSummary() {
  const { summary, isLoading, loadError } = useSpendWise();
  // Chờ dữ liệu tải xong để không hiển thị tổng tiền tạm thời hoặc khi tải lỗi.
  if (isLoading || loadError) return null;

  return (
    <Card className="min-w-0">
      <CardHeader><h2 className="text-xl font-semibold">Summary</h2></CardHeader>
      <CardContent className="space-y-4">
        <dl className="space-y-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <dt className="text-muted-foreground">Total</dt>
            <dd data-testid="total-amount" className="break-all text-2xl font-bold">
              {formatAmount(summary.total)}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-2">
            <dt className="text-muted-foreground">Expenses</dt>
            <dd data-testid="expense-count" className="font-semibold">{summary.count}</dd>
          </div>
        </dl>
        <div className="space-y-2 border-t pt-4">
          <h3 className="font-medium">By category</h3>
          {/* Chỉ có những danh mục đang xuất hiện; tổng cao nhất đứng đầu. */}
          <ul data-testid="category-breakdown" className="space-y-2">
            {summary.breakdown.map((row) => (
              <li key={row.category} data-testid="breakdown-row" className="flex flex-wrap justify-between gap-2 text-sm">
                <span data-testid="breakdown-name">{row.category}</span>
                <span data-testid="breakdown-amount" className="break-all font-medium">
                  {formatAmount(row.total)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
