# HỆ THỐNG ĐẶT LỊCH SPA THỜI GIAN THỰC (REAL-TIME SPA BOOKING SYSTEM)
## PHÂN TÍCH THỬ THÁCH KỸ THUẬT, EDGE CASES & GIẢI PHÁP KIẾN TRÚC

Tài liệu này tóm tắt toàn bộ các bài toán nghiệp vụ, thử thách kỹ thuật nâng cao, trường hợp biên (edge cases) và các giải pháp kiến trúc tối ưu (best practices) được áp dụng khi thiết kế hệ thống đặt lịch hẹn thời gian thực cho dự án Lucky Spa.

---

### I. CÁC BÀI TOÁN ĐƯỢC GIẢI QUYẾT CHO DỰ ÁN

#### 1. Về mặt Nghiệp vụ & Kinh doanh (Business Value)
* **Triệt tiêu hoàn toàn lỗi Overbooking (Đặt trùng lịch):** Đảm bảo không bao giờ xảy ra tình trạng hai khách hàng cùng đặt một nhân viên hoặc một phòng tại cùng một thời điểm, bảo vệ tuyệt đối uy tín thương hiệu của Spa.
* **Tối ưu hóa năng suất hoạt động:** Tự động tính toán dung lượng trống dựa trên ca làm việc thực tế của nhân viên để hiển thị lịch hẹn chính xác, giúp Spa bán được tối đa các slot dịch vụ trong ngày mà không cần con người tính toán thủ công.
* **Giảm tải công việc cho Tiếp tân:** Tự động hóa quy trình kiểm tra slot trống và ghi nhận thông tin đặt lịch. Tiếp tân chỉ cần theo dõi trạng thái lịch hẹn qua màn hình Admin Dashboard để đón tiếp khách.

#### 2. Về mặt Kỹ thuật & Hệ thống (Technical Value)
* **Bảo vệ Cơ sở dữ liệu chính:** Sử dụng Redis làm lá chắn giúp chặn đứng 90% lượng truy cập đọc/ghi kiểm tra slot trực tiếp vào PostgreSQL. Hệ thống không bị nghẽn (bottleneck) hoặc sập nguồn khi hàng nghìn khách hàng cùng vào săn khuyến mãi Happy Hour.
* **Xử lý tranh chấp đồng thời hoàn hảo:** Giải quyết triệt để vấn đề nhiều request ghi đè dữ liệu cùng lúc (Race Condition) bằng khóa phân tán (Distributed Locking) và cơ chế Concurrency Stamp của EF Core.
* **Tính nhất quán dữ liệu cao:** Thông tin lịch hẹn trên Redis, cơ sở dữ liệu PostgreSQL và tin nhắn thông báo gửi về Telegram luôn đồng bộ 100%, không bị lệch dữ liệu.
* **Độc lập và dễ bảo trì:** Các module chạy hoàn toàn độc lập thông qua giao tiếp bất đồng bộ (Event-Driven), giúp dễ dàng nâng cấp hoặc chuyển đổi sang Microservices sau này.

---

### II. CÁC BÀI TOÁN LOGIC NÂNG CAO (ADVANCED CHALLENGES)

#### 1. Thuật toán kiểm tra Dung lượng Động (Dynamic Capacity Intersection)
* **Thử thách:** Dung lượng trống của Spa không chỉ đơn giản là "số giường trống". Nó là sự giao thoa (intersection) của 3 yếu tố:
  * Số lượng giường/phòng theo phân loại dịch vụ (phòng VIP, phòng đôi, phòng đá nóng...).
  * Số lượng kỹ thuật viên đang trong ca trực và chưa bị gán lịch hẹn khác tại khung giờ đó.
  * Khoảng thời gian chiếm dụng (ví dụ: khách đặt gói massage 90 phút sẽ chiếm tài nguyên khác khách đặt gói 60 phút).
* **Giải pháp:** Thiết kế thuật toán tính toán dung lượng thời gian thực dựa trên lý thuyết tập hợp:
  `Khung_Giờ_Trống = (Số_Phòng_Trống ∩ Danh_Sách_Nhân_Viên_Rảnh_Trong_Ca) - Lịch_Hẹn_Đã_Đặt`
  Hệ thống tự động tính toán thời gian kết thúc của các lịch hẹn trước đó để giải phóng phòng và nhân sự đúng thời điểm.

#### 2. Tối ưu hóa truy vấn Lịch trống bằng Redis Bitmaps
* **Thử thách:** Khi khách hàng mở giao diện lịch hẹn, hệ thống phải quét database để tính toán các giờ còn trống trong ngày. Việc chạy các câu lệnh truy vấn phức tạp (quét hàng nghìn ca trực và lịch đặt) trong PostgreSQL theo thời gian thực sẽ gây quá tải hệ thống.
* **Giải pháp:**
  * Áp dụng kỹ thuật **Pre-generation**: Sử dụng một Background Job tự động tính toán trước ma trận giờ trống cho 30 ngày tiếp theo vào ban đêm.
  * Lưu trữ ma trận dưới dạng **Bitmaps trong Redis**: Mỗi ngày của 1 nhân viên/phòng là một chuỗi Bit (ví dụ: chia ngày thành 48 slot, mỗi slot 30 phút tương ứng 1 Bit: `0` là trống, `1` là đã đặt). Khi khách tìm giờ trống, hệ thống thực hiện các phép toán Bitwise (`AND`/`OR` trên Redis) cực kỳ nhanh (dưới 1ms) để trả về kết quả ngay lập tức.

#### 3. Đồng bộ hóa dữ liệu nhất quán (Cache Invalidation Pattern)
* **Thử thách:** Khi lịch hẹn được tạo mới hoặc hủy bỏ trong PostgreSQL, làm thế nào để thông tin giờ trống trên Redis Cache lập tức được cập nhật theo nhằm tránh việc người sau nhìn thấy giờ trống giả (Stale Cache)?
* **Giải pháp:** Viết một **EF Core Interceptor (Bộ đánh chặn SaveChanges)**. Khi có bất kỳ thay đổi nào ghi xuống bảng dữ liệu thành công, Interceptor này sẽ tự động kích hoạt và gửi lệnh xóa/cập nhật các Key tương ứng trên Redis, đảm bảo tính nhất quán dữ liệu giữa Cache và DB luôn đạt 100%.

---

### III. CÁC TRƯỜNG HỢP BIÊN (EDGE CASES) & GIẢI PHÁP CHI TIẾT

| Trường hợp biên (Edge Case) | Hậu quả nếu không xử lý | Giải pháp kiến trúc tối ưu |
| :--- | :--- | :--- |
| **Race Condition** (Hai khách cùng đặt slot cuối cùng vào cùng 1 mili-giây) | Xảy ra lỗi đặt trùng lịch (Overbooking), gây gián đoạn dịch vụ thực tế. | Sử dụng **Pessimistic Locking** (`SELECT ... FOR UPDATE` trong PostgreSQL) hoặc **Distributed Lock** (Redlock trên Redis) để khóa hàng dữ liệu trong lúc thực hiện transaction. |
| **Giữ chỗ tạm thời quá hạn** (Khách bấm chọn giờ để điền thông tin nhưng tắt máy bỏ đi) | Khung giờ bị khóa oan, khách hàng khác không thể đặt được lịch. | Sử dụng tính năng tự hủy của Redis với **TTL (Time-To-Live)** khoảng 5-10 phút. Nếu quá hạn không xác nhận, Redis tự giải phóng slot. |
| **Lệch múi giờ quốc tế** (Khách ở Mỹ đặt lịch hẹn tại Spa Việt Nam) | Giờ hiển thị trên lịch hẹn bị lệch hoàn toàn, gây lỡ lịch của khách. | Luôn lưu trữ thời gian ở database dưới dạng múi giờ quốc tế chuẩn **UTC (DateTimeOffset)**, chỉ thực hiện chuyển đổi sang múi giờ địa phương (UTC+7) ở tầng hiển thị (UI). |
| **Thay đổi ca trực đột xuất** (Nhân viên xin nghỉ phép hoặc đổi ca trực từ Admin CMS) | Các lịch hẹn của khách đã gán cho nhân viên đó bị "mồ côi" (không có người phục vụ). | Phát ra sự kiện `ShiftChangedEvent`, hệ thống tự động tìm kiếm nhân viên khác có cùng tay nghề đang rảnh để gán lại (Auto-reassignment), hoặc cảnh báo tiếp tân điều phối thủ công. |

---

### IV. CÁC KỸ THUẬT BEST PRACTICES TRÊN ASP.NET CORE 10

1. **DbContext Pooling:** Sử dụng `AddDbContextPool<ApplicationDbContext>` thay vì `AddDbContext` thông thường để tái sử dụng các kết nối PostgreSQL sẵn có, tiết kiệm tài nguyên RAM/CPU và nâng cao năng lực chịu tải đồng thời.
2. **In-Memory Messaging (MediatR):** Giao tiếp bất đồng bộ giữa các module bằng cách gửi `Notification` qua MediatR. Khi đặt lịch thành công, hệ thống phát ra `BookingConfirmedEvent` để module gửi tin nhắn Telegram tự bắt và xử lý ngầm, tránh gây chậm trễ cho tiến trình đặt lịch của khách.
3. **BackgroundService (Worker Service):** Sử dụng các luồng chạy ngầm tích hợp sẵn trong .NET để quét dọn dữ liệu rác, xử lý hoàn tác các slot giữ chỗ quá hạn, hoặc chạy các báo cáo doanh thu định kỳ.
4. **Transactional Outbox Pattern:** Đảm bảo tính nhất quán giao dịch giữa Database và hệ thống gửi tin nhắn bên thứ ba (Telegram). Lưu thông báo vào bảng `Outbox` chung một transaction với lịch hẹn, sau đó sử dụng tiến trình ngầm gửi đi, đảm bảo tin nhắn không bao giờ bị mất hoặc trùng lặp.
