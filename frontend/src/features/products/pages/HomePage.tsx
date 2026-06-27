import { Card, Button, Row, Col, Badge, Rate } from 'antd';
import { ShoppingCartOutlined, FireOutlined } from '@ant-design/icons';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  rating: number;
  image: string;
  tag?: string;
  specs: string[];
}

export const HomePage = () => {
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'iPhone 15 Pro Max Titanium',
      price: 29990000,
      originalPrice: 34990000,
      rating: 5,
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60',
      tag: 'Hot',
      specs: ['Chip A17 Pro siêu mạnh', 'Màn hình 6.7 inch Super Retina XDR', 'Camera zoom quang học 5x'],
    },
    {
      id: '2',
      name: 'MacBook Pro M3 Max 16-inch',
      price: 79990000,
      originalPrice: 89990000,
      rating: 5,
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=60',
      tag: 'Bán chạy',
      specs: ['Vi xử lý M3 Max đỉnh cao', '36GB RAM Unified Memory', 'Ổ cứng SSD 1TB siêu tốc'],
    },
    {
      id: '3',
      name: 'Sony WH-1000XM5 Headphones',
      price: 6490000,
      originalPrice: 8490000,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
      specs: ['Chống ồn chủ động đỉnh cấp', 'Thời lượng pin 30 giờ sử dụng', 'Âm thanh chất lượng cao Hi-Res'],
    },
    {
      id: '4',
      name: 'Apple Watch Ultra 2 Titanium',
      price: 19990000,
      originalPrice: 21990000,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=500&auto=format&fit=crop&q=60',
      tag: 'Khuyến mãi',
      specs: ['Khung Titan độ bền chuẩn quân đội', 'GPS tần số kép chính xác', 'Độ sáng màn hình 3000 nits'],
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="glass-panel p-12 mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600/8 to-purple-600/8">
        <div className="max-w-[600px] z-[2] relative">
          <h1 className="text-[40px] font-extrabold leading-[1.2] text-slate-900 mb-4">
            Bùng nổ công nghệ <br />
            <span className="text-primary">Ưu đãi đến 30%</span>
          </h1>
          <p className="text-slate-600 text-base mb-6">
            Khám phá các sản phẩm công nghệ mới nhất với mức giá hấp dẫn cùng dịch vụ mua sắm trực tuyến chuyên nghiệp.
          </p>
          <Button
            type="primary"
            size="large"
            icon={<FireOutlined />}
            style={{
              background: 'linear-gradient(to right, #4f46e5, #7c3aed)',
              border: 'none',
              height: '48px',
              borderRadius: '24px',
              padding: '0 32px',
              fontWeight: 600,
            }}
          >
            Mua Ngay
          </Button>
        </div>
      </div>

      {/* Danh sách sản phẩm */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-slate-900">
          Sản Phẩm Nổi Bật
        </h2>
        <Row gutter={[24, 24]}>
          {mockProducts.map((product) => (
            <Col xs={24} sm={12} md={8} lg={6} key={product.id}>
              <Badge.Ribbon
                text={product.tag}
                color={product.tag === 'Hot' ? 'red' : 'var(--primary-color)'}
                style={{ display: product.tag ? 'block' : 'none' }}
              >
                <Card
                  hoverable
                  cover={
                    <div style={{ height: '220px', overflow: 'hidden', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                       <img
                        alt={product.name}
                        src={product.image}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease',
                        }}
                      />
                    </div>
                  }
                  style={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(15, 23, 42, 0.06)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                  }}
                  styles={{ body: { padding: '20px' } }}
                >
                  <div style={{ minHeight: '60px', marginBottom: '8px' }}>
                    <h3 style={{ color: '#0f172a', fontSize: '16px', fontWeight: '600', margin: 0, lineHeight: '1.4' }}>
                      {product.name}
                    </h3>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <Rate disabled defaultValue={product.rating} style={{ fontSize: '14px' }} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ color: '#4f46e5', fontSize: '18px', fontWeight: '700' }}>
                      {formatPrice(product.price)}
                    </div>
                    <div style={{ color: 'var(--text-secondary)', textDecoration: 'line-through', fontSize: '14px' }}>
                      {formatPrice(product.originalPrice)}
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <ul style={{ paddingLeft: '16px', margin: 0 }}>
                      {product.specs.map((spec, index) => (
                        <li key={index} style={{ marginBottom: '4px' }}>{spec}</li>
                      ))}
                    </ul>
                  </div>

                  <Button
                    type="primary"
                    block
                    icon={<ShoppingCartOutlined />}
                    style={{
                      background: 'rgba(79, 70, 229, 0.06)',
                      borderColor: 'rgba(79, 70, 229, 0.2)',
                      color: '#4f46e5',
                      height: '40px',
                      borderRadius: '8px',
                      fontWeight: 600,
                    }}
                  >
                    Thêm vào giỏ
                  </Button>
                </Card>
              </Badge.Ribbon>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default HomePage;
