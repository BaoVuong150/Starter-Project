using Scalar.AspNetCore;

namespace backend.Shared.Extensions;

public static class PipelineExtensions
{
    public static WebApplication UseApplicationPipeline(this WebApplication app)
    {
        // 1. Đặt trạm gác chặn lỗi ở ngay CỬA NGÕ (Đầu tiên) để bất cứ lỗi nào rớt ra đều bị hứng lại
        app.UseExceptionHandler();

        if (app.Environment.IsDevelopment())
        {
            app.MapOpenApi(); // Sinh file json chứa dữ liệu API
            app.MapScalarApiReference(); // Giao diện Scalar tuyệt đẹp đọc dữ liệu từ file json trên
        }

        // 1.8. Kích hoạt CORS Policy chéo tên miền
        app.UseCors("CorsPolicy");

        // 1.9. Kích hoạt Rate Limiting toàn cục
        app.UseRateLimiter();

        // 2. Kích hoạt Middleware Xác thực & Phân quyền
        app.UseAuthentication();
        app.UseAuthorization();

        // 3. Bản đồ các Controllers của các module
        app.MapControllers();

        app.MapGet("/", () => "Hello Sếp! API .NET 10 O2O Omnichannel đang chạy mượt mà trên cổng 5000!");
        return app;
    }
}
