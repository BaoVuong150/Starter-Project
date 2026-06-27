using backend.Shared.Exceptions;
using Microsoft.AspNetCore.Http;

namespace backend.Modules.Users.Domain.Exceptions;

public static class UserErrorCodes
{
    public const string UserNotFound = "USER_NOT_FOUND";
    public const string InvalidAvatar = "INVALID_AVATAR";
    public const string UnderAge = "UNDER_AGE";
    public const string ProfileUpdateFailed = "PROFILE_UPDATE_FAILED";
}

public class UserDomainException : CustomException
{
    public UserDomainException(string message, string errorCode, int statusCode = StatusCodes.Status400BadRequest)
        : base(message, errorCode, statusCode)
    {
    }
}
