import test from "node:test";
import assert from "node:assert/strict";
import {
  validateExpense, localToday, sortExpenses, formatAmount, filterExpenses, summarizeExpenses,
} from "../lib/expenses.ts";

const valid = { amount: "12.50", category: "Food", spentOn: "2026-11-05", note: "" };
const today = "2026-11-05";

test("empty form requires amount, category and date, while note remains optional", () => {
  assert.deepEqual(validateExpense({ amount: "", category: "", spentOn: "", note: "" }, today), {
    amount: "Amount is required",
    category: "Please choose a category",
    spentOn: "Date is required",
  });
});

test("only finite positive amounts are valid", () => {
  for (const amount of ["0", "-1", "NaN", "Infinity"]) {
    assert.equal(validateExpense({ ...valid, amount }, today).amount, "Amount must be greater than 0");
  }
  assert.deepEqual(validateExpense({ ...valid, amount: "0.01" }, today), {});
});

test("today is accepted and tomorrow is rejected", () => {
  assert.deepEqual(validateExpense(valid, today), {});
  assert.equal(validateExpense({ ...valid, spentOn: "2026-11-06" }, today).spentOn, "Date cannot be in the future");
});

test("note limit counts Unicode characters like the database", () => {
  assert.deepEqual(validateExpense({ ...valid, note: "a".repeat(100) }, today), {});
  assert.equal(validateExpense({ ...valid, note: "a".repeat(101) }, today).note, "Note must be at most 100 characters");
  assert.deepEqual(validateExpense({ ...valid, note: "😀".repeat(100) }, today), {});
});

test("unknown category is rejected", () => {
  assert.equal(validateExpense({ ...valid, category: "Travel" }, today).category, "Please choose a category");
});

test("local date uses local calendar fields", () => {
  assert.equal(localToday(new Date(2026, 0, 2, 0, 15)), "2026-01-02");
});

test("expenses sort by spent date then creation time without mutating input", () => {
  const input = [
    { id: "older", spent_on: "2026-11-01", created_at: "2026-11-05T11:00:00Z" },
    { id: "first", spent_on: "2026-11-05", created_at: "2026-11-05T09:00:00Z" },
    { id: "last", spent_on: "2026-11-05", created_at: "2026-11-05T10:00:00Z" },
  ];
  assert.deepEqual(sortExpenses(input).map((row) => row.id), ["last", "first", "older"]);
  assert.equal(input[0].id, "older");
});

test("amount display always has two decimals and no thousands separator", () => {
  assert.equal(formatAmount(12.5), "$12.50");
  assert.equal(formatAmount(1234), "$1234.00");
  assert.equal(formatAmount(0), "$0.00");
});

const rows = [
  { id: "1", amount: 12.5, category: "Food", spent_on: "2026-11-05" },
  { id: "2", amount: 20, category: "Transport", spent_on: "2026-11-04" },
  { id: "3", amount: 7.5, category: "Food", spent_on: "2026-10-31" },
];

test("category and month filters combine and clearing both restores all rows", () => {
  assert.deepEqual(filterExpenses(rows, "Food", "2026-11").map((row) => row.id), ["1"]);
  assert.equal(filterExpenses(rows, "Food", "").length, 2);
  assert.equal(filterExpenses(rows, "", "2026-11").length, 2);
  assert.deepEqual(filterExpenses(rows, "", ""), rows);
  assert.deepEqual(filterExpenses(rows, "Food", "2025-11"), []);
});

test("month filtering matches complete year and month", () => {
  const differentYear = [...rows, { ...rows[0], id: "4", spent_on: "2025-11-05" }];
  assert.equal(filterExpenses(differentYear, "", "2026-11").length, 2);
});

test("summary describes only filtered rows and sorts categories by descending total", () => {
  assert.deepEqual(summarizeExpenses(filterExpenses(rows, "", "2026-11")), {
    total: 32.5,
    count: 2,
    breakdown: [{ category: "Transport", total: 20 }, { category: "Food", total: 12.5 }],
  });
  assert.deepEqual(summarizeExpenses(filterExpenses(rows, "Food", "2026-11")), {
    total: 12.5, count: 1, breakdown: [{ category: "Food", total: 12.5 }],
  });
});

test("empty results have a zero total, zero count and no category rows", () => {
  const summary = summarizeExpenses([]);
  assert.deepEqual(summary, { total: 0, count: 0, breakdown: [] });
  assert.equal(formatAmount(summary.total), "$0.00");
});

test("adding and deleting rows changes the current filtered summary", () => {
  const added = [...rows, { id: "4", amount: 5, category: "Food", spent_on: "2026-11-03" }];
  assert.equal(summarizeExpenses(filterExpenses(added, "Food", "2026-11")).total, 17.5);
  const deleted = added.filter((row) => row.id !== "1");
  assert.deepEqual(summarizeExpenses(filterExpenses(deleted, "Food", "2026-11")), {
    total: 5, count: 1, breakdown: [{ category: "Food", total: 5 }],
  });
});

test("summary totals decimal amounts in cents without floating point drift", () => {
  assert.equal(summarizeExpenses([
    { ...rows[0], amount: 0.1 }, { ...rows[0], amount: 0.2 },
  ]).total, 0.3);
});
