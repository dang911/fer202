"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useShelfLife } from "@/components/providers/shelflife-provider";
import { STATUSES, validateBook, type BookFields, type BookStatus } from "@/lib/books";

const emptyForm: BookFields = { title: "", author: "", pages: "", status: "" };

function FieldError({ name, message }: { name: string; message?: string }) {
  if (!message) return null;
  return <p id={name} data-testid={name} role="alert" className="text-sm text-destructive">{message}</p>;
}

export function BookForm() {
  const { addBook, isLoading } = useShelfLife();
  const [fields, setFields] = useState<BookFields>(emptyForm);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");
  const submitting = useRef(false);
  const errors = hasSubmitted ? validateBook(fields) : {};

  function updateField(name: keyof BookFields, value: string) {
    setFields((previous) => ({ ...previous, [name]: value }));
    setSubmitError("");
    setSuccess("");
  }

  async function handleAdd() {
    if (submitting.current || isLoading) return;
    setHasSubmitted(true);
    setSubmitError("");
    setSuccess("");
    if (Object.keys(validateBook(fields)).length) return;

    submitting.current = true;
    setIsSubmitting(true);
    try {
      await addBook({ title: fields.title, author: fields.author,
        pages: Number(fields.pages), status: fields.status as BookStatus });
      setFields(emptyForm);
      setHasSubmitted(false);
      setSuccess("Book added");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to add book.");
    } finally {
      submitting.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="min-w-0">
      <CardHeader><h2 className="text-xl font-semibold">Add a book</h2></CardHeader>
      <CardContent>
        <form noValidate data-testid="book-form" className="space-y-4"
          onSubmit={async (event) => { event.preventDefault(); await handleAdd(); }}>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" data-testid="input-title" value={fields.title}
              onChange={(event) => updateField("title", event.target.value)}
              disabled={isSubmitting} aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "error-title" : undefined} />
            <FieldError name="error-title" message={errors.title} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <Input id="author" name="author" data-testid="input-author" value={fields.author}
              onChange={(event) => updateField("author", event.target.value)}
              disabled={isSubmitting} aria-invalid={Boolean(errors.author)}
              aria-describedby={errors.author ? "error-author" : undefined} />
            <FieldError name="error-author" message={errors.author} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pages">Pages</Label>
            <Input id="pages" name="pages" type="number" inputMode="numeric" step="1"
              data-testid="input-pages" value={fields.pages}
              onChange={(event) => updateField("pages", event.target.value)}
              disabled={isSubmitting} aria-invalid={Boolean(errors.pages)}
              aria-describedby={errors.pages ? "error-pages" : undefined} />
            <FieldError name="error-pages" message={errors.pages} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select id="status" name="status" data-testid="select-status"
              className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm"
              value={fields.status} onChange={(event) => updateField("status", event.target.value)}
              disabled={isSubmitting} aria-invalid={Boolean(errors.status)}
              aria-describedby={errors.status ? "error-status" : undefined}>
              <option value="">Choose status</option>
              {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
            <FieldError name="error-status" message={errors.status} />
          </div>
          <FieldError name="error-book" message={submitError} />
          {success && <p role="status" data-testid="book-success" className="text-sm text-green-700">{success}</p>}
          <Button type="submit" data-testid="btn-add-book" className="w-full"
            disabled={isSubmitting || isLoading} aria-busy={isSubmitting}>
            {isSubmitting ? "Adding..." : "Add book"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
