using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace backend.Shared.Exceptions;

public class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var problemDetails = new ProblemDetails();

        if (exception is CustomException customException)
        {
            // 1. Đối với lỗi nghiệp vụ được định nghĩa trước (CustomException)
            // Trả về đúng StatusCode của lỗi và tin nhắn thông báo cụ thể cho người dùng
            problemDetails.Status = customException.StatusCode;
            problemDetails.Title = "Lỗi Nghiệp Vụ";
            problemDetails.Detail = customException.Message;
            problemDetails.Extensions.Add("errorCode", customException.ErrorCode);

            logger.LogWarning("Lỗi nghiệp vụ [{ErrorCode}] xảy ra: {Message} (Status Code: {StatusCode})", 
                customException.ErrorCode, customException.Message, customException.StatusCode);
        }
        else
        {
            // 2. Đối với lỗi hệ thống nghiêm trọng chưa biết trước (Internal Server Error)
            // Ghi log lỗi gốc ngầm trên Server (chỉ dev mới xem được)
            logger.LogError(exception, "LỖI HỆ THỐNG TRẦM TRỌNG: {Message}", exception.Message);

            // Trả về ProblemDetails lịch sự và ẩn StackTrace
            problemDetails.Status = StatusCodes.Status500InternalServerError;
            problemDetails.Title = "Lỗi Máy Chủ";
            problemDetails.Detail = "Hệ thống đang bận hoặc gặp sự cố. Sếp vui lòng thử lại sau nhé!";
        }

        // 3. Trả về mã lỗi HTTP và JSON ProblemDetails
        httpContext.Response.StatusCode = problemDetails.Status.Value;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

        // 4. Trả về true để báo cáo là lỗi đã được xử lý xong
        return true;
    }
}
