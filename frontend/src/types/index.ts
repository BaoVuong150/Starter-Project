export interface UserDto {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  isActive: boolean;
  createdAt: string;
}

export interface TokenDto {
  accessToken: string;
  refreshToken: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UpdateUserDto {
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  dateOfBirth?: string;
}
