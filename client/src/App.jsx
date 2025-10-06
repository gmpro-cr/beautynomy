import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);

  // Load featured products on mount
  useEffect(() => {
    fetchProducts('');
  }, []);

  const fetchProducts = async (searchTerm) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/products${searchTerm ? `?query=${searchTerm}` : ''}`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error:', err);
    }
    setLoading(false);
  };

  const search = () => {
    fetchProducts(query);
    setCurrentPage('home');
  };

  const styles = {
    button: {
      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.3s ease',
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fefefe', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Navbar */}
      <nav style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderBottom: '1px solid rgba(233, 213, 255, 0.3)',
        padding: '16px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div onClick={() => setCurrentPage('home')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '26px' }}>💄</div>
            <span style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.5px'
            }}>
              Beautynomy
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <button onClick={() => setCurrentPage('home')} style={{ background: 'none', border: 'none', color: currentPage === 'home' ? '#a855f7' : '#6b7280', cursor: 'pointer', fontSize: '15px', fontWeight: '500', transition: 'color 0.2s' }}>Home</button>
            <button onClick={() => setCurrentPage('about')} style={{ background: 'none', border: 'none', color: currentPage === 'about' ? '#a855f7' : '#6b7280', cursor: 'pointer', fontSize: '15px', fontWeight: '500', transition: 'color 0.2s' }}>About</button>
            <button onClick={() => setCurrentPage('contact')} style={{ background: 'none', border: 'none', color: currentPage === 'contact' ? '#a855f7' : '#6b7280', cursor: 'pointer', fontSize: '15px', fontWeight: '500', transition: 'color 0.2s' }}>Contact</button>
          </div>
        </div>
      </nav>

      {currentPage === 'home' && (
        <>
          {/* Hero Section */}
          <div style={{
            background: 'linear-gradient(180deg, rgba(250, 245, 255, 0.8) 0%, rgba(255, 255, 255, 0) 100%)',
            padding: '80px 24px 60px',
            textAlign: 'center'
          }}>
            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
              <h1 style={{
                fontSize: 'clamp(40px, 8vw, 64px)',
                fontWeight: '800',
                marginBottom: '20px',
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: '1.1',
                letterSpacing: '-1.5px'
              }}>
                Where Beauty<br/>Meets Simplicity
              </h1>
              <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '48px', lineHeight: '1.7', maxWidth: '600px', margin: '0 auto 48px' }}>
                Compare prices across leading platforms and discover the best deals on your favorite beauty products
              </p>
              
              {/* Search Bar */}
              <div style={{ maxWidth: '650px', margin: '0 auto 30px', position: 'relative' }}>
                <div style={{ 
                  display: 'flex', 
                  background: 'white', 
                  borderRadius: '16px', 
                  padding: '8px',
                  boxShadow: '0 10px 40px rgba(168, 85, 247, 0.15), 0 4px 12px rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(233, 213, 255, 0.5)'
                }}>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && search()}
                    placeholder="Search for lipstick, foundation, skincare..."
                    style={{
                      flex: 1,
                      padding: '16px 20px',
                      border: 'none',
                      fontSize: '16px',
                      outline: 'none',
                      background: 'transparent',
                      color: '#111827'
                    }}
                  />
                  <button
                    onClick={search}
                    style={{
                      ...styles.button,
                      padding: '16px 36px',
                      borderRadius: '12px',
                      fontSize: '15px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Popular Tags */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ color: '#9ca3af', fontSize: '14px', fontWeight: '500' }}>Trending:</span>
                {['Foundation', 'Lipstick', 'Serum'].map(term => (
                  <button
                    key={term}
                    onClick={() => { setQuery(term); fetchProducts(term); }}
                    style={{
                      background: 'rgba(250, 245, 255, 0.8)',
                      border: '1px solid rgba(168, 85, 247, 0.2)',
                      padding: '8px 18px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#a855f7',
                      fontWeight: '500',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { 
                      e.target.style.background = '#faf5ff'; 
                      e.target.style.borderColor = '#a855f7';
                      e.target.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => { 
                      e.target.style.background = 'rgba(250, 245, 255, 0.8)'; 
                      e.target.style.borderColor = 'rgba(168, 85, 247, 0.2)';
                      e.target.style.transform = 'translateY(0)';
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 24px 80px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  border: '4px solid #f3f4f6', 
                  borderTop: '4px solid #a855f7',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 20px'
                }}></div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <p style={{ color: '#9ca3af', fontSize: '16px' }}>Finding the best deals...</p>
              </div>
            ) : products.length > 0 ? (
              <>
                <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '32px', fontWeight: '700', color: '#111827', marginBottom: '8px' }}>
                    {query ? `Results for "${query}"` : 'Featured Products'}
                  </h2>
                  <p style={{ color: '#6b7280', fontSize: '16px' }}>
                    {products.length} premium {products.length === 1 ? 'product' : 'products'} available
                  </p>
                </div>

                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))', 
                  gap: '32px' 
                }}>
                  {products.map(product => {
                    const lowestPrice = Math.min(...product.prices.map(p => p.price));
                    const highestPrice = Math.max(...product.prices.map(p => p.price));
                    const savings = highestPrice - lowestPrice;

                    return (
                      <div key={product.id} style={{
                        background: 'white',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        border: '1px solid rgba(243, 244, 246, 0.8)',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 20px 40px rgba(168, 85, 247, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.04)';
                      }}
                      >
                        <div style={{ position: 'relative', background: 'linear-gradient(180deg, #fafafa 0%, #ffffff 100%)' }}>
                          <div style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden' }}>
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              style={{ 
                                position: 'absolute',
                                top: '0',
                                left: '0',
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                transition: 'transform 0.5s ease'
                              }}
                              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                            />
                          </div>
                          <div style={{
                            position: 'absolute',
                            top: '16px',
                            left: '16px',
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(8px)',
                            padding: '8px 12px',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <span style={{ fontSize: '12px', color: '#4b5563' }}>⭐</span>
                            <span style={{ 
                              fontSize: '13px', 
                              fontWeight: '600', 
                              color: '#111827',
                              borderRight: '1px solid #e5e7eb',
                              paddingRight: '8px'
                            }}>
                              {(product.prices.reduce((acc, curr) => acc + curr.rating, 0) / product.prices.length).toFixed(1)}
                            </span>
                            <span style={{ fontSize: '12px', color: '#6b7280' }}>
                              {product.prices.reduce((acc, curr) => acc + curr.reviews, 0).toLocaleString()} reviews
                            </span>
                          </div>
                          {savings > 0 && (
                            <div style={{
                              position: 'absolute',
                              top: '16px',
                              right: '16px',
                              background: 'linear-gradient(135deg, #ec4899 0%, #f97316 100%)',
                              color: 'white',
                              padding: '10px 18px',
                              borderRadius: '12px',
                              fontSize: '13px',
                              fontWeight: '700',
                              boxShadow: '0 8px 20px rgba(236, 72, 153, 0.4)',
                              letterSpacing: '0.3px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px'
                            }}>
                              <span style={{ fontSize: '16px' }}>💰</span>
                              Save ₹{savings.toLocaleString()}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ padding: '28px' }}>
                          <div style={{ 
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '16px'
                          }}>
                            <div>
                              <div style={{ 
                                fontSize: '11px', 
                                fontWeight: '800', 
                                color: '#a855f7', 
                                textTransform: 'uppercase', 
                                letterSpacing: '1.5px',
                                marginBottom: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                              }}>
                                {product.brand}
                                {product.isVerified && (
                                  <span style={{ 
                                    background: '#ecfdf5', 
                                    color: '#059669',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '10px'
                                  }}>
                                    VERIFIED
                                  </span>
                                )}
                              </div>
                              <h3 style={{ 
                                fontSize: '22px', 
                                fontWeight: '700', 
                                color: '#111827', 
                                marginBottom: '10px',
                                lineHeight: '1.3',
                                letterSpacing: '-0.3px'
                              }}>
                                {product.name}
                              </h3>
                            </div>
                            <button
                              onClick={() => alert('Added to wishlist!')}
                              style={{
                                background: 'white',
                                border: '1px solid #e5e7eb',
                                borderRadius: '50%',
                                width: '40px',
                                height: '40px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#fdf2f8';
                                e.currentTarget.style.borderColor = '#fbcfe8';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'white';
                                e.currentTarget.style.borderColor = '#e5e7eb';
                              }}
                            >
                              ❤️
                            </button>
                          </div>

                          <div style={{ marginBottom: '20px' }}>
                            {product.highlights && product.highlights.map((highlight, i) => (
                              <div key={i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '6px',
                                color: '#6b7280',
                                fontSize: '13px'
                              }}>
                                <span style={{ color: '#a855f7' }}>✓</span>
                                {highlight}
                              </div>
                            ))}
                          </div>

                          <p style={{ 
                            color: '#6b7280', 
                            fontSize: '14px', 
                            lineHeight: '1.6', 
                            marginBottom: '24px'
                          }}>
                            {product.description}
                          </p>

                          {product.tags && (
                            <div style={{
                              display: 'flex',
                              gap: '8px',
                              flexWrap: 'wrap',
                              marginBottom: '24px'
                            }}>
                              {product.tags.map((tag, i) => (
                                <span key={i} style={{
                                  background: '#f3f4f6',
                                  padding: '6px 12px',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  color: '#4b5563'
                                }}>
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '24px' }}>
                            <div style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: '20px'
                            }}>
                              <div>
                                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Price Range</div>
                                <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                                  ₹{Math.min(...product.prices.map(p => p.price)).toLocaleString()} - ₹{Math.max(...product.prices.map(p => p.price)).toLocaleString()}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Average Rating</div>
                                <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  ⭐ {(product.prices.reduce((acc, curr) => acc + curr.rating, 0) / product.prices.length).toFixed(1)}
                                </div>
                              </div>
                            </div>

                            {product.prices.map((price, i) => (
                              <div key={i} style={{
                                padding: '16px',
                                background: price.price === lowestPrice ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(236, 72, 153, 0.08) 100%)' : '#fafafa',
                                borderRadius: '16px',
                                marginBottom: '12px',
                                border: price.price === lowestPrice ? '1.5px solid rgba(168, 85, 247, 0.2)' : '1px solid transparent',
                                position: 'relative',
                                overflow: 'hidden'
                              }}>
                                {price.price === lowestPrice && (
                                  <div style={{
                                    position: 'absolute',
                                    top: '12px',
                                    right: '-32px',
                                    background: '#a855f7',
                                    color: 'white',
                                    padding: '4px 40px',
                                    transform: 'rotate(45deg)',
                                    fontSize: '11px',
                                    fontWeight: '600',
                                    letterSpacing: '0.5px'
                                  }}>
                                    BEST PRICE
                                  </div>
                                )}

                                <div style={{ 
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                  marginBottom: '12px'
                                }}>
                                  <div style={{ flex: 1 }}>
                                    <div style={{ 
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '8px',
                                      marginBottom: '4px'
                                    }}>
                                      <img 
                                        src={price.platformLogo || 'default-logo.png'}
                                        alt={price.platform}
                                        style={{
                                          width: '20px',
                                          height: '20px',
                                          borderRadius: '4px'
                                        }}
                                      />
                                      <span style={{ fontWeight: '600', color: '#111827', fontSize: '15px' }}>
                                        {price.platform}
                                      </span>
                                      {price.isOfficial && (
                                        <span style={{
                                          background: '#ecfdf5',
                                          color: '#059669',
                                          padding: '2px 8px',
                                          borderRadius: '12px',
                                          fontSize: '11px',
                                          fontWeight: '500'
                                        }}>
                                          Official Store
                                        </span>
                                      )}
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <span>⭐ {price.rating} ({price.reviews.toLocaleString()} reviews)</span>
                                      {price.delivery && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                          🚚 {price.delivery}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'right' }}>
                                    {price.originalPrice && price.originalPrice > price.price && (
                                      <div style={{ 
                                        fontSize: '14px',
                                        color: '#6b7280',
                                        textDecoration: 'line-through',
                                        marginBottom: '2px'
                                      }}>
                                        ₹{price.originalPrice.toLocaleString()}
                                      </div>
                                    )}
                                    <div style={{ 
                                      fontSize: '24px', 
                                      fontWeight: '800', 
                                      background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                                      WebkitBackgroundClip: 'text',
                                      WebkitTextFillColor: 'transparent',
                                      letterSpacing: '-0.5px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      justifyContent: 'flex-end'
                                    }}>
                                      ₹{price.price.toLocaleString()}
                                      {price.originalPrice && price.originalPrice > price.price && (
                                        <span style={{
                                          fontSize: '13px',
                                          color: '#059669',
                                          fontWeight: '600',
                                          marginLeft: '8px'
                                        }}>
                                          {Math.round((1 - price.price/price.originalPrice) * 100)}% OFF
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {price.offers && price.offers.length > 0 && (
                                  <div style={{
                                    display: 'flex',
                                    gap: '8px',
                                    marginBottom: '12px'
                                  }}>
                                    {price.offers.map((offer, j) => (
                                      <div key={j} style={{
                                        background: '#f3f4f6',
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        color: '#4b5563',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}>
                                        🏷️ {offer}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <a
                                  href={price.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  style={{
                                    width: '100%',
                                    background: price.price === lowestPrice 
                                      ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)'
                                      : '#fff',
                                    color: price.price === lowestPrice ? '#fff' : '#111827',
                                    border: price.price === lowestPrice 
                                      ? 'none'
                                      : '1px solid #e5e7eb',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    textDecoration: 'none'
                                  }}
                                >
                                  {price.price === lowestPrice ? 'Buy at Best Price' : 'Visit Store'}
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    width="16" 
                                    height="16" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2"
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  >
                                    <path d="M7 7l5 5-5 5"/>
                                    <path d="M13 7l5 5-5 5"/>
                                  </svg>
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: '64px', marginBottom: '24px', opacity: 0.5 }}>🔍</div>
                <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', marginBottom: '12px' }}>
                  No products found
                </h3>
                <p style={{ color: '#6b7280', fontSize: '16px', maxWidth: '400px', margin: '0 auto' }}>
                  Try adjusting your search or browse our trending products
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {currentPage === 'about' && (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '80px 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '24px', color: '#111827', letterSpacing: '-1px' }}>
            About Beautynomy
          </h1>
          <div style={{ fontSize: '18px', lineHeight: '1.8', color: '#6b7280', space: '20px' }}>
            <p style={{ marginBottom: '20px' }}>
              Welcome to Beautynomy, where beauty meets smart shopping. We believe everyone deserves access to the best beauty products at the best prices.
            </p>
            <p>
              Our platform compares prices across multiple leading e-commerce sites, helping you make informed decisions and save money on your favorite products.
            </p>
          </div>
        </div>
      )}

      {currentPage === 'contact' && (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '80px 24px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '24px', color: '#111827', letterSpacing: '-1px' }}>
            Get in Touch
          </h1>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '40px', lineHeight: '1.7' }}>
            Have questions or feedback? We'd love to hear from you.
          </p>
          <div style={{ background: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)' }}>
            <input 
              type="text" 
              placeholder="Your Name"
              style={{
                width: '100%',
                padding: '16px 20px',
                marginBottom: '20px',
                border: '2px solid #f3f4f6',
                borderRadius: '14px',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#e9d5ff'}
              onBlur={(e) => e.target.style.borderColor = '#f3f4f6'}
            />
            <input 
              type="email" 
              placeholder="Your Email"
              style={{
                width: '100%',
                padding: '16px 20px',
                marginBottom: '20px',
                border: '2px solid #f3f4f6',
                borderRadius: '14px',
                fontSize: '15px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#e9d5ff'}
              onBlur={(e) => e.target.style.borderColor = '#f3f4f6'}
            />
            <textarea 
              placeholder="Your Message"
              rows="5"
              style={{
                width: '100%',
                padding: '16px 20px',
                marginBottom: '24px',
                border: '2px solid #f3f4f6',
                borderRadius: '14px',
                fontSize: '15px',
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#e9d5ff'}
              onBlur={(e) => e.target.style.borderColor = '#f3f4f6'}
            />
            <button
              style={{
                ...styles.button,
                width: '100%',
                padding: '16px',
                borderRadius: '14px',
                fontSize: '16px'
              }}
            >
              Send Message
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        color: 'white',
        padding: '60px 24px 30px'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
            <div>
              <div style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>💄 Beautynomy</div>
              <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.6' }}>Your trusted beauty price comparison platform</p>
            </div>
            <div>
              <h4 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button onClick={() => setCurrentPage('home')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', textAlign: 'left', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Home</button>
                <button onClick={() => setCurrentPage('about')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', textAlign: 'left', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>About</button>
                <button onClick={() => setCurrentPage('contact')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', textAlign: 'left', fontSize: '14px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'white'} onMouseLeave={(e) => e.target.style.color = '#9ca3af'}>Contact</button>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #374151', paddingTop: '24px', textAlign: 'center', color: '#9ca3af', fontSize: '14px' }}>
            © 2025 Beautynomy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
