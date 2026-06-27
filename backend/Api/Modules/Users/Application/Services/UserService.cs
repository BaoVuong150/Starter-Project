using backend.Modules.Users.Application.DTOs;
using backend.Modules.Users.Application.Interfaces;
using backend.Modules.Users.Domain.Entities;
using backend.Modules.Users.Domain.Exceptions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

namespace backend.Modules.Users.Application.Services;

public class UserService(UserManager<AppUser> userManager) : IUserService
{
    public async Task<UserDto?> GetProfileAsync(string userId)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new UserDomainException($"Không tìm thấy người dùng có ID: {userId}", UserErrorCodes.UserNotFound, StatusCodes.Status404NotFound);
        }

        return MapToDto(user);
    }

    public async Task<UserDto?> UpdateProfileAsync(string userId, UpdateUserDto dto)
    {
        var user = await userManager.FindByIdAsync(userId);
        if (user == null)
        {
            throw new UserDomainException($"Không tìm thấy người dùng có ID: {userId}", UserErrorCodes.UserNotFound, StatusCodes.Status404NotFound);
        }

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.AvatarUrl = dto.AvatarUrl;
        user.DateOfBirth = dto.DateOfBirth;
        user.UpdatedAt = DateTime.UtcNow;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new UserDomainException($"Không thể cập nhật hồ sơ: {errors}", UserErrorCodes.ProfileUpdateFailed, StatusCodes.Status400BadRequest);
        }

        return MapToDto(user);
    }

    private static UserDto MapToDto(AppUser user)
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
