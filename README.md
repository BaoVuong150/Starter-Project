# 🚀 O2O Omnichannel Starter Kit (Modular Monolith .NET 10 & React 19)

Đây là mã nguồn mẫu (Starter Template) được tối ưu hóa cao cho các dự án thương mại điện tử đa kênh (O2O). Dự án được thiết kế theo cấu trúc mô-đun độc lập (Modular Monolith) ở Backend và chia theo tính năng (Feature-based) ở Frontend, sẵn sàng để nhân bản và tuỳ chỉnh thương hiệu (White-labeling).

---

## 🛠️ Công nghệ & Tính năng nổi bật

### 1. Backend (.NET 10.0 & ASP.NET Core)
* **Kiến trúc Modular Monolith:** Các nghiệp vụ (`Auth`, `Users`) được tách biệt thành các mô-đun riêng biệt, độc lập dữ liệu, sẵn sàng chuyển đổi thành Microservices khi cần.
* **Hệ cơ sở dữ liệu tối ưu (PostgreSQL 15):**
  * Sử dụng **Connection Pooling** (`AddDbContextPool`) để tối ưu hiệu năng kết nối gấp 10 lần.
  * Tự động thử lại khi lỗi mạng chập chờn (`EnableRetryOnFailure` tối đa 35 lần).
  * Giới hạn thời gian chạy câu lệnh (`CommandTimeout` 30s) chống treo luồng.
* **Bộ nhớ đệm tự vệ (Redis 7 Cache):** Cấu hình `abortConnect=false` và timeout kết nối 5 giây giúp Web Server hoạt động bình thường kể cả khi Redis gặp sự cố.
* **Bảo mật & Giới hạn tần suất:** Tích hợp **Global Rate Limiting** toàn cục (Fixed Window, tối đa 100 requests/phút từ cùng một IP) chống spam API và brute-force.
* **Tài liệu API tự động:** Tích hợp **OpenAPI & Scalar Reference API Docs** tuyệt đẹp tại môi trường Development.

### 2. Frontend (React 19, Vite 8 & Tailwind CSS v4)
* **Kiến trúc Feature-Based:** Tổ chức code tách biệt theo tính năng (như `products`, `auth`) ngăn chặn việc import chéo và giữ code sạch sẽ.
* **Styling hiện đại:** Sử dụng **Tailwind CSS v4** mới nhất kết hợp với thư viện **Ant Design v6** theo chủ đề **Light Mode Glassmorphism** (sáng mờ kính tông màu Indigo & Slate).
* **Quản lý trạng thái:** Sử dụng **Zustand v5** quản lý Auth state trong bộ nhớ RAM (bảo mật Access Token) và **TanStack React Query v5** quản lý cache dữ liệu API.
* **Định tuyến & Lazy Loading:** Sử dụng React Lazy Loading để tải trang bất đồng bộ, cải thiện hiệu năng tải trang đầu tiên.
* **Hỗ trợ Docker:** Cấu hình file-watch polling giúp Hot Reload hoạt động mượt mà chéo hệ điều hành.

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

### Yêu cầu hệ thống
* Đã cài đặt **Docker Desktop** và **.NET 10 SDK**.

### Các bước khởi chạy

1. **Khởi động Database & Cache & Frontend:**
   Mở terminal tại thư mục gốc và chạy lệnh:
   ```bash
   docker compose up -d
   ```
   *Lệnh này sẽ tự động tải các package frontend và khởi chạy Vite Server chạy trên cổng `5173`.*

2. **Chạy Backend:**
   Mở dự án Backend trên Visual Studio / Rider hoặc chạy lệnh Terminal tại thư mục `backend/Api`:
   ```bash
   dotnet run
   ```
   *Backend sẽ chạy trên cổng http://localhost:5000 (HTTPS: https://localhost:5001).*

### Đường dẫn truy cập nhanh
* **Giao diện bán hàng (Storefront):** http://localhost:5173
* **Tài liệu API (Scalar Docs):** http://localhost:5000/scalar/v1
