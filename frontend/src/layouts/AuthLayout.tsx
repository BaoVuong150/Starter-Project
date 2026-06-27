import { Outlet } from 'react-router-dom';

export const AuthLayout = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100vw',
        padding: '24px',
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '40px 32px',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px', color: '#0f172a' }}>
            Omnichannel System
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            Hệ thống Quản lý Thương mại Điện tử Đa kênh
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};
