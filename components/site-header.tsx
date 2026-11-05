"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useSpendWise } from "@/components/providers/spendwise-provider";
import { supabase } from "@/lib/supabase";

export function SiteHeader() {
  const { session } = useSpendWise();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authError, setAuthError] = useState("");
  const loggingOut = useRef(false);

  async function handleLogout() {
    if (loggingOut.current) return;
    loggingOut.current = true;
    setIsLoggingOut(true);
    setAuthError("");
    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) setAuthError(error.message);
      // Context nhận SIGNED_OUT và xóa dữ liệu; header tự trở về Login/Register.
      // Trang /expenses tự chuyển về /login, còn người ở trang chủ vẫn ở đó.
    } catch (error) {
      setAuthError(
        error instanceof Error ? error.message : "Unable to log out. Please try again.",
      );
    } finally {
      loggingOut.current = false;
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight">
          <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-700 text-white">
            <Wallet className="size-5" aria-hidden="true" />
          </span>
          SpendWise
        </Link>
        {/* Chờ xác định phiên để không hiện nhầm trạng thái đăng xuất lúc tải trang. */}
        {session === undefined ? (
          <span role="status" className="text-sm text-muted-foreground">Loading account...</span>
        ) : session ? (
          <nav aria-label="Account" className="flex min-w-0 flex-wrap items-center gap-3">
            <span data-testid="user-email" className="min-w-0 break-all text-sm text-muted-foreground">
              {session.user.email}
            </span>
            <Link href="/expenses" data-testid="link-expenses" className={buttonVariants({ variant: "outline" })}>
              Expenses
            </Link>
            <Button type="button" data-testid="btn-logout" onClick={handleLogout}
              disabled={isLoggingOut} aria-busy={isLoggingOut}>
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </nav>
        ) : (
          <nav aria-label="Account" className="flex items-center gap-2">
            <Link href="/login" data-testid="btn-login" className={buttonVariants({ variant: "outline" })}>
              Login
            </Link>
            <Link href="/register" data-testid="btn-register" className={buttonVariants()}>
              Register
            </Link>
          </nav>
        )}
      </div>
      {authError && (
        <p role="alert" className="mx-auto max-w-6xl px-4 pb-4 text-sm text-destructive sm:px-6">
          {authError}
        </p>
      )}
    </header>
  );
}
