import { Button } from 'antd';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, useLocation } from 'react-router-dom';

const LoginPage = () => {
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useAuthStore((state) => state.setUser);
  const navigate = useNavigate();
  const location = useLocation();

  // Lấy đường dẫn trước đó người dùng muốn truy cập (mặc định là trang chủ)
  const from = (location.state as any)?.from?.pathname || '/';

  const handleMockLogin = () => {
    // Thiết lập thông tin đăng nhập giả lập để test luồng Route bảo vệ
    setToken('mock-access-token');
    setUser({
      id: '1',
      userName: 'admin',
      email: 'admin@omnichannel.com',
      firstName: 'Hệ thống',
      lastName: 'Admin',
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    navigate(from, { replace: true });
  };

  return (
    <div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
        Đăng nhập vào hệ thống mua sắm OmniShop
      </p>
      <Button
        type="primary"
        size="large"
        block
        onClick={handleMockLogin}
        style={{
          background: 'var(--primary-color)',
          borderColor: 'var(--primary-color)',
          height: '48px',
          fontWeight: '600',
        }}
      >
        Đăng nhập hệ thống (Mock Demo)
      </Button>
    </div>
  );
};

export default LoginPage;
