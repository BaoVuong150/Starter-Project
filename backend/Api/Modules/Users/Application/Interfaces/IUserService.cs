using backend.Modules.Users.Application.DTOs;

namespace backend.Modules.Users.Application.Interfaces;

public interface IUserService
{
    Task<UserDto?> GetProfileAsync(string userId);
    Task<UserDto?> UpdateProfileAsync(string userId, UpdateUserDto dto);
}
