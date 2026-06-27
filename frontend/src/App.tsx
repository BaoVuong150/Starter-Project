import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, Spin, theme } from 'antd';
import { AuthLayout } from './layouts/AuthLayout';
import { StorefrontLayout } from './layouts/StorefrontLayout';

// Lazy load các trang để tối ưu dung lượng tải ban đầu (Quy tắc 8)
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const HomePage = lazy(() => import('./features/products/pages/HomePage'));

// Khởi tạo QueryClient cho React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Loading Component hiển thị khi chuyển trang (Lazy Load)
const PageLoader = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      height: '100%',
      width: '100%',
    }}
  >
    <Spin size="large" />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm, // Đồng bộ giao diện Light Mode cho Ant Design
          token: {
            colorPrimary: '#4f46e5', // Đặt màu chủ đạo trùng với --primary-color trong CSS
            borderRadius: 8,
          },
        }}
      >
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* 🔓 Storefront Routes (Trang chủ bán hàng công khai) */}
              <Route element={<StorefrontLayout />}>
                <Route path="/" element={<HomePage />} />
              </Route>

              {/* 🔓 Auth Routes (Các trang xác thực) */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<div style={{ color: '#fff' }}>Trang Đăng ký (Mock Demo)</div>} />
              </Route>

              {/* Điều hướng các url không khớp về trang chủ */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
