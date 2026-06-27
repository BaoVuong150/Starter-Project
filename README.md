# 🚀 O2O Omnichannel Starter Kit (Modular Monolith .NET 10 & React 19)

Đây là mã nguồn mẫu (Starter Template) được tối ưu hóa cao cho các dự án thương mại điện tử đa kênh (O2O). Dự án được thiết kế theo cấu trúc mô-đun độc lập (Modular Monolith) ở Backend và chia theo tính năng (Feature-based) ở Frontend, sẵn sàng để nhân bản và tuỳ chỉnh thương hiệu (White-labeling).

---

## 🛠️ Chi tiết các mô-đun và API hiện có

### 1. Mô-đun Xác thực (Auth Module)
Mô-đun quản lý toàn bộ luồng đăng ký, đăng nhập và bảo mật phiên hoạt động của người dùng.
* **Đăng ký tài khoản (`POST /api/auth/register`):**
  * Đầu vào: `email`, `password`, `firstName`, `lastName`.
  * Đầu ra: Trả về thông tin cơ bản của tài khoản vừa tạo (User DTO) sau khi đã mã hóa bảo mật mật khẩu.
* **Đăng nhập (`POST /api/auth/login`):**
  * Đầu vào: `email`, `password`.
  * Trả về: Access Token (chuỗi JWT ngắn hạn dùng để gọi API).
  * **Cơ chế bảo mật:** Tự động tạo và lưu trữ Refresh Token dài hạn vào **HTTPOnly Cookie** (cấu hình `Secure`, `SameSite=None` cho phép truyền chéo tên miền) để bảo vệ tối đa chống tấn công XSS/CSRF.
* **Làm mới phiên làm việc (`POST /api/auth/refresh`):**
  * Tự động lấy Refresh Token từ HTTPOnly Cookie (hoặc body yêu cầu) kết hợp Access Token cũ để cấp Access Token mới cùng Refresh Token mới.
* **Đăng xuất (`POST /api/auth/logout`):**
  * Yêu cầu xác thực. Thu hồi (Revoke) Refresh Token trong cơ sở dữ liệu và xóa bỏ HTTPOnly Cookie ở phía Client.

---

### 2. Mô-đun Người dùng (Users Module)
Mô-đun quản lý thông tin hồ sơ và thông tin cá nhân của người dùng. Mọi API trong mô-đun này đều yêu cầu xác thực JWT (`[Authorize]`).
* **Lấy thông tin cá nhân (`GET /api/users/profile`):**
  * Lấy `userId` từ Token JWT đang đăng nhập để truy vấn thông tin chi tiết: Họ tên, email, ngày sinh, đường dẫn ảnh đại diện (avatarUrl), trạng thái hoạt động (isActive) và ngày tạo tài khoản.
* **Cập nhật thông tin cá nhân (`PUT /api/users/profile`):**
  * Cho phép người dùng chỉnh sửa thông tin cá nhân gồm: `firstName`, `lastName`, `avatarUrl`, `dateOfBirth`.

---

### 3. Cấu hình Kỹ thuật & Tự vệ Hệ thống

#### Hệ cơ sở dữ liệu tối ưu (PostgreSQL 15 & EF Core)
* **Connection Pooling:** Sử dụng `AddDbContextPool` để tái sử dụng kết nối, tăng tốc độ truy vấn gấp 10 lần và tránh quá tải cổng kết nối.
* **Mạng chập chờn:** Tự động thử lại khi lỗi kết nối mạng tạm thời (`EnableRetryOnFailure` tối đa 3 lần, delay tối đa 5 giây).
* **Tránh treo luồng:** Thiết lập `CommandTimeout` tối đa 30 giây để tự hủy các câu lệnh nghẽn mạng hoặc kẹt khóa (deadlock).

#### Bộ nhớ đệm tự vệ (Redis 7 Cache)
* **Khởi động bền bỉ:** Cấu hình `abortConnect=false` cho phép Web Server hoạt động bình thường kể cả khi Redis đang offline lúc khởi động.
* **Không làm nghẽn luồng:** Giới hạn thời gian kết nối `connectTimeout=5000` (5 giây) để tránh treo Web Server khi Redis phản hồi chậm.

#### Bảo mật Tần suất Yêu cầu (Rate Limiting)
* **Global Rate Limiting:** Tự động chặn các IP gửi spam request bằng thuật toán **Fixed Window**. Giới hạn tối đa **100 requests/phút** trên mỗi IP (đối chiếu qua kết nối trực tiếp hoặc thông qua proxy `X-Forwarded-For`).
* Trả về mã lỗi tiêu chuẩn `429 Too Many Requests`.

#### Tài liệu API (Scalar API Docs)
* Sử dụng chuẩn **OpenAPI** kết hợp giao diện **Scalar** hiện đại để hiển thị tài liệu và chạy thử nghiệm trực tiếp các API Module (chỉ hiển thị ở môi trường Development).

---

### 4. Giao diện Frontend (React 19, Vite 8 & Tailwind CSS v4)
* **Kiến trúc Feature-Based:** Chia code độc lập theo thư mục tính năng (`features/auth`, `features/products`) tránh liên kết chéo bừa bãi.
* **Thiết kế:** Light Mode Glassmorphism (sáng mờ kính) sang trọng với màu sắc chủ đạo Indigo & Slate, sử dụng **Tailwind CSS v4** kết hợp **Ant Design v6**.
* **Đường dẫn có sẵn:**
  * Trang chủ bán hàng tĩnh: `/`
  * Trang đăng nhập: `/login` (đã tích hợp nút login giả lập liên kết Zustand Store để kiểm tra đổi trạng thái header).
  * Trang đăng ký: `/register` (placeholder tĩnh).

---

## 📂 Cấu trúc Thư mục Dự án

```text
├── backend/                   # Mã nguồn Backend (.NET 10.0)
│   ├── Api/                   # Dự án API chính (Entry Point)
│   │   ├── Modules/           # Các mô-đun nghiệp vụ (Users, Auth)
│   │   └── Shared/            # Cấu hình dùng chung (DB, Redis, Extensions, Exception)
│   └── BackendSolution.slnx   # Solution quản lý dự án
├── frontend/                  # Giao diện Frontend (React 19 + Vite 8)
│   ├── src/
│   │   ├── config/            # Cấu hình Axios, routing
│   │   ├── features/          # Tính năng (auth, products)
│   │   ├── layouts/           # Khung giao diện (Storefront, Auth)
│   │   └── types/             # Kiểu dữ liệu TypeScript dùng chung
│   └── vite.config.ts         # Cấu hình Vite & Tailwind v4
└── docker-compose.yml         # Container chạy Postgres, Redis & Frontend
```

---

## ⚡ Hướng dẫn Khởi chạy Dự án

1. **Khởi động Database & Cache & Frontend:**
   Mở terminal tại thư mục gốc và chạy lệnh:
   ```bash
   docker compose up -d
   ```
2. **Chạy Backend:**
   Mở terminal tại thư mục `backend/Api` và chạy:
   ```bash
   dotnet run
   ```

* **Giao diện bán hàng (Storefront):** http://localhost:5173
* **Tài liệu API (Scalar Docs):** http://localhost:5000/scalar/v1
