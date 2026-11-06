"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShelfLife } from "@/components/providers/shelflife-provider";
import { STATUSES } from "@/lib/books";

export function BookFilters() {
  const { statusFilter, search, setStatusFilter, setSearch, clearFilters } = useShelfLife();
  return (
    <Card className="min-w-0">
      <CardContent className="flex flex-wrap items-end gap-4">
        <div className="min-w-0 flex-1 basis-36 space-y-2">
          <Label htmlFor="filter-status">Status</Label>
          <select id="filter-status" data-testid="filter-status" value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm">
            <option value="">All</option>
            {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
          </select>
        </div>
        <div className="min-w-0 flex-1 basis-48 space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input id="search" type="text" data-testid="search-input" placeholder="Title or author"
            value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
        <Button type="button" variant="outline" data-testid="btn-clear-filters" onClick={clearFilters}>Clear</Button>
      </CardContent>
    </Card>
  );
}
