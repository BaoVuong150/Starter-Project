import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthLayout } from './layouts/AuthLayout';
import { StorefrontLayout } from './layouts/StorefrontLayout';
import { ConfigProvider, Spin, theme, App as AntdApp } from 'antd';
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));
const HomePage = lazy(() => import('./features/products/pages/HomePage'));

import { useAuthInit } from './features/auth/hooks/useAuthInit';

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

// Tách biệt luồng định tuyến để sử dụng các hook xác thực sau khi khởi tạo providers
const MainApp = () => {
  const { isInitialized } = useAuthInit();

  if (!isInitialized) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          width: '100vw',
          backgroundColor: '#f8fafc',
          gap: '16px',
        }}
      >
        <Spin size="large" />
        <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
          Đang khôi phục phiên đăng nhập...
        </span>
      </div>
    );
  }

  return (
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
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Điều hướng các url không khớp về trang chủ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm, // Giao diện Light Mode cho Ant Design
          token: {
            colorPrimary: '#4f46e5', // Đặt màu chủ đạo trùng với --primary-color trong CSS
            borderRadius: 8,
          },
        }}
      >
        <AntdApp>
          <MainApp />
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
