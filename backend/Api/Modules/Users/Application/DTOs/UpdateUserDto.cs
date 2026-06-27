namespace backend.Modules.Users.Application.DTOs;

public class UpdateUserDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public DateTime? DateOfBirth { get; set; }
}
