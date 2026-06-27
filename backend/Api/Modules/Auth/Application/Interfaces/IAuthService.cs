using backend.Modules.Auth.Application.DTOs;
using backend.Modules.Users.Application.DTOs;

namespace backend.Modules.Auth.Application.Interfaces;

public interface IAuthService
{
    Task<UserDto> RegisterAsync(RegisterDto dto);
    Task<TokenDto> LoginAsync(LoginDto dto);
    Task<TokenDto> RefreshTokenAsync(RefreshTokenRequestDto dto);
    Task LogoutAsync(string userId, string? refreshToken);
}
