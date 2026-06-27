using System.Security.Claims;
using backend.Modules.Auth.Application.DTOs;
using backend.Modules.Auth.Application.Interfaces;
using backend.Modules.Auth.Domain.Exceptions;
using backend.Modules.Users.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.RateLimiting;

namespace backend.Modules.Auth.Presentation.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IAuthService authService, IConfiguration configuration) : ControllerBase
{
    [HttpPost("register")]
    [EnableRateLimiting("auth-limit")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await authService.RegisterAsync(dto);
        return Ok(result);
    }

    [HttpPost("login")]
    [EnableRateLimiting("auth-limit")]
    [ProducesResponseType(typeof(TokenDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var token = await authService.LoginAsync(dto);
        SetRefreshTokenCookie(token.RefreshToken);
        return Ok(token);
    }

    [HttpPost("refresh")]
    [ProducesResponseType(typeof(TokenDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto dto)
    {
        var refreshToken = dto.RefreshToken;
        if (string.IsNullOrEmpty(refreshToken))
        {
            refreshToken = Request.Cookies["refreshToken"];
        }

        if (string.IsNullOrEmpty(refreshToken))
        {
            throw new AuthDomainException("Refresh Token không được để trống", AuthErrorCodes.InvalidToken);
        }

        var requestDto = new RefreshTokenRequestDto
        {
            AccessToken = dto.AccessToken,
            RefreshToken = refreshToken
        };

        var token = await authService.RefreshTokenAsync(requestDto);
        SetRefreshTokenCookie(token.RefreshToken);
        return Ok(token);
    }

    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "Không xác định được danh tính người dùng." });
        }

        var refreshToken = Request.Cookies["refreshToken"];
        await authService.LogoutAsync(userId, refreshToken);
        Response.Cookies.Delete("refreshToken");
        return NoContent();
    }

    private void SetRefreshTokenCookie(string refreshToken)
    {
        var expiryDays = double.Parse(configuration["JwtSettings:RefreshTokenExpiryInDays"] ?? "7");
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // SameSite=None bắt buộc phải đi kèm Secure=true (Trình duyệt hỗ trợ HTTP localhost secure cookie)
            SameSite = SameSiteMode.None, // Cho phép truyền nhận Cookie chéo tên miền (Cross-Domain)
            Expires = DateTime.UtcNow.AddDays(expiryDays)
        };
        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }
}
