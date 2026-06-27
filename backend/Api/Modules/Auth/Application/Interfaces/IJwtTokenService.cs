using System.Security.Claims;
using backend.Modules.Users.Domain.Entities;

namespace backend.Modules.Auth.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(AppUser user, IList<string> roles);
    string GenerateRefreshToken();
    ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
}
