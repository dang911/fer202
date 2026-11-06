# ShelfLife

Ứng dụng quản lý sách theo đề FER202 PE1 FALL 2026: Next.js App Router, TypeScript, Tailwind CSS, ShadCN UI và Supabase. React Context quản lý phiên đăng nhập, sách, bộ lọc, tìm kiếm và thống kê.

## Chạy dự án

1. Dùng Node.js 24. Chạy `npm install` nếu chưa có thư viện.
2. Giữ `.env.local` hiện có hoặc sao chép `.env.example` thành `.env.local`. Chỉ cần hai biến:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

3. Trong SQL Editor của đúng project Supabase, chạy toàn bộ `supabase/books.sql`. File tạo bảng books, constraints, index, RLS và policies. Có thể chạy lại trên bảng do file này tạo mà không xóa dữ liệu. File không xóa bảng expenses cũ. Không dùng service_role/secret key trong ứng dụng.
4. Tắt Confirm email trong cấu hình Email của Supabase Auth để đăng ký dùng được ngay và email trùng trả lỗi.
5. Chạy `npm run dev`, mở địa chỉ Local trong terminal. Khởi động lại server sau khi thay đổi biến môi trường.

## Chức năng

- `/`: trang chủ ShelfLife, ba feature cards, header thay đổi theo phiên đăng nhập.
- `/register`: đăng ký thật, xác thực email/password/confirm password, thông báo đúng đề.
- `/login`: đăng nhập thật, chuyển tới `/books`.
- `/books`: bảo vệ theo phiên, thêm/xóa sách, chuyển To Read → Reading → Finished, lọc trạng thái và tìm theo title/author. Thống kê tính trên kết quả đang hiển thị.

Sách được tải khi xác định người dùng và giữ trong Context qua các lần chuyển trang; token refresh không tải lại sách. Đăng xuất hoặc đổi tài khoản xóa dữ liệu và bộ lọc cũ. RLS chỉ cho phép người đã đăng nhập đọc/thêm/xóa sách của mình và cập nhật cột status của sách của mình. Cột pages dùng NUMERIC không scale cùng CHECK để từ chối số lẻ gửi thẳng qua API thay vì làm tròn.

## Kiểm tra

```powershell
npm run lint
npm test
npm run build
```

Kiểm tra trên trình duyệt với Supabase đã thiết lập:

- Đăng ký tài khoản mới, email trùng; đăng nhập đúng/sai mật khẩu.
- Khi đăng xuất, `/books` chuyển về `/login`, không chớp nội dung riêng tư.
- Gửi form sách trống: bốn lỗi đúng đề; sửa hợp lệ thì lỗi biến mất.
- Thử giới hạn 80 ký tự cho title, 60 cho author, pages nguyên trong 1–5000.
- Thêm sách: hiện đầu danh sách, form xóa trắng, Book added; tải lại vẫn còn.
- Advance hai lần, nút biến mất ở Finished; tải lại vẫn đúng trạng thái.
- Kết hợp search với status, thử không có kết quả, Clear và kiểm tra summary.
- Xóa sách và tải lại. Đổi tài khoản để kiểm tra không lộ dữ liệu người trước.
- Kiểm tra độ rộng 375 px và 1280 px.
- Gọi API bằng anon và hai tài khoản để kiểm tra RLS, user_id giả và dữ liệu không hợp lệ.

## Giữ link hiện tại

Giữ repository GitHub và project Vercel đang liên kết. Đưa code mới lên nhánh Production đang cấu hình để cập nhật domain Production hiện tại. Giữ hai biến môi trường Supabase trên Vercel rồi redeploy; tắt Vercel Authentication để giảng viên truy cập được. Việc sửa code local không tự cập nhật database hoặc website đã deploy.

## Bài nộp

Tạo một thư mục chứa `<MA_SINH_VIEN>.docx` và `<MA_SINH_VIEN>.zip`. Dùng thông tin thật của mình, không dùng tên và mã ví dụ trong đề.

Nội dung Word theo mẫu của đề, các URL hiển thị nguyên dạng có https://:

```text
Student Code: <MA_SINH_VIEN>
Full Name: <HO_TEN>
GitHub Repository URL: https://github.com/<username>/<repository>
Vercel Production URL: https://<project>.vercel.app
Supabase Project URL: https://<project>.supabase.co
Supabase anon (public) key: <ANON_PUBLIC_KEY>
Test account email: <EMAIL_TAI_KHOAN_CHAM_BAI>
Test account password: <MAT_KHAU_TAI_KHOAN_CHAM_BAI>
```

Tạo sẵn tài khoản chấm bài và đăng nhập thử trên Production. Repository phải public và khớp code trong zip. Đặt package.json ngay gốc zip, kèm lock file, app/, components/, lib/, public/, components.json, supabase/books.sql, .env.example và các file cấu hình. Không đưa node_modules, .next, .git, file cache hoặc bất kỳ file env chứa giá trị thật nào vào zip. .env.example chỉ liệt kê hai tên biến với giá trị trống.
