"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSpendWise } from "@/components/providers/spendwise-provider";
import { CATEGORIES } from "@/lib/expenses";

export function ExpenseFilters() {
  const {
    categoryFilter, monthFilter, setCategoryFilter, setMonthFilter, clearFilters,
  } = useSpendWise();

  return (
    <Card className="min-w-0">
      <CardHeader><h2 className="text-xl font-semibold">Filters</h2></CardHeader>
      <CardContent className="grid min-w-0 items-end gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="filter-category">Category</Label>
          {/* Thay đổi state là lọc ngay, không gửi thêm yêu cầu lên Supabase. */}
          <select
            id="filter-category"
            data-testid="filter-category"
            className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
          >
            <option value="">All</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="min-w-0 space-y-2">
          <Label htmlFor="filter-month">Month</Label>
          {/* type=month cho giá trị YYYY-MM; để trống sẽ xem mọi tháng. */}
          <Input
            id="filter-month"
            type="month"
            data-testid="filter-month"
            value={monthFilter}
            onChange={(event) => setMonthFilter(event.target.value)}
          />
        </div>
        <Button type="button" variant="outline" data-testid="btn-clear-filters" onClick={clearFilters}>
          Clear
        </Button>
      </CardContent>
    </Card>
  );
}
