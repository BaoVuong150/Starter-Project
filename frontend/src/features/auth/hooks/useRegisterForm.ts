import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { registerApi } from '../services/authService';
import type { RegisterDto } from '../../../types';

// Định nghĩa kiểu dữ liệu cho Form Đăng ký ở Client (thêm trường confirmPassword)
export interface RegisterFormValues extends RegisterDto {
  confirmPassword: string;
}

export const useRegisterForm = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
  });

  // Quản lý API Call bằng React Query Mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterDto) => registerApi(data),
    onSuccess: () => {
      message.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
      navigate('/login');
    },
    onError: (error: any) => {
      // Bắt lỗi từ backend (ví dụ: email đã trùng lặp)
      const errorMsg = error.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      message.error(errorMsg);
    },
  });

  const onSubmit = handleSubmit((values) => {
    // Trích xuất các trường để gửi lên API (bỏ confirmPassword)
    const { email, password, firstName, lastName } = values;
    registerMutation.mutate({ email, password, firstName, lastName });
  });

  // Theo dõi giá trị mật khẩu để so khớp password và confirmPassword
  const passwordValue = watch('password');

  return {
    register,
    onSubmit,
    errors,
    isLoading: registerMutation.isPending,
    passwordValue,
  };
};
