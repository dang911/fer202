"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  // router dùng để chuyển trang sau khi Supabase xác nhận đăng nhập thành công.
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");

  // Giống Register: lỗi chỉ hiện sau lần gửi đầu tiên và cập nhật khi sửa ô nhập.
  const emailError = !email.trim()
    ? "Email is required"
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? "Please enter a valid email address"
      : "";

  // Theo đề, Login chỉ kiểm tra mật khẩu trống; giới hạn 6 ký tự áp dụng ở Register.
  const passwordError = !password ? "Password is required" : "";

  async function handleLogin() {
    if (isSubmitting) return;

    setHasSubmitted(true);
    setAuthError("");
    if (emailError || passwordError) return;

    setIsSubmitting(true);
    try {
      // Supabase tự kiểm tra tài khoản và lưu phiên đăng nhập khi thành công.
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        // Ví dụ sai mật khẩu: hiển thị nguyên văn thông báo từ Supabase.
        setAuthError(error.message);
        return;
      }

      if (!data.session) {
        setAuthError("Unable to sign in. Please try again.");
        return;
      }

      // replace giúp nút Back không quay lại form Login vừa gửi.
      router.replace("/expenses");
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Unable to sign in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl font-bold">Login</h1>
          <p className="text-muted-foreground">
            Sign in to your SpendWise account.
          </p>
        </CardHeader>
        <CardContent>
          <form
            noValidate
            data-testid="login-form"
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              await handleLogin();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                data-testid="login-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
                aria-invalid={hasSubmitted && Boolean(emailError)}
                aria-describedby={
                  hasSubmitted && emailError ? "error-email" : undefined
                }
              />
              {hasSubmitted && emailError && (
                <p
                  id="error-email"
                  data-testid="error-email"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                data-testid="login-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
                aria-invalid={hasSubmitted && Boolean(passwordError)}
                aria-describedby={
                  hasSubmitted && passwordError ? "error-password" : undefined
                }
              />
              {hasSubmitted && passwordError && (
                <p
                  id="error-password"
                  data-testid="error-password"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {passwordError}
                </p>
              )}
            </div>

            {authError && (
              <p
                data-testid="error-auth"
                role="alert"
                className="text-sm text-destructive"
              >
                {authError}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              data-testid="login-submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Login"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline underline-offset-4">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
