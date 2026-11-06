// Cho phép component dùng React state và xử lý sự kiện như onChange, onSubmit.
"use client";

import { useState } from "react";
import Link from "next/link";

// Các component ShadCN đã có trong dự án, dùng để tạo giao diện form.
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Client dùng URL và anon key trong .env.local để kết nối Supabase.
import { supabase } from "@/lib/supabase";

// File app/register/page.tsx tạo trang có đường dẫn /register.
export default function RegisterPage() {
  // Mỗi state lưu nội dung một ô nhập; giá trị ban đầu là chuỗi rỗng.
  // Ví dụ: email là giá trị hiện tại, setEmail là hàm cập nhật giá trị đó.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Chỉ hiện lỗi sau lần bấm Register đầu tiên.
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Theo dõi yêu cầu đăng ký và thông báo do Supabase trả về.
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Tính lại lỗi từ dữ liệu hiện tại mỗi khi state thay đổi.
  // Vì vậy, sửa một ô cho hợp lệ sẽ làm lỗi của ô đó tự biến mất.
  const emailError = !email.trim()
    ? "Email is required"
    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ? "Please enter a valid email address"
      : "";

  const passwordError = !password
    ? "Password is required"
    : password.length < 6
      ? "Password must be at least 6 characters"
      : "";

  // So sánh với password hiện tại: lỗi cũng cập nhật khi sửa ô Password.
  const confirmPasswordError = !confirmPassword
    ? "Confirm password is required"
    : confirmPassword !== password
      ? "Passwords do not match"
      : "";

  async function handleRegister() {
    // Ngăn gửi thêm yêu cầu trong khi lần đăng ký trước đang chạy.
    if (isSubmitting) return;

    setHasSubmitted(true);
    setAuthError("");
    setSuccessMessage("");

    // Có lỗi ở bất kỳ ô nào thì dừng, chưa gửi dữ liệu tới Supabase.
    if (emailError || passwordError || confirmPasswordError) return;

    setIsSubmitting(true);

    try {
      // Chỉ gửi email và password; confirmPassword chỉ dùng để kiểm tra trên form.
      // trim() bỏ khoảng trắng thừa ở email, giữ nguyên mật khẩu người dùng nhập.
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        // Giữ nguyên thông báo Supabase, ví dụ khi email đã được đăng ký.
        setAuthError(error.message);
        return;
      }

      // Chỉ báo thành công khi Supabase thực sự trả về tài khoản.
      if (!data.user) {
        setAuthError("Unable to create account. Please try again.");
        return;
      }

      setSuccessMessage("Registration successful");
    } catch (error) {
      // Xử lý cả lỗi ngoài phản hồi thông thường, chẳng hạn kết nối bị gián đoạn.
      setAuthError(
        error instanceof Error
          ? error.message
          : "Unable to register. Please try again.",
      );
    } finally {
      // Luôn cho phép bấm lại nút, dù thành công hay thất bại.
      setIsSubmitting(false);
    }
  }

  return (
    // flex-1 chiếm phần không gian còn lại; căn giữa form và chừa lề bằng p-4.
    <main className="flex flex-1 items-center justify-center p-4">
      {/* w-full co theo màn hình nhỏ; max-w-md giới hạn chiều rộng trên màn hình lớn. */}
      <Card className="w-full max-w-md">
        {/* Phần tiêu đề và mô tả của khung đăng ký. */}
        <CardHeader>
          <h1 className="text-2xl font-bold">Register</h1>
          <p className="text-muted-foreground">
            Create your ShelfLife account.
          </p>
        </CardHeader>

        <CardContent>
          {/*
            noValidate: tắt kiểm tra mặc định của trình duyệt để tự viết thông báo đúng đề.
            data-testid: tên cố định để công cụ chấm bài tìm đúng phần tử.
            preventDefault(): ngăn gửi form theo cách mặc định và tải lại trang.
            handleRegister(): kiểm tra dữ liệu rồi gọi Supabase tạo tài khoản.
            space-y-4: tạo khoảng cách dọc giữa các phần tử trong form.
          */}
          <form
            noValidate
            data-testid="register-form"
            onSubmit={async (event) => {
              event.preventDefault();
              await handleRegister();
            }}
            className="space-y-4"
          >
            {/* htmlFor của Label trùng id của Input: bấm nhãn sẽ đưa con trỏ vào ô nhập. */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {/*
                type=email xác định loại ô; autoComplete=email hỗ trợ điền email đã lưu.
                value lấy nội dung từ state; onChange cập nhật state mỗi khi người dùng gõ.
              */}
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                data-testid="register-email"
                value={email}
                disabled={isSubmitting}
                onChange={(event) => setEmail(event.target.value)}
                aria-invalid={hasSubmitted && Boolean(emailError)}
                aria-describedby={
                  hasSubmitted && emailError ? "error-email" : undefined
                }
              />
              {/* Chỉ tạo phần tử thông báo khi đã bấm Register và ô này có lỗi. */}
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

            {/* type=password che nội dung; new-password gợi ý đây là mật khẩu mới. */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                data-testid="register-password"
                value={password}
                disabled={isSubmitting}
                onChange={(event) => setPassword(event.target.value)}
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

            {/* Ô nhập lại mật khẩu; validation kiểm tra hai mật khẩu có trùng nhau. */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                data-testid="register-confirm-password"
                value={confirmPassword}
                disabled={isSubmitting}
                onChange={(event) => setConfirmPassword(event.target.value)}
                aria-invalid={hasSubmitted && Boolean(confirmPasswordError)}
                aria-describedby={
                  hasSubmitted && confirmPasswordError
                    ? "error-confirm-password"
                    : undefined
                }
              />
              {hasSubmitted && confirmPasswordError && (
                <p
                  id="error-confirm-password"
                  data-testid="error-confirm-password"
                  role="alert"
                  className="text-sm text-destructive"
                >
                  {confirmPasswordError}
                </p>
              )}
            </div>

            {/* Chỉ render thông báo khi có nội dung, dùng đúng testid và chữ theo đề. */}
            {authError && (
              <p
                data-testid="error-auth"
                role="alert"
                className="text-sm text-destructive"
              >
                {authError}
              </p>
            )}
            {successMessage && (
              <p
                data-testid="form-success"
                role="status"
                className="text-sm text-green-700"
              >
                {successMessage}
              </p>
            )}

            {/* Khóa nút lúc chờ Supabase để tránh bấm đăng ký nhiều lần. */}
            <Button
              type="submit"
              className="w-full"
              data-testid="register-submit"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register"}
            </Button>
          </form>
          {/* Link chuyển sang trang đăng nhập mà không tải lại toàn bộ ứng dụng. */}
          <p className="mt-4 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
