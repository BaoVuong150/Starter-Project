import { Layout, Input, Badge, Button, Space, Avatar } from 'antd';
import { ShoppingCartOutlined, SearchOutlined, LoginOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/store/useAuthStore';

const { Header, Content, Footer } = Layout;

export const StorefrontLayout = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);

  const handleAuthAction = () => {
    if (isAuthenticated) {
      logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header
        className="sticky top-0 z-[100] w-full flex items-center justify-between bg-white/75 backdrop-blur-md border-b border-slate-900/8 px-6 h-[72px]"
      >
        {/* Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <span className="text-[22px] font-extrabold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent tracking-[0.5px]">
            OMNISHOP
          </span>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="flex-1 max-w-[480px] mx-6">
          <Input
            prefix={<SearchOutlined style={{ color: 'rgba(15, 23, 42, 0.45)' }} />}
            placeholder="Tìm kiếm sản phẩm..."
            variant="filled"
            className="bg-slate-900/4 border border-slate-900/8 text-slate-900 rounded-[20px] h-[38px]"
          />
        </div>

        {/* User Action Controls */}
        <Space size="large">
          <Badge count={2} size="small" offset={[2, 0]} color="var(--primary-color)">
            <Button
              type="text"
              icon={<ShoppingCartOutlined style={{ fontSize: '22px', color: '#0f172a' }} />}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            />
          </Badge>

          {isAuthenticated ? (
            <Space size="middle">
              <Space size="small">
                <Avatar icon={<UserOutlined />} src={user?.avatarUrl} style={{ backgroundColor: 'var(--primary-color)' }} />
                <span
                  style={{
                    color: '#0f172a',
                    fontWeight: 500,
                    display: 'inline-block',
                    maxWidth: '120px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.firstName}
                </span>
              </Space>
              <Button
                type="text"
                danger
                icon={<LogoutOutlined />}
                onClick={handleAuthAction}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                Đăng xuất
              </Button>
            </Space>
          ) : (
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={handleAuthAction}
              style={{
                background: 'linear-gradient(to right, #4f46e5, #4338ca)',
                border: 'none',
                borderRadius: '20px',
                height: '38px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              Đăng nhập
            </Button>
          )}
        </Space>
      </Header>

      <Content style={{ padding: '0 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, maxWidth: '1200px', width: '100%', margin: '0 auto', padding: '32px 0' }}>
          <Outlet />
        </div>
      </Content>

      <Footer
        style={{
          textAlign: 'center',
          background: 'rgba(241, 245, 249, 0.8)',
          borderTop: '1px solid rgba(15, 23, 42, 0.08)',
          color: 'var(--text-secondary)',
          padding: '24px 0',
          fontSize: '14px',
        }}
      >
        ©{new Date().getFullYear()} OmniShop. Cửa hàng thương mại điện tử đa kênh hiện đại.
      </Footer>
    </Layout>
  );
};
