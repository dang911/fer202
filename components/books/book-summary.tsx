"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useShelfLife } from "@/components/providers/shelflife-provider";

export function BookSummary() {
  const { summary } = useShelfLife();
  return (
    <Card className="min-w-0">
      <CardHeader><h2 className="text-xl font-semibold">Shelf summary</h2></CardHeader>
      <CardContent className="space-y-5">
        <dl className="grid grid-cols-2 gap-4">
          <div><dt className="text-sm text-muted-foreground">Books</dt>
            <dd data-testid="book-count" className="text-3xl font-semibold">{summary.count}</dd></div>
          <div><dt className="text-sm text-muted-foreground">Total pages</dt>
            <dd data-testid="total-pages" className="text-3xl font-semibold">{summary.pages}</dd></div>
        </dl>
        <div data-testid="status-breakdown" className="space-y-2">
          {summary.breakdown.map(({ status, count }) => (
            <div key={status} data-testid="breakdown-row" className="flex items-center justify-between gap-3 text-sm">
              <span data-testid="breakdown-name">{status}</span>
              <span data-testid="breakdown-count" className="font-medium">{count}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Based on the books currently shown.</p>
      </CardContent>
    </Card>
  );
}
