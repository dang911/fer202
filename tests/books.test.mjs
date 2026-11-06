import test from "node:test";
import assert from "node:assert/strict";
import { validateBook, nextStatus, sortBooks, filterBooks, summarizeBooks } from "../lib/books.ts";

const valid = { title: "Dune", author: "Frank Herbert", pages: "320", status: "To Read" };

test("empty and whitespace-only fields return the exact required messages", () => {
  assert.deepEqual(validateBook({ title: " \t ", author: "", pages: " ", status: "" }), {
    title: "Title is required", author: "Author is required", pages: "Pages is required", status: "Please choose a status",
  });
});

test("title and author length limits include the boundary and count Unicode characters", () => {
  assert.deepEqual(validateBook({ ...valid, title: "a".repeat(80), author: "a".repeat(60) }), {});
  assert.equal(validateBook({ ...valid, title: "a".repeat(81) }).title, "Title must be at most 80 characters");
  assert.equal(validateBook({ ...valid, author: "a".repeat(61) }).author, "Author must be at most 60 characters");
  assert.deepEqual(validateBook({ ...valid, title: "📚".repeat(80) }), {});
});

test("only whole page counts in the inclusive range are accepted", () => {
  for (const pages of ["0", "-1", "1.5", "5000.1", "5001", "NaN", "Infinity", "abc"]) {
    assert.equal(validateBook({ ...valid, pages }).pages, "Pages must be a whole number between 1 and 5000");
  }
  for (const pages of ["1", "5000", "320"]) assert.deepEqual(validateBook({ ...valid, pages }), {});
});

test("unknown status is invalid; advance stops at Finished", () => {
  assert.equal(validateBook({ ...valid, status: "Done" }).status, "Please choose a status");
  assert.equal(nextStatus("To Read"), "Reading");
  assert.equal(nextStatus("Reading"), "Finished");
  assert.equal(nextStatus("Finished"), null);
});

const rows = [
  { id: "1", title: "Dune", author: "Frank Herbert", pages: 320, status: "To Read", created_at: "2026-11-06T01:00:00Z" },
  { id: "2", title: "Foundation", author: "Isaac Asimov", pages: 200, status: "Reading", created_at: "2026-11-06T03:00:00Z" },
  { id: "3", title: "Children of Dune", author: "Frank Herbert", pages: 400, status: "Finished", created_at: "2026-11-06T02:00:00Z" },
  { id: "4", title: "I, Robot", author: "Isaac Asimov", pages: 100, status: "Reading", created_at: "2026-11-06T04:00:00Z" },
];

test("books are newest first without modifying the original array", () => {
  assert.deepEqual(sortBooks(rows).map((row) => row.id), ["4", "2", "3", "1"]);
  assert.equal(rows[0].id, "1");
});

test("search matches title or author, ignores case and outer spaces, and combines with status", () => {
  assert.deepEqual(filterBooks(rows, "", "  DUNE  ").map((row) => row.id), ["1", "3"]);
  assert.deepEqual(filterBooks(rows, "", "asimov").map((row) => row.id), ["2", "4"]);
  assert.deepEqual(filterBooks(rows, "Finished", "herbert").map((row) => row.id), ["3"]);
  assert.deepEqual(filterBooks(rows, "Reading", "dune"), []);
  assert.deepEqual(filterBooks(rows, "", ""), rows);
});

test("summary uses visible books and sorts by descending count then fixed status order", () => {
  assert.deepEqual(summarizeBooks(rows), {
    count: 4, pages: 1020,
    breakdown: [{ status: "Reading", count: 2 }, { status: "To Read", count: 1 }, { status: "Finished", count: 1 }],
  });
  assert.deepEqual(summarizeBooks(filterBooks(rows, "", "dune")), {
    count: 2, pages: 720, breakdown: [{ status: "To Read", count: 1 }, { status: "Finished", count: 1 }],
  });
  assert.deepEqual(summarizeBooks([rows[2], rows[1], rows[0]]).breakdown.map((row) => row.status), ["To Read", "Reading", "Finished"]);
  assert.deepEqual(summarizeBooks([]), { count: 0, pages: 0, breakdown: [] });
});

test("advancing removes a book from its previous status filter and immediately changes summary", () => {
  const advanced = rows.map((row) => row.id === "1" ? { ...row, status: nextStatus(row.status) } : row);
  assert.deepEqual(filterBooks(advanced, "To Read", ""), []);
  assert.equal(summarizeBooks(filterBooks(advanced, "Reading", "")).pages, 620);
  const deleted = advanced.filter((row) => row.id !== "1");
  assert.equal(summarizeBooks(deleted).count, 3);
  assert.equal(summarizeBooks(deleted).pages, 700);
});
