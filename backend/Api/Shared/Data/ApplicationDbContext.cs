using backend.Modules.Users.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace backend.Shared.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<AppUser>(options)
{
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Định cấu hình đưa toàn bộ các bảng Identity vào schema "users" và đổi tên cho gọn sạch
        builder.Entity<AppUser>().ToTable("Users", "users");
        builder.Entity<IdentityRole>().ToTable("Roles", "users");
        builder.Entity<IdentityUserRole<string>>().ToTable("UserRoles", "users");
        builder.Entity<IdentityUserClaim<string>>().ToTable("UserClaims", "users");
        builder.Entity<IdentityUserLogin<string>>().ToTable("UserLogins", "users");
        builder.Entity<IdentityRoleClaim<string>>().ToTable("RoleClaims", "users");
        builder.Entity<IdentityUserToken<string>>().ToTable("UserTokens", "users");
    }
}
