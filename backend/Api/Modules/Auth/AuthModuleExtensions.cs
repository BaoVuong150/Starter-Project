using backend.Modules.Auth.Application.Interfaces;
using backend.Modules.Auth.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Modules.Auth;

public static class AuthModuleExtensions
{
    public static IServiceCollection AddAuthModule(this IServiceCollection services)
    {
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IAuthService, AuthService>();
        return services;
    }
}
