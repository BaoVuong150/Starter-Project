using backend.Modules.Users;
using backend.Modules.Auth;
using backend.Shared.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

namespace backend.Shared.Extensions;

public static class ServiceExtensions
{
    // 1. Extension riêng cho Document (Tạo dữ liệu cho Scalar)
    public static IServiceCollection AddApiDocsConfig(this IServiceCollection services)
    {
        services.AddOpenApi();
        return services;
    }

    // 1.5. Cấu hình CORS chéo tên miền (Cross-Domain)
    public static IServiceCollection AddCorsConfig(this IServiceCollection services, IConfiguration configuration)
    {
        var origins = configuration.GetSection("AllowedOrigins").Get<string[]>() 
                      ?? ["http://localhost:3000", "http://localhost:5173"];

        services.AddCors(options =>
        {
            options.AddPolicy("CorsPolicy", builder =>
            {
                builder
                    .WithOrigins(origins)
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials(); // Bắt buộc để cho phép truyền nhận Cookie chéo tên miền
            });
        });
        return services;
    }

    // 2. Extension riêng cho Database (Đã tối ưu Hồ bơi kết nối & Tự động thử lại khi lỗi mạng)
    public static IServiceCollection AddDatabaseConfig(this IServiceCollection services, IConfiguration configuration)
    {
        // Thay AddDbContext bằng AddDbContextPool để tái sử dụng Object, tăng tốc truy vấn x10 lần
        services.AddDbContextPool<ApplicationDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                npgsqlOptions => npgsqlOptions
                    .EnableRetryOnFailure(
                        maxRetryCount: 3, // Tự động thử lại tối đa 3 lần nếu kết nối PostgreSQL chập chờn
                        maxRetryDelay: TimeSpan.FromSeconds(5), // Thời gian chờ tối đa giữa các lần thử là 5 giây
                        errorCodesToAdd: null
                    )
                    .CommandTimeout(30) // Giới hạn thời gian chạy mỗi câu lệnh tối đa 30 giây để tránh treo luồng
            ));
        return services;
    }

    // 3. Extension riêng cho Redis (Đã tối ưu Chống sập)
    public static IServiceCollection AddRedisConfig(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddStackExchangeRedisCache(options =>
        {
            // Thêm cờ abortConnect=false và connectTimeout=5000 để hệ thống không sập nếu Redis chập chờn
            var rawConnectionString = configuration.GetConnectionString("Redis");
            options.Configuration = $"{rawConnectionString},abortConnect=false,connectTimeout=5000";

            options.InstanceName = "AppCache:"; // Tiền tố cho các Key lưu trên Redis
        });
        return services;
    }

    // 4. Cấu hình JWT Authentication
    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("Jwt SecretKey is missing");

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidAudience = jwtSettings["Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey))
            };
        });

        return services;
    }

    // 5. Cấu hình Global Rate Limiting & Specific Policies
    public static IServiceCollection AddRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

            // Bộ lọc chung (Global Limiter) - Tự động bỏ qua nếu Endpoint có Rate Limit riêng
            options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(httpContext =>
            {
                var endpoint = httpContext.GetEndpoint();
                if (endpoint?.Metadata.GetMetadata<EnableRateLimitingAttribute>() != null)
                {
                    // Trả về bộ lọc rỗng để nhường quyền xử lý cho chính sách riêng
                    return RateLimitPartition.GetNoLimiter<string>("bypass");
                }

                var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString() 
                                ?? httpContext.Request.Headers["X-Forwarded-For"].ToString() 
                                ?? "anonymous";

                return RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: ipAddress,
                    factory: partition => new FixedWindowRateLimiterOptions
                    {
                        AutoReplenishment = true,
                        PermitLimit = 100,
                        QueueLimit = 0,
                        Window = TimeSpan.FromMinutes(1)
                    });
            });

            // Bộ lọc riêng cho Auth (Đăng nhập/Đăng ký) - Giới hạn 5 lần/phút cho mỗi IP
            options.AddPolicy("auth-limit", httpContext =>
            {
                var ipAddress = httpContext.Connection.RemoteIpAddress?.ToString() 
                                ?? httpContext.Request.Headers["X-Forwarded-For"].ToString() 
                                ?? "anonymous";

                return RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: ipAddress,
                    factory: partition => new FixedWindowRateLimiterOptions
                    {
                        AutoReplenishment = true,
                        PermitLimit = 5,
                        QueueLimit = 0,
                        Window = TimeSpan.FromMinutes(1)
                    });
            });
        });

        return services;
    }

    public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddControllers(); // Đăng ký các Controllers cho các API Module
        services.AddApiDocsConfig();
        services.AddCorsConfig(configuration); // Đăng ký cấu hình CORS cho phép chéo domain
        services.AddDatabaseConfig(configuration);
        services.AddRedisConfig(configuration);
        services.AddRateLimiting(); // Đăng ký dịch vụ Rate Limiting toàn cục

        // Đăng ký Module Users (Identity + Nghiệp vụ User)
        services.AddUsersModule();

        // Đăng ký Module Auth (Xác thực)
        services.AddAuthModule();

        // Đăng ký JWT Authentication
        services.AddJwtAuthentication(configuration);

        // Đăng ký cơ quan bắt lỗi (Global Exception Handler)
        services.AddExceptionHandler<backend.Shared.Exceptions.GlobalExceptionHandler>();
        services.AddProblemDetails(); // Ép hệ thống dùng chuẩn định dạng lỗi RFC 7807 của W3C

        return services;
    }
}
