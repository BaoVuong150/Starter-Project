---
trigger: always_on
---

# 📐 QUY TẮC PHÁT TRIỂN FRONTEND (FEATURE-BASED ARCHITECTURE)

Dự án này được thiết kế theo cấu trúc Feature-Based Architecture (Kiến trúc chia theo tính năng). Tất cả các AI Assistant khi code Frontend cho dự án này BẮT BUỘC phải tuân thủ nghiêm ngặt 9 quy tắc vàng dưới đây để giữ hệ thống sạch sẽ, dễ mở rộng và dễ bóc tách:

## 1. Không import chéo thành phần nội bộ của Feature khác
- **QUY TẮC:** Một feature (ví dụ: `orders`) không bao giờ được phép import trực tiếp một component, hook, store hay service cục bộ của feature khác (ví dụ: `users`).
- **THỰC THI:** 
  - Nếu cần dùng chung, thành phần đó phải được di chuyển ra thư mục Shared tương ứng ở ngoài (`src/components`, `src/hooks`, `src/utils`...).
  - Hoặc feature đó phải export công khai qua file `index.ts` ở thư mục gốc của feature để các feature khác tham chiếu gián tiếp qua cổng này.

## 2. Không gọi API trực tiếp từ Component hay Page
- **QUY TẮC:** Cấm tuyệt đối việc sử dụng `axios`, `fetch` hoặc các API client thô trực tiếp bên trong các file Component hay Page.
- **THỰC THI:** 
  - Mọi API call phải được khai báo trong thư mục `services/` của feature đó (hoặc `src/config/` nếu là client dùng chung).
  - Khuyến khích bọc các API call qua Custom Hooks (sử dụng `@tanstack/react-query` hoặc hooks tự viết) để quản lý state loading, error và cache trước khi đưa vào component sử dụng.

## 3. Không dùng chung một Global Store khổng lồ
- **QUY TẮC:** Không lưu trữ tất cả trạng thái (state) của toàn bộ ứng dụng vào một file Store duy nhất.
- **THỰC THI:** 
  - Trạng thái của feature nào phải được quản lý bằng Store riêng (Zustand/Context) nằm trong thư mục `store/` của feature đó (ví dụ: `features/auth/store/useAuthStore.ts`).
  - Chỉ các trạng thái thực sự mang tính toàn cục (như Theme sáng/tối, ngôn ngữ) mới được phép đưa ra thư mục `src/context` hoặc `src/store` dùng chung.

## 4. Layout và Định tuyến tập trung
- **QUY TẮC:** Cấm khai báo Route rải rác hoặc nhúng cứng cấu trúc Layout tùy tiện trong các Component nghiệp vụ.
- **THỰC THI:** 
  - Tất cả các Route và phân quyền truy cập (Protected Routes) phải được định nghĩa tập trung (ví dụ trong `src/config/routes.tsx` hoặc module routing chuẩn).
  - Tách biệt phần khung giao diện (như Sidebar, Header) ra các tệp tin Layout trong `src/layouts` để tái sử dụng một cách thống nhất.

## 5. Tách biệt Logic ra khỏi Component (Dumb Components / UI Only)
- **QUY TẮC:** Component/Page không được phép chứa logic nghiệp vụ, xử lý dữ liệu phức tạp, xử lý validation form, hay gọi trực tiếp logic API. Component chỉ làm nhiệm vụ hiển thị giao diện (Render UI) và bắt các event đơn giản từ người dùng.
- **THỰC THI:** 
  - Toàn bộ logic (quản lý state, handlers, form validation, filter/sort dữ liệu) phải được tách ra các **Custom Hooks** (ví dụ: `useLoginForm.ts`, `useUserTable.ts`) nằm trong thư mục `hooks/` của feature hoặc shared.
  - Component sẽ gọi Custom Hook để lấy ra dữ liệu và các event handler cần thiết nhằm render UI.

## 6. Ép kiểu nghiêm ngặt (Strict TypeScript)
- **QUY TẮC:** Cấm tuyệt đối việc sử dụng kiểu `any` trong toàn bộ codebase. Mọi biến, tham số hàm, state, và dữ liệu API trả về phải được định nghĩa kiểu rõ ràng.
- **THỰC THI:** 
  - Khai báo các interface/types tương ứng trong thư mục `types/` của feature hoặc shared.
  - Phải đồng bộ chính xác các thuộc tính kiểu dữ liệu từ DTO của Backend.

## 7. Bảo mật Access Token (Security)
- **QUY TẮC:** Không lưu trữ Access Token trong `localStorage` hoặc `sessionStorage` để phòng ngừa tấn công XSS (Cross-Site Scripting).
- **THỰC THI:** 
  - Lưu Access Token trực tiếp trong bộ nhớ RAM ứng dụng (ví dụ: Zustand store hoặc React State).
  - Sử dụng cơ chế Refresh Token được lưu trong `HttpOnly Cookie` (cấu hình `Secure`, `SameSite=None/Lax`) do Backend trả về để tự động lấy lại Access Token mới.

## 8. Lazy Loading trang (Performance)
- **QUY TẮC:** Tránh import tĩnh (static import) tất cả các Pages ở tệp cấu hình Routes chính, gây phình dung lượng bundle load ban đầu.
- **THỰC THI:** Bắt buộc sử dụng `React.lazy` kết hợp thẻ `Suspense` và một component loading dạng Skeleton/Spinner khi khai báo định tuyến các trang (Pages).

## 9. Xử lý lỗi tập trung (Error Boundary / Interceptors)
- **QUY TẮC:** Hạn chế viết các khối `try-catch` lặp đi lặp lại hoặc tự hiển thị thông báo lỗi (Toast/Alert) thủ công ở từng component/page.
- **THỰC THI:** 
  - Sử dụng Axios Interceptors ở tầng Shared để tự động bắt các mã lỗi HTTP từ Backend (401, 403, 500...).
  - Kết hợp cấu hình global `onError` trong React Query để tự động gọi Toast thông báo lỗi tới người dùng một cách tập trung.
