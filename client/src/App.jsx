import { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function App() {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/products?query=${query}`);
      setProducts(res.data);
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to fetch products. Check console for details.');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#9333ea', marginBottom: '20px', fontSize: '3rem' }}>
        💄 Beautynomy
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '30px' }}>
        Compare beauty product prices across platforms
      </p>
      
      <div style={{ marginBottom: '30px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && search()}
          placeholder="Search for lipstick, foundation..."
          style={{
            padding: '12px',
            width: '300px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            marginRight: '10px',
            fontSize: '16px'
          }}
        />
        <button
          onClick={search}
          style={{
            padding: '12px 24px',
            background: '#9333ea',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Search
        </button>
      </div>

      {loading && <p>Loading products...</p>}

      {products.length === 0 && !loading && (
        <p style={{ color: '#6b7280' }}>Search for products to see price comparisons</p>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px' 
      }}>
        {products.map(product => (
          <div key={product.id} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            background: 'white',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <img 
              src={product.image} 
              alt={product.name} 
              style={{ width: '100%', borderRadius: '8px', marginBottom: '10px' }} 
            />
            <div style={{ color: '#9333ea', fontSize: '12px', fontWeight: 'bold' }}>
              {product.brand}
            </div>
            <h3 style={{ marginTop: '5px' }}>{product.name}</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '5px' }}>
              {product.description}
            </p>
            
            <div style={{ marginTop: '15px' }}>
              {product.prices.map((price, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  marginTop: '8px'
                }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{price.platform}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      ⭐ {price.rating} ({price.reviews})
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#9333ea' }}>
                      ₹{price.price}
                    </span>
                    <a
                      href={price.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '8px 16px',
                        background: '#9333ea',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '6px',
                        fontSize: '14px'
                      }}
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
