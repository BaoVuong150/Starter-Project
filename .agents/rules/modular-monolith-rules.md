---
trigger: always_on
---

# 📐 QUY TẮC PHÁT TRIỂN MODULE TRONG DỰ ÁN (MODULAR MONOLITH)

Dự án này được thiết kế theo kiến trúc Modular Monolith kết hợp Clean Architecture. Tất cả các AI Assistant khi code cho dự án này BẮT BUỘC phải tuân thủ nghiêm ngặt 4 quy tắc thép dưới đây để đảm bảo tính độc lập và khả năng tách rời (microservices-ready) sau này:

## 1. Không truy cập trực tiếp DbContext của Module khác
- **QUY TẮC:** Cấm tuyệt đối việc tiêm (inject) `ApplicationDbContext` của module khác hoặc viết truy vấn LINQ/SQL trực tiếp vào bảng dữ liệu không thuộc quản lý của module hiện tại.
- **THỰC THI:** Nếu Module A cần dữ liệu từ Module B, bắt buộc phải giao tiếp thông qua Interface API nội bộ do Module B cung cấp.

## 2. Chỉ giao tiếp chéo Module bằng Interface và DTO
- **QUY TẮC:** Không bao giờ phụ thuộc vào lớp triển khai thực tế (concrete class) của module khác. Chỉ phụ thuộc vào Interface và các DTO tĩnh dùng chung.
- **THỰC THI:** 
  - Module A chỉ gọi Interface `IUserInternalService` của Module B.
  - Dữ liệu trả về phải là một DTO tĩnh (chỉ chứa các thuộc tính, không chứa logic).

## 3. Không dùng chung/liên kết thực thể (Entity) chéo Module
- **QUY TẮC:** Cấm thiết lập mối quan hệ khóa ngoại trực tiếp bằng thực thể C# (như `public AppUser User { get; set; }`) trong các Entity thuộc module khác.
- **THỰC THI:** Chỉ lưu mã định danh dạng chuỗi hoặc GUID tĩnh (ví dụ: `public string UserId { get; set; }`).

## 4. Ưu tiên giao tiếp bất đồng bộ qua Sự kiện (Events)
- **QUY TẮC:** Hạn chế tối đa việc gọi phương thức trực tiếp chéo module (Request-Response). Ưu tiên phát ra sự kiện (raise event) và để module đích tự lắng nghe xử lý.
