export const STATUSES = ["To Read", "Reading", "Finished"] as const;
export type BookStatus = (typeof STATUSES)[number];

export type Book = {
  id: string;
  user_id: string;
  title: string;
  author: string;
  pages: number;
  status: BookStatus;
  created_at: string;
};

export type BookInput = Pick<Book, "title" | "author" | "pages" | "status">;
export type BookFields = { title: string; author: string; pages: string; status: string };
export type BookErrors = Partial<Record<keyof BookFields, string>>;

export function validateBook(fields: BookFields): BookErrors {
  const errors: BookErrors = {};
  if (!fields.title.trim()) errors.title = "Title is required";
  else if (Array.from(fields.title).length > 80) errors.title = "Title must be at most 80 characters";

  if (!fields.author.trim()) errors.author = "Author is required";
  else if (Array.from(fields.author).length > 60) errors.author = "Author must be at most 60 characters";

  const pages = Number(fields.pages);
  if (!fields.pages.trim()) errors.pages = "Pages is required";
  else if (!Number.isInteger(pages) || pages < 1 || pages > 5000) {
    errors.pages = "Pages must be a whole number between 1 and 5000";
  }

  if (!STATUSES.includes(fields.status as BookStatus)) errors.status = "Please choose a status";
  return errors;
}

export function nextStatus(status: BookStatus): BookStatus | null {
  if (status === "To Read") return "Reading";
  if (status === "Reading") return "Finished";
  return null;
}

export function sortBooks(books: Book[]) {
  return [...books].sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id));
}

export function filterBooks(books: Book[], status: string, search: string) {
  const query = search.trim().toLowerCase();
  return books.filter((book) => (!status || book.status === status)
    && (!query || book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query)));
}

export function summarizeBooks(books: Book[]) {
  const counts = new Map<BookStatus, number>();
  let pages = 0;
  for (const book of books) {
    pages += Number(book.pages);
    counts.set(book.status, (counts.get(book.status) ?? 0) + 1);
  }
  const breakdown = STATUSES.filter((status) => counts.has(status))
    .map((status) => ({ status, count: counts.get(status)! }))
    .sort((a, b) => b.count - a.count || STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status));
  return { count: books.length, pages, breakdown };
}
