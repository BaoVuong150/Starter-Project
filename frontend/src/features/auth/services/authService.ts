import { axiosClient } from '../../../config/axiosClient';
import type { LoginDto, RegisterDto, TokenDto, UserDto } from '../../../types';

/**
 * Gọi API Đăng ký tài khoản mới
 */
export const registerApi = async (data: RegisterDto): Promise<UserDto> => {
  const response = await axiosClient.post<UserDto>('/api/auth/register', data);
  return response.data;
};

/**
 * Gọi API Đăng nhập
 */
export const loginApi = async (data: LoginDto): Promise<TokenDto> => {
  const response = await axiosClient.post<TokenDto>('/api/auth/login', data);
  return response.data;
};

/**
 * Gọi API Đăng xuất
 */
export const logoutApi = async (): Promise<void> => {
  await axiosClient.post('/api/auth/logout');
};

/**
 * Lấy thông tin tài khoản người dùng đang đăng nhập
 */
export const getProfileApi = async (): Promise<UserDto> => {
  const response = await axiosClient.get<UserDto>('/api/users/profile');
  return response.data;
};
