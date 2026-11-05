export const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];

export type Expense = {
  id: string;
  user_id: string;
  amount: number;
  category: Category;
  spent_on: string;
  note: string;
  created_at: string;
};

export type ExpenseInput = Pick<Expense, "amount" | "category" | "spent_on" | "note">;
export type ExpenseFields = {
  amount: string;
  category: string;
  spentOn: string;
  note: string;
};
export type ExpenseErrors = Partial<Record<keyof ExpenseFields, string>>;

// Dùng ngày tại máy người dùng; toISOString() có thể lệch ngày do chuyển sang UTC.
export function localToday(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function validateExpense(fields: ExpenseFields, today = localToday()): ExpenseErrors {
  const errors: ExpenseErrors = {};
  if (!fields.amount.trim()) {
    errors.amount = "Amount is required";
  } else if (!Number.isFinite(Number(fields.amount)) || Number(fields.amount) <= 0) {
    errors.amount = "Amount must be greater than 0";
  }

  if (!CATEGORIES.includes(fields.category as Category)) {
    errors.category = "Please choose a category";
  }

  if (!fields.spentOn) {
    errors.spentOn = "Date is required";
  } else if (fields.spentOn > today) {
    // YYYY-MM-DD có thể so sánh theo chuỗi vì năm, tháng, ngày đều đúng thứ tự.
    errors.spentOn = "Date cannot be in the future";
  }

  // Đếm ký tự Unicode giống char_length trong PostgreSQL.
  if (Array.from(fields.note).length > 100) {
    errors.note = "Note must be at most 100 characters";
  }
  return errors;
}

// Ngày chi mới nhất trước; cùng ngày thì khoản vừa tạo trước.
export function sortExpenses(expenses: Expense[]) {
  return [...expenses].sort(
    (a, b) => b.spent_on.localeCompare(a.spent_on) || b.created_at.localeCompare(a.created_at),
  );
}

// Đúng định dạng đề: hai số thập phân, không có dấu phân cách hàng nghìn.
export function formatAmount(amount: number) {
  return `$${Number(amount).toFixed(2)}`;
}

// Hai điều kiện kết hợp bằng AND; chuỗi rỗng nghĩa là không giới hạn bộ lọc đó.
export function filterExpenses(expenses: Expense[], category: string, month: string) {
  return expenses.filter(
    (expense) => (!category || expense.category === category)
      && (!month || expense.spent_on.slice(0, 7) === month),
  );
}

export function summarizeExpenses(expenses: Expense[]) {
  let totalCents = 0;
  const categoryCents = new Map<Category, number>();
  for (const expense of expenses) {
    // Cộng bằng số cent nguyên để tránh lỗi số thực như 0.1 + 0.2.
    const cents = Math.round(Number(expense.amount) * 100);
    totalCents += cents;
    categoryCents.set(expense.category, (categoryCents.get(expense.category) ?? 0) + cents);
  }

  const breakdown = Array.from(categoryCents, ([category, cents]) => ({
    category,
    total: cents / 100,
  })).sort((a, b) => b.total - a.total || a.category.localeCompare(b.category));

  return { total: totalCents / 100, count: expenses.length, breakdown };
}
