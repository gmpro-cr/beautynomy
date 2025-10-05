
import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/products?query=${query}`);
      setProducts(res.data);
      setCurrentPage('results');
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to fetch products');
    }
    setLoading(false);
  };

  const Navbar = () => (
    <nav style={{
      background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)',
      borderBottom: '1px solid #e9d5ff',
      padding: '20px 0',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div onClick={() => setCurrentPage('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '32px' }}>💄</span>
          <span style={{ fontSize: '28px', fontWeight: '700', background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Beautynomy
          </span>
        </div>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <button onClick={() => setCurrentPage('home')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>Home</button>
          <button onClick={() => setCurrentPage('about')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>About</button>
          <button onClick={() => setCurrentPage('contact')} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>Contact</button>
        </div>
      </div>
    </nav>
  );

  const Hero = () => (
    <div style={{
      background: 'linear-gradient(135deg, #faf5ff 0%, #fce7f3 50%, #fef3c7 100%)',
      padding: '80px 20px',
      textAlign: 'center'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: '56px',
          fontWeight: '700',
          marginBottom: '20px',
          background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: '1.2'
        }}>
          Where Beauty Meets Simplicity
        </h1>
        <p style={{ fontSize: '20px', color: '#6b7280', marginBottom: '40px', lineHeight: '1.6' }}>
          Compare prices across platforms and discover the best deals on your favorite beauty products
        </p>
        
        <div style={{ maxWidth: '600px', margin: '0 auto', position: 'relative' }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && search()}
            placeholder="Search for lipstick, foundation, skincare..."
            style={{
              width: '100%',
              padding: '18px 24px',
              paddingRight: '140px',
              border: '2px solid #e9d5ff',
              borderRadius: '50px',
              fontSize: '16px',
              outline: 'none',
              transition: 'all 0.3s ease',
              background: 'white'
            }}
            onFocus={(e) => e.target.style.borderColor = '#a855f7'}
            onBlur={(e) => e.target.style.borderColor = '#e9d5ff'}
          />
          <button
            onClick={search}
            style={{
              position: 'absolute',
              right: '6px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              color: 'white',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '50px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-50%) scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(-50%) scale(1)'}
          >
            Search
          </button>
        </div>

        <div style={{ marginTop: '30px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>Popular:</span>
          {['Foundation', 'Lipstick', 'Serum'].map(term => (
            <button
              key={term}
              onClick={() => { setQuery(term); search(); }}
              style={{
                background: 'white',
                border: '1px solid #e9d5ff',
                padding: '6px 16px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#a855f7',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => { e.target.style.background = '#faf5ff'; e.target.style.borderColor = '#a855f7'; }}
              onMouseLeave={(e) => { e.target.style.background = 'white'; e.target.style.borderColor = '#e9d5ff'; }}
            >
              {term}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const Results = () => (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
          {query ? `Results for "${query}"` : 'Featured Products'}
        </h2>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>
          {products.length} products found
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '18px', color: '#9ca3af' }}>Searching for the best deals...</div>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '30px' 
      }}>
        {products.map(product => {
          const lowestPrice = Math.min(...product.prices.map(p => p.price));
          const highestPrice = Math.max(...product.prices.map(p => p.price));
          const savings = highestPrice - lowestPrice;

          return (
            <div key={product.id} style={{
              background: 'white',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ position: 'relative' }}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  style={{ width: '100%', height: '280px', objectFit: 'cover' }} 
                />
                {savings > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    background: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: '700',
                    boxShadow: '0 4px 12px rgba(236,72,153,0.3)'
                  }}>
                    Save ₹{savings}
                  </div>
                )}
              </div>
              
              <div style={{ padding: '24px' }}>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#a855f7', 
                  textTransform: 'uppercase', 
                  letterSpacing: '1px',
                  marginBottom: '8px'
                }}>
                  {product.brand}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                  {product.name}
                </h3>
                <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', marginBottom: '20px' }}>
                  {product.description}
                </p>
                
                <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                  {product.prices.map((price, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: '#faf5ff',
                      borderRadius: '12px',
                      marginBottom: '8px'
                    }}>
                      <div>
                        <div style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>
                          {price.platform}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                          ⭐ {price.rating} ({price.reviews.toLocaleString()})
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ 
                          fontSize: '22px', 
                          fontWeight: '700', 
                          background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>
                          ₹{price.price.toLocaleString()}
                        </span>
                        
                        <a
                          href={price.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            padding: '8px 20px',
                            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                          onMouseLeave={(e) => e.target.style.opacity = '1'}
                        >
                          View
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!loading && products.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
          <h3 style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
            {query ? 'No products found' : 'Start your beauty journey'}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            {query ? 'Try a different search term' : 'Search for your favorite products above'}
          </p>
        </div>
      )}
    </div>
  );

  const About = () => (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px' }}>
      <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>
        About Beautynomy
      </h1>
      <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#6b7280', marginBottom: '20px' }}>
        Welcome to Beautynomy, where beauty meets smart shopping. We believe everyone deserves access to the best beauty products at the best prices.
      </p>
      <p style={{ fontSize: '18px', lineHeight: '1.8', color: '#6b7280' }}>
        Our platform compares prices across multiple e-commerce sites, helping you make informed decisions and save money on your favorite products.
      </p>
    </div>
  );

  const Contact = () => (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '60px 20px' }}>
      <h1 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '24px', color: '#111827' }}>
        Get in Touch
      </h1>
      <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '30px' }}>
        Have questions or feedback? We'd love to hear from you.
      </p>
      <div style={{ background: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
        <input 
          type="text" 
          placeholder="Your Name"
          style={{
            width: '100%',
            padding: '14px 18px',
            marginBottom: '16px',
            border: '2px solid #e9d5ff',
            borderRadius: '12px',
            fontSize: '15px'
          }}
        />
        <input 
          type="email" 
          placeholder="Your Email"
          style={{
            width: '100%',
            padding: '14px 18px',
            marginBottom: '16px',
            border: '2px solid #e9d5ff',
            borderRadius: '12px',
            fontSize: '15px'
          }}
        />
        <textarea 
          placeholder="Your Message"
          rows="5"
          style={{
            width: '100%',
            padding: '14px 18px',
            marginBottom: '20px',
            border: '2px solid #e9d5ff',
            borderRadius: '12px',
            fontSize: '15px',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
        <button
          style={{
            width: '100%',
            padding: '16px',
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Send Message
        </button>
      </div>
    </div>
  );

  const Footer = () => (
    <footer style={{
      background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
      color: 'white',
      padding: '60px 20px 30px',
      marginTop: '80px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>💄 Beautynomy</div>
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Your trusted beauty price comparison platform</p>
          </div>
          <div>
            <h4 style={{ marginBottom: '12px', fontSize: '16px' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={() => setCurrentPage('home')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', textAlign: 'left', fontSize: '14px' }}>Home</button>
              <button onClick={() => setCurrentPage('about')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', textAlign: 'left', fontSize: '14px' }}>About</button>
              <button onClick={() => setCurrentPage('contact')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', textAlign: 'left', fontSize: '14px' }}>Contact</button>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #374151', paddingTop: '20px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
          © 2025 Beautynomy. All rights reserved.
        </div>
      </div>
    </footer>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Navbar />
      {currentPage === 'home' && (
        <>
          <Hero />
          <Results />
        </>
      )}
      {currentPage === 'results' && <Results />}
      {currentPage === 'about' && <About />}
      {currentPage === 'contact' && <Contact />}
      <Footer />
    </div>
  );
}