import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import type { TokenDto } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Bắt buộc để trình duyệt tự động gửi/nhận Cookie (HttpOnly)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Biến theo dõi trạng thái đang refresh token để tránh spam nhiều request refresh cùng lúc
let isRefreshing = false;

// Hàng đợi các request bị lỗi 401 chờ token mới
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Tự động đính kèm Access Token từ Zustand Store
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Tự động bắt lỗi 401 và làm mới Access Token (Token Rotation)
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Nếu lỗi 401 và request chưa được thử lại trước đó
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Tránh việc cố gắng refresh token khi chính API Auth (login/register/refresh) bị lỗi 401
      const isAuthUrl =
        originalRequest.url?.includes('/api/auth/login') ||
        originalRequest.url?.includes('/api/auth/register') ||
        originalRequest.url?.includes('/api/auth/refresh');

      if (isAuthUrl) {
        return Promise.reject(error);
      }

      // Nếu đang trong quá trình refresh token, đẩy request này vào hàng đợi chờ
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentAccessToken = useAuthStore.getState().accessToken;

      try {
        // Gọi API refresh token. Cookies chứa Refresh Token sẽ tự động được gửi kèm nhờ withCredentials
        const response = await axios.post<TokenDto>(
          `${API_URL}/api/auth/refresh`,
          { accessToken: currentAccessToken },
          { withCredentials: true }
        );

        const { accessToken } = response.data;

        // Lưu Access Token mới vào Zustand Store
        useAuthStore.getState().setToken(accessToken);

        // Chạy lại toàn bộ hàng đợi request đang chờ với token mới
        processQueue(null, accessToken);

        // Thử lại request hiện tại với token mới
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Nếu làm mới token thất bại (Refresh Token hết hạn), giải phóng hàng đợi, xóa sạch store (đăng xuất)
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
