import { useEffect, useState } from 'react';
  import axios from 'axios';
  import { useAuthStore } from '../store/useAuthStore';
  import { getProfileApi } from '../services/authService';
  import type { TokenDto } from '../../../types';

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  export const useAuthInit = () => {
    const [isInitialized, setIsInitialized] = useState(false);
    const setToken = useAuthStore((state) => state.setToken);
    const setUser = useAuthStore((state) => state.setUser);
    const logout = useAuthStore((state) => state.logout);

    useEffect(() => {
      const initializeAuth = async () => {
        try {
          // Thực hiện gọi API Refresh Token ngầm khi người dùng load lại trang (Silent Refresh)
          // Cookie chứa Refresh Token sẽ được gửi kèm tự động nhờ cấu hình withCredentials
          const response = await axios.post<TokenDto>(
            `${API_URL}/api/auth/refresh`,
            { accessToken: null },
            { withCredentials: true }
          );

          const { accessToken } = response.data;
          setToken(accessToken);

          // Tải thông tin profile của người dùng
          const profile = await getProfileApi();
          setUser(profile);
        } catch (error) {
          // Bỏ qua lỗi nếu chưa đăng nhập hoặc Refresh Token hết hạn, đảm bảo sạch bộ nhớ
          logout();
        } finally {
          setIsInitialized(true);
        }
      };

      initializeAuth();
    }, [setToken, setUser, logout]);

    return { isInitialized };
  };
  
