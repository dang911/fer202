"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSpendWise } from "@/components/providers/spendwise-provider";
import { CATEGORIES, validateExpense, type Category, type ExpenseFields } from "@/lib/expenses";

const emptyForm: ExpenseFields = { amount: "", category: "", spentOn: "", note: "" };

function FieldError({ name, message }: { name: string; message?: string }) {
  // Không tạo phần tử lỗi nếu không có thông báo, đúng yêu cầu test hooks.
  if (!message) return null;
  return <p id={name} data-testid={name} role="alert" className="text-sm text-destructive">{message}</p>;
}

export function ExpenseForm() {
  const { addExpense, isLoading, loadError } = useSpendWise();
  const [fields, setFields] = useState<ExpenseFields>(emptyForm);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");
  const submitting = useRef(false);
  // Sau lần gửi đầu tiên, mỗi lần nhập lại sẽ tính lỗi từ dữ liệu mới.
  const errors = hasSubmitted ? validateExpense(fields) : {};

  function updateField(name: keyof ExpenseFields, value: string) {
    setFields((previous) => ({ ...previous, [name]: value }));
    setSubmitError("");
    setSuccess("");
  }

  async function handleAdd() {
    if (submitting.current || isLoading || loadError) return;
    setHasSubmitted(true);
    setSubmitError("");
    setSuccess("");
    if (Object.keys(validateExpense(fields)).length) return;

    submitting.current = true;
    setIsSubmitting(true);
    try {
      await addExpense({
        amount: Number(fields.amount),
        category: fields.category as Category,
        spent_on: fields.spentOn,
        note: fields.note,
      });
      // Thành công: làm trống form và ẩn lỗi của các ô vừa được xóa.
      setFields(emptyForm);
      setHasSubmitted(false);
      setSuccess("Expense added");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to add expense.");
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="min-w-0">
      <CardHeader><h2 className="text-xl font-semibold">Add an expense</h2></CardHeader>
      <CardContent>
        <form
          noValidate
          data-testid="expense-form"
          className="space-y-4"
          onSubmit={async (event) => { event.preventDefault(); await handleAdd(); }}
        >
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input id="amount" type="number" inputMode="decimal" step="0.01" name="amount"
              data-testid="input-amount" value={fields.amount}
              onChange={(event) => updateField("amount", event.target.value)}
              disabled={isSubmitting} aria-invalid={Boolean(errors.amount)}
              aria-describedby={errors.amount ? "error-amount" : undefined} />
            <FieldError name="error-amount" message={errors.amount} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <select id="category" name="category" data-testid="select-category"
              className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
              value={fields.category} onChange={(event) => updateField("category", event.target.value)}
              disabled={isSubmitting} aria-invalid={Boolean(errors.category)}
              aria-describedby={errors.category ? "error-category" : undefined}>
              <option value="">Choose category</option>
              {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <FieldError name="error-category" message={errors.category} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spent-on">Date</Label>
            <Input id="spent-on" type="date" name="spent_on" data-testid="input-date"
              value={fields.spentOn} onChange={(event) => updateField("spentOn", event.target.value)}
              disabled={isSubmitting} aria-invalid={Boolean(errors.spentOn)}
              aria-describedby={errors.spentOn ? "error-date" : undefined} />
            <FieldError name="error-date" message={errors.spentOn} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Note (optional)</Label>
            <Input id="note" name="note" data-testid="input-note" value={fields.note}
              onChange={(event) => updateField("note", event.target.value)}
              disabled={isSubmitting} aria-invalid={Boolean(errors.note)}
              aria-describedby={errors.note ? "error-note" : undefined} />
            <FieldError name="error-note" message={errors.note} />
          </div>
          <FieldError name="error-expense" message={submitError} />
          {success && <p role="status" data-testid="expense-success" className="text-sm text-green-700">{success}</p>}
          <Button type="submit" data-testid="btn-add-expense" className="w-full"
            disabled={isSubmitting || isLoading || Boolean(loadError)} aria-busy={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add expense"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
