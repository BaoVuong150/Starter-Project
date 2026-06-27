using backend.Shared.Exceptions;
using Microsoft.AspNetCore.Http;

namespace backend.Modules.Auth.Domain.Exceptions;

public static class AuthErrorCodes
{
    public const string InvalidCredentials = "INVALID_CREDENTIALS";
    public const string EmailAlreadyExists = "EMAIL_ALREADY_EXISTS";
    public const string InvalidToken = "INVALID_TOKEN";
    public const string TokenExpired = "TOKEN_EXPIRED";
    public const string UserCreationFailed = "USER_CREATION_FAILED";
}

public class AuthDomainException : CustomException
{
    public AuthDomainException(string message, string errorCode, int statusCode = StatusCodes.Status400BadRequest)
        : base(message, errorCode, statusCode)
    {
    }
}
