# 📐 HƯỚNG DẪN KIẾN TRÚC & NGUYÊN TẮC THIẾT KẾ DỰ ÁN

Tài liệu này lưu trữ các nguyên tắc thiết kế cốt lõi của hệ thống **Modular Monolith** kết hợp **Clean Architecture** của dự án Backend .NET 10. Lập trình viên bắt buộc phải đọc và tuân thủ các nguyên tắc này khi phát triển các module tiếp theo để đảm bảo hệ thống có thể tách thành **Microservices** một cách dễ dàng nhất khi cần thiết.

---

## I. BẢN ĐỒ KIẾN TRÚC HIỆN TẠI (Dự án đã giải quyết được gì?)

1. **Ranh giới Module sạch sẽ:**
   - Module `Users` đã được gom gọn trong thư mục `Modules/Users`.
   - Các API Endpoint (`UsersController`) chỉ giao tiếp với Application layer thông qua Interface `IUserService`, không phụ thuộc vào lớp thực thi cụ thể nào.
2. **Hệ thống bắt lỗi tập trung (Global Exception Handling):**
   - Đã cấu hình chốt chặn bảo vệ `GlobalExceptionHandler` ở Shared.
   - Sử dụng lớp lỗi cơ sở `CustomException` ở Shared kết hợp `UserDomainException` trong Module để tự động dịch lỗi nghiệp vụ sang mã lỗi HTTP tương ứng (404, 400...) kèm mã lỗi nghiệp vụ `errorCode` cho Frontend dễ xử lý.
3. **Cấu hình hạ tầng dùng chung:**
   - Các cấu hình JWT Authentication, Database connection, Exception middleware đều được đưa về thư mục `Shared/Extensions` để tránh trùng lặp.

---

## II. 4 NGUYÊN TẮC THÉP KHI CODE GIỮA CÁC MODULE (Tránh Coupling)

Để sau này việc tách Module thành Microservice diễn ra suôn sẻ, sếp và trợ thủ AI bắt buộc phải tuân theo 4 quy tắc sau:

### 1. Không gọi trực tiếp DbContext của module khác
- **Quy tắc:** Module `Orders` tuyệt đối không được phép tiêm `ApplicationDbContext` của module khác hoặc tự ý thực hiện truy vấn bảng dữ liệu của module `Users`.
- **Giải pháp:** Nếu module `Orders` cần kiểm tra thông tin người dùng, nó bắt buộc phải đi qua **Cổng giao tiếp (Interface/Public API)** của module `Users`.

### 2. Giao tiếp qua Interface, không qua Class cụ thể
- **Quy tắc:** Các module giao tiếp với nhau bằng C# code bắt buộc phải thông qua các Interface và DTO (nằm trong một thư mục dùng chung hoặc thư mục cổng biên của module).
- **Ví dụ đúng:**
  ```csharp
  // Orders chỉ biết về Interface, không biết UserService được viết như thế nào
  public interface IUserService {
      Task<UserDto> GetUserAsync(string userId);
  }
  ```

### 3. Không dùng chung Entity (Bản thiết kế Database) chéo module
- **Quy tắc:** Không liên kết khóa ngoại bằng thực thể trực tiếp chéo module.
- **Ví dụ sai:** Trong thực thể `Order` (của module Orders) có thuộc tính: `public AppUser User { get; set; }` (Lỗi coupling nghiêm trọng vì gộp bảng).
- **Ví dụ đúng:** Chỉ lưu ID dưới dạng chuỗi tĩnh: `public string UserId { get; set; }`.

### 4. Ưu tiên giao tiếp bất đồng bộ bằng Sự kiện (Events)
- **Quy tắc:** Thay vì một module này trực tiếp gọi hàm của module kia để xử lý nghiệp vụ, hãy phát ra một sự kiện (Event) báo cáo trạng thái và để module kia tự lắng nghe và xử lý.
- **Ví dụ:** Khi đơn hàng thanh toán thành công, Module `Orders` phát Event `OrderPaidEvent`. Module `Shipping` lắng nghe Event này để tự tạo phiếu giao hàng.

---

## III. CHECKLIST THỰC TẾ KHI TÁCH THÀNH MICROSERVICE (3 - 6 tuần)

Nếu chúng ta tuân thủ tốt các nguyên tắc thép ở trên, khi hệ thống lớn mạnh, việc bóc tách một Module (ví dụ `Users`) thành một Microservice độc lập sẽ mất khoảng **3 - 6 tuần** (thay vì vài tháng/nửa năm nếu code spaghetti):

| Việc cần làm | Ước lượng thực tế | Chi tiết công việc |
| :--- | :--- | :--- |
| **1. Tách database schema riêng** | 1 - 3 ngày | Di chuyển các bảng của module sang một database PostgreSQL độc lập hoàn toàn. |
| **2. Chuyển đổi phương thức gọi** | 2 - 5 ngày | Thay thế việc gọi method C# trực tiếp qua Interface bằng các cuộc gọi mạng gRPC hoặc HTTP API. |
| **3. Xử lý giao dịch phân tán** | 1 - 2 tuần | Áp dụng pattern Saga hoặc Outbox Pattern để đảm bảo dữ liệu nhất quán giữa các database khác nhau. |
| **4. Setup Infra & CI/CD riêng** | 2 - 3 ngày | Tạo Dockerfile riêng, thiết lập pipeline build & deploy độc lập cho service mới. |
| **5. Xử lý xác thực giữa các service** | 1 - 2 ngày | Cấu hình cơ chế xác thực Token giữa các microservices (Service-to-Service auth). |
| **6. Kiểm thử tích hợp hệ thống** | 1 - 2 tuần | Chạy test toàn bộ luồng đi để đảm bảo không bị mất mát dữ liệu hoặc trễ mạng. |

---

## IV. LƯU Ý KỸ THUẬT SẮP TỚI CHO DỰ ÁN

1. **Tách Database Schema trong PostgreSQL:**
   - Hiện tại toàn bộ bảng đang nằm ở schema mặc định `public`. 
   - Trong bước tiếp theo, cần dùng EF Core cấu hình để đưa các bảng của module Users vào schema riêng tên là `users` (ví dụ: `users.AspNetUsers`), các bảng của Products vào schema `products`...
2. **Horizonal Scaling & SPOF:**
   - Vì chạy chung 1 app Monolith, nếu 1 module bị tràn bộ nhớ (Memory Leak) thì cả app sẽ sập (Single Point of Failure). Cần bọc lót bằng test tốt và giám sát tài nguyên server kỹ càng.
   - Khi có các tác vụ nặng (như gửi mail hàng loạt, tính toán bản đồ spatial phức tạp), hãy tách chúng ra chạy dưới dạng **Background Job** (Worker) riêng để tránh nghẽn luồng xử lý API chính.

---

## V. DANH SÁCH CÁC EDGE CASES CẦN XỬ LÝ (BACKLOG)

Dưới đây là các trường hợp biên và rủi ro kỹ thuật đã được xác định, cần được lên kế hoạch xử lý khi phát triển hệ thống lên quy mô lớn hoặc khi làm các module nghiệp vụ phức tạp tiếp theo:

1. **Thu hồi hoàn toàn Access Token khi Đăng xuất (Revocation):**
   - *Vấn đề:* JWT Access Token là stateless và vẫn hoạt động cho đến khi hết hạn (15 phút), kể cả khi người dùng đã gọi API `/logout`.
   - *Giải pháp:* Triển khai cơ chế Blacklist token trên Redis với TTL bằng thời gian sống còn lại của token khi người dùng bấm đăng xuất.

2. **Xung đột Transaction thủ công với Execution Strategy (Database Retry):**
   - *Vấn đề:* Cấu hình `EnableRetryOnFailure` của PostgreSQL không tương thích trực tiếp với các khối lệnh mở Transaction thủ công (`BeginTransactionAsync`), gây sập ứng dụng lúc runtime.
   - *Giải pháp:* Bắt buộc bọc các khối lệnh chứa Transaction thủ công bên trong `context.Database.CreateExecutionStrategy().ExecuteAsync(...)`.

3. **Nghẽn hàng đợi kết nối (Connection Pool Starvation):**
   - *Vấn đề:* Khi database chập chờn và kích hoạt chế độ tự động thử lại (Retry), các request sẽ nằm chờ và tiếp tục chiếm dụng kết nối trong DbContext Pool, dễ gây cạn kiệt Pool kết nối.
   - *Giải pháp:* Giới hạn số lần thử lại tối đa là 3 lần, và cấu hình tăng `Maximum Pool Size` phù hợp trong Connection String trên môi trường sản xuất.

4. **Trùng lặp dữ liệu do gửi lại yêu cầu (Idempotency):**
   - *Vấn đề:* Lỗi đứt kết nối mạng lúc trả kết quả của các API nhạy cảm (Tạo đơn hàng, Thanh toán) có thể khiến cơ chế Auto-Retry kích hoạt và thực thi trùng lặp lệnh ghi dữ liệu (nhân đôi đơn hàng, trừ tiền 2 lần).
   - *Giải pháp:* Áp dụng cơ chế Idempotency Key (khóa đồng nhất) được sinh ra từ Frontend trước khi gửi đi và được Backend kiểm tra trên Redis trước khi xử lý.

5. **Spam đăng ký bằng Email ảo (Email Confirmation):**
   - *Vấn đề:* Hiện tại hệ thống cho phép tạo tài khoản và kích hoạt ngay mà không bắt buộc xác thực email, dẫn đến nguy cơ bị spam tài khoản rác làm tràn ngập database.
   - *Giải pháp:* Cấu hình `RequireConfirmedEmail = true` và tích hợp dịch vụ gửi OTP/Link xác nhận qua Email để kích hoạt tài khoản.
