using Microsoft.AspNetCore.Http;

namespace backend.Shared.Exceptions;

public abstract class CustomException(string message, string errorCode, int statusCode = StatusCodes.Status400BadRequest) : Exception(message)
{
    public int StatusCode { get; } = statusCode;
    public string ErrorCode { get; } = errorCode;
}
