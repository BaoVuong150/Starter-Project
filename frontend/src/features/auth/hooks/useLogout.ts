import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { App } from 'antd';
import { logoutApi } from '../services/authService';
import { useAuthStore } from '../store/useAuthStore';

export const useLogout = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);

  const logoutMutation = useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      // 1. Xóa sạch token và user khỏi RAM (Zustand Store)
      setToken(null);
      setUser(null);

      // 2. Clear cache của React Query để tránh rò rỉ dữ liệu của phiên cũ
      queryClient.clear();

      // 3. Hiển thị thông báo và điều hướng về trang chủ
      message.success('Đăng xuất thành công!');
      navigate('/');
    },
    onError: (error: any) => {
      // Nếu API lỗi (ví dụ token hết hạn trước khi đăng xuất), vẫn xóa state local để giải phóng phiên làm việc
      setToken(null);
      setUser(null);
      queryClient.clear();
      message.warning('Phiên đăng nhập đã kết thúc.');
      navigate('/login');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return {
    handleLogout,
    isLoading: logoutMutation.isPending,
  };
};
