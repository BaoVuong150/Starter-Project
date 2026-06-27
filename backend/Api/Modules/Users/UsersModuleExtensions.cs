using backend.Modules.Users.Application.Interfaces;
using backend.Modules.Users.Application.Services;
using backend.Modules.Users.Domain.Entities;
using backend.Shared.Data;
using Microsoft.AspNetCore.Identity;

namespace backend.Modules.Users;

public static class UsersModuleExtensions
{
    public static IServiceCollection AddUsersModule(this IServiceCollection services)
    {
        // 1. Cấu hình ASP.NET Core Identity Core cho AppUser
        services.AddIdentityCore<AppUser>(options =>
        {
            // Thiết lập chính sách bảo mật mật khẩu
            options.Password.RequireDigit = true;
            options.Password.RequiredLength = 6;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireLowercase = false;
            options.Password.RequiredUniqueChars = 1;

            // Cấu hình User
            options.User.RequireUniqueEmail = true;
        })
        .AddRoles<IdentityRole>()
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();

        // 2. Đăng ký các dịch vụ nghiệp vụ (Business Services)
        services.AddScoped<IUserService, UserService>();

        return services;
    }
}
