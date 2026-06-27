using System.Security.Claims;
using backend.Modules.Auth.Application.DTOs;
using backend.Modules.Auth.Application.Interfaces;
using backend.Modules.Auth.Domain.Exceptions;
using backend.Modules.Users.Application.DTOs;
using backend.Modules.Users.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;

namespace backend.Modules.Auth.Application.Services;

public class AuthService(
    UserManager<AppUser> userManager,
    IJwtTokenService jwtTokenService,
    IConfiguration configuration,
    IDistributedCache cache) : IAuthService
{
    public async Task<UserDto> RegisterAsync(RegisterDto dto)
    {
        var existingUser = await userManager.FindByEmailAsync(dto.Email);
        if (existingUser != null)
        {
            throw new AuthDomainException($"Email '{dto.Email}' đã được đăng ký bởi tài khoản khác", AuthErrorCodes.EmailAlreadyExists, StatusCodes.Status400BadRequest);
        }

        var user = new AppUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new AuthDomainException($"Đăng ký tài khoản thất bại: {errors}", AuthErrorCodes.UserCreationFailed, StatusCodes.Status400BadRequest);
        }

        return MapToUserDto(user);
    }

    public async Task<TokenDto> LoginAsync(LoginDto dto)
    {
        var user = await userManager.FindByEmailAsync(dto.Email);
        if (user == null || !await userManager.CheckPasswordAsync(user, dto.Password))
        {
            throw new AuthDomainException("Email hoặc mật khẩu không chính xác", AuthErrorCodes.InvalidCredentials, StatusCodes.Status400BadRequest);
        }

        var roles = await userManager.GetRolesAsync(user);
        var accessToken = jwtTokenService.GenerateAccessToken(user, roles);
        var refreshToken = jwtTokenService.GenerateRefreshToken();

        var expiryDays = double.Parse(configuration["JwtSettings:RefreshTokenExpiryInDays"] ?? "7");
        
        // Save Refresh Token to Redis cache with TTL
        var cacheKey = $"auth:refreshtoken:{refreshToken}";
        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(expiryDays)
        };
        await cache.SetStringAsync(cacheKey, user.Id, cacheOptions);

        return new TokenDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken
        };
    }

    public async Task<TokenDto> RefreshTokenAsync(RefreshTokenRequestDto dto)
    {
        // 1. Check if this refresh token was recently rotated (Grace Period)
        var rotatedKey = $"auth:rotated:{dto.RefreshToken}";
        var rotatedData = await cache.GetStringAsync(rotatedKey);
        if (!string.IsNullOrEmpty(rotatedData))
        {
            try
            {
                var cachedToken = System.Text.Json.JsonSerializer.Deserialize<TokenDto>(rotatedData);
                if (cachedToken != null)
                {
                    return cachedToken;
                }
            }
            catch
            {
                // Fallback to standard flow if deserialization fails
            }
        }

        ClaimsPrincipal principal;
        try
        {
            principal = jwtTokenService.GetPrincipalFromExpiredToken(dto.AccessToken);
        }
        catch (Exception)
        {
            throw new AuthDomainException("Access Token không hợp lệ", AuthErrorCodes.InvalidToken, StatusCodes.Status400BadRequest);
        }

        var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
        {
            throw new AuthDomainException("Access Token thiếu thông tin định danh người dùng", AuthErrorCodes.InvalidToken, StatusCodes.Status400BadRequest);
        }

        // 2. Validate Refresh Token from Redis cache
        var cacheKey = $"auth:refreshtoken:{dto.RefreshToken}";
        var storedUserId = await cache.GetStringAsync(cacheKey);
        
        if (string.IsNullOrEmpty(storedUserId) || storedUserId != userId)
        {
            throw new AuthDomainException("Refresh Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.", AuthErrorCodes.TokenExpired, StatusCodes.Status400BadRequest);
        }

        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new AuthDomainException("Người dùng không tồn tại hoặc đã bị khóa.", AuthErrorCodes.InvalidToken, StatusCodes.Status400BadRequest);
        }

        // Invalidate old Refresh Token in Redis immediately
        await cache.RemoveAsync(cacheKey);

        var roles = await userManager.GetRolesAsync(user);
        var newAccessToken = jwtTokenService.GenerateAccessToken(user, roles);
        var newRefreshToken = jwtTokenService.GenerateRefreshToken();

        var tokenDto = new TokenDto
        {
            AccessToken = newAccessToken,
            RefreshToken = newRefreshToken
        };

        var expiryDays = double.Parse(configuration["JwtSettings:RefreshTokenExpiryInDays"] ?? "7");
        
        // Save new Refresh Token in Redis with TTL
        var newCacheKey = $"auth:refreshtoken:{newRefreshToken}";
        var cacheOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromDays(expiryDays)
        };
        await cache.SetStringAsync(newCacheKey, user.Id, cacheOptions);

        // Save rotated mapping with a short 30-second TTL for concurrent requests (Grace Period)
        var rotatedOptions = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(30)
        };
        var serializedToken = System.Text.Json.JsonSerializer.Serialize(tokenDto);
        await cache.SetStringAsync(rotatedKey, serializedToken, rotatedOptions);

        return tokenDto;
    }

    public async Task LogoutAsync(string userId, string? refreshToken)
    {
        if (!string.IsNullOrEmpty(refreshToken))
        {
            var cacheKey = $"auth:refreshtoken:{refreshToken}";
            await cache.RemoveAsync(cacheKey);
        }
    }

    private static UserDto MapToUserDto(AppUser user)
    {
        return new UserDto
        {
            Id = user.Id,
            UserName = user.UserName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            FirstName = user.FirstName,
            LastName = user.LastName,
            AvatarUrl = user.AvatarUrl,
            DateOfBirth = user.DateOfBirth,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt
        };
    }
}
