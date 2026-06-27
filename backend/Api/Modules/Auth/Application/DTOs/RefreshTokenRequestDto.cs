using System.ComponentModel.DataAnnotations;

namespace backend.Modules.Auth.Application.DTOs;

public class RefreshTokenRequestDto
{
    [Required]
    public string AccessToken { get; set; } = string.Empty;

    public string? RefreshToken { get; set; }
}
