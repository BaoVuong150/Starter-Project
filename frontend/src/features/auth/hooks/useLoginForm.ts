import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { loginApi, getProfileApi } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';
import type { LoginDto } from '../../../types';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  // Cấu hình Form Validation bằng react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Quản lý API Call bằng React Query Mutation
  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: async (tokenData) => {
      try {
        // 1. Lưu Access Token vào RAM (Zustand Store)
        setToken(tokenData.accessToken);

        // 2. Gọi API lấy thông tin Profile chi tiết
        const profile = await getProfileApi();
        setUser(profile);

        // 3. Hiển thị thông báo và điều hướng về trang chủ
        message.success('Đăng nhập thành công!');
        navigate('/');
      } catch (err: any) {
        message.error('Không thể lấy thông tin tài khoản sau đăng nhập.');
      }
    },
    onError: (error: any) => {
      // Bắt thông điệp lỗi từ Backend Exception Handler
      const errorMsg = error.response?.data?.message || 'Email hoặc mật khẩu không chính xác.';
      message.error(errorMsg);
    },
  });

  const onSubmit = handleSubmit((data) => {
    loginMutation.mutate(data);
  });

  return {
    register,
    onSubmit,
    errors,
    isLoading: loginMutation.isPending,
  };
};
