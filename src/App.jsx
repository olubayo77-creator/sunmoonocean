import { useState, useEffect } from 'react'
import { products } from './data/products'
import './App.css'

function App() {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('smo-cart')) || []
    } catch {
      return []
    }
  })
  const [cartOpen, setCartOpen] = useState(false)
  const [activeAdminTab, setActiveAdminTab] = useState('Trend Research')
  const [isResearchRunning, setIsResearchRunning] = useState(false)

  useEffect(() => {
    localStorage.setItem('smo-cart', JSON.stringify(cart))
  }, [cart])


  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      }
      return [...prev, { ...product, qty: 1 }]
    })
    setCartOpen(true)
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id !== id) return item
      const newQty = Math.max(1, item.qty + delta)
      return { ...item, qty: newQty }
    }))
  }

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }



  const runResearch = () => {
    setIsResearchRunning(true)
    setTimeout(() => {
      setIsResearchRunning(false)
    }, 2000)
  }

  const featuredProducts = products.filter(p => p.isFeatured)
  const trendingProducts = products.filter(p => p.isTrending)
  const dadDaughterPicks = products.filter(p => p.tags?.includes('dad-daughter-pick'))

  const categories = [
    { emoji: '🔬', name: 'STEM Toys' },
    { emoji: '🌳', name: 'Outdoor Play' },
    { emoji: '🎨', name: 'Arts & Crafts' },
    { emoji: '🧩', name: 'Games & Puzzles' },
    { emoji: '🍼', name: 'Baby & Toddler' },
    { emoji: '🎭', name: 'Dress Up & Role Play' }
  ]

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
  }

  return (
    <div className="app">
      {/* Navigation */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo" onClick={() => scrollToSection('hero')}>
            <span className="brand-coral">Sun</span>
            <span className="brand-teal">Moon</span>
            <span className="brand-sand">Ocean</span>
          </div>
          <div className="nav-links">
            <a onClick={() => scrollToSection('featured')}>Shop</a>
            <a onClick={() => scrollToSection('trending')}>Trending</a>
            <a onClick={() => scrollToSection('about')}>About</a>
            <a onClick={() => scrollToSection('footer')}>Contact</a>
          </div>
          <div className="nav-actions">
            <button className="cart-btn" onClick={() => setCartOpen(true)}>
              🛒
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
            <button className="nav-cta" onClick={() => scrollToSection('featured')}>
              Shop Now
            </button>
          </div>
        </div>
      </nav>

      {/* Cart Drawer */}
      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-drawer" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h3>🛒 Your Cart ({cartCount})</h3>
              <button className="cart-close" onClick={() => setCartOpen(false)}>✕</button>
            </div>
            {cart.length === 0 ? (
              <div className="cart-empty">
                <p>Your cart is empty 🛍️</p>
                <button className="btn-primary" onClick={() => { setCartOpen(false); scrollToSection('featured') }}>
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div className="cart-item" key={item.id}>
                      <div className="cart-item-emoji">{item.image.emoji}</div>
                      <div className="cart-item-info">
                        <div className="cart-item-name">{item.name}</div>
                        <div className="cart-item-price">{formatCurrency(item.price)}</div>
                        <div className="cart-item-qty">
                          <button onClick={() => updateQty(item.id, -1)}>−</button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)}>+</button>
                        </div>
                      </div>
                      <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>🗑️</button>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total:</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  <p className="cart-note">Amazon products open directly on Amazon in a new tab.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section id="hero" className="hero">
        <div className="hero-blobs">
          <div className="hero-blob"></div>
          <div className="hero-blob"></div>
          <div className="hero-blob"></div>
        </div>
        <div className="hero-content">
          <div className="hero-emoji-cluster">
            <span>🚀</span>
            <span>🧸</span>
            <span>🎨</span>
            <span>🧩</span>
            <span>🌊</span>
          </div>
          <div className="hero-badge">✨ Discover Joy in Every Box</div>
          <h1 className="hero-title">
            <span className="hero-tagline">The best toy is an excuse to play together</span>
          </h1>
          <p className="hero-subtitle">
            SunMoonOcean helps dads find gifts that spark laughter, imagination, and real connection with their daughters.
            Fun viral picks, memorable moments, and toys worth getting down on the floor for.
          </p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={() => scrollToSection('featured')}>
              🛍️ Shop Now
            </button>
            <button className="btn-secondary" onClick={() => scrollToSection('trending')}>
              🔥 See What's Trending
            </button>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-value">10,000+</div>
              <div className="hero-stat-label">Happy Kids</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">Free Ship</div>
              <div className="hero-stat-label">Orders Over $35</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">⭐ 5-Star</div>
              <div className="hero-stat-label">Top Rated</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="featured">
        <div className="section-header">
          <div className="section-tag">Our Picks</div>
          <h2 className="section-title">Featured Products</h2>
          <p className="section-subtitle">Direct Amazon affiliate picks chosen for fun, connection, and play time that dads and daughters can share</p>
        </div>
        <div className="products-grid">
          {featuredProducts.map(product => (
            <div className="product-card" key={product.id}>
              <div className="product-image" style={{ background: product.image.bg }}>
                {product.isTrending && (
                  <span className="trending-badge">🔥 Trending</span>
                )}
                {product.image.src ? (
                  <img
                    src={product.image.src}
                    alt={product.image.alt || product.name}
                    className="product-photo"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.parentElement.querySelector('.product-emoji-fallback')
                      if (fallback) fallback.style.display = 'block'
                    }}
                  />
                ) : null}
                <span className="product-emoji-fallback" style={{ display: product.image.src ? 'none' : 'block' }}>{product.image.emoji || '🛍️'}</span>
              </div>
              <div className="product-info">
                <div className="product-name">{product.name}</div>
                <div className="product-meta">
                  <span className="product-rating">⭐ {product.rating}</span>
                  <span className="product-reviews">({product.reviewCount})</span>
                </div>
                <div className="product-price-row">
                  <span className="product-price">{formatCurrency(product.price)}</span>
                  {product.originalPrice && (
                    <span className="product-original">{formatCurrency(product.originalPrice)}</span>
                  )}
                </div>
                {product.tags?.includes('dad-daughter-pick') && (
                  <div className="bonding-badge">🎯 Dad + Daughter Pick</div>
                )}
                {product.amazonUrl ? (
                  <a
                    href={product.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="amazon-btn"
                  >
                    {product.amazonBtnText || 'View on Amazon'}
                  </a>
                ) : (
                  <button className="add-cart-btn" onClick={() => addToCart(product)}>
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trending This Week */}
      <section id="trending">
        <div className="section-header">
          <div className="section-tag">Hot Right Now</div>
          <h2 className="section-title">Trending This Week</h2>
          <p className="section-subtitle">Trending Amazon affiliate picks that open directly on Amazon</p>
        </div>
        <div className="trending-scroll">
          {trendingProducts.map(product => (
            <div className="product-card" key={product.id}>
              <div className="product-image" style={{ background: product.image.bg }}>
                <span className="trending-badge">🔥 Trending</span>
                {product.image.src ? (
                  <img
                    src={product.image.src}
                    alt={product.image.alt || product.name}
                    className="product-photo"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.parentElement.querySelector('.product-emoji-fallback')
                      if (fallback) fallback.style.display = 'block'
                    }}
                  />
                ) : null}
                <span className="product-emoji-fallback" style={{ display: product.image.src ? 'none' : 'block' }}>{product.image.emoji || '🛍️'}</span>
              </div>
              <div className="product-info">
                <div className="product-name">{product.name}</div>
                <div className="product-meta">
                  <span className="product-rating">⭐ {product.rating}</span>
                  <span className="product-reviews">({product.reviewCount})</span>
                </div>
                <div className="product-price-row">
                  <span className="product-price">{formatCurrency(product.price)}</span>
                  {product.originalPrice && (
                    <span className="product-original">{formatCurrency(product.originalPrice)}</span>
                  )}
                </div>
                {product.amazonUrl ? (
                  <a
                    href={product.amazonUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="amazon-btn"
                  >
                    {product.amazonBtnText || 'View on Amazon'}
                  </a>
                ) : (
                  <button className="add-cart-btn" onClick={() => addToCart(product)}>
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dad + Daughter Picks */}
      <section id="dad-daughter-picks">
        <div className="section-header">
          <div className="section-tag">Bonding Time</div>
          <h2 className="section-title">Dad + Daughter Picks</h2>
          <p className="section-subtitle">Curated toys that make it easier to laugh, build, imagine, and play together</p>
        </div>
        <div className="products-grid">
          {dadDaughterPicks.map(product => (
            <div className="product-card" key={product.id}>
              <div className="product-image" style={{ background: product.image.bg }}>
                {product.isTrending && (
                  <span className="trending-badge">🔥 Trending</span>
                )}
                {product.image.src ? (
                  <img
                    src={product.image.src}
                    alt={product.image.alt || product.name}
                    className="product-photo"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.parentElement.querySelector('.product-emoji-fallback')
                      if (fallback) fallback.style.display = 'block'
                    }}
                  />
                ) : null}
                <span className="product-emoji-fallback" style={{ display: product.image.src ? 'none' : 'block' }}>{product.image.emoji || '🛍️'}</span>
              </div>
              <div className="product-info">
                <div className="product-name">{product.name}</div>
                <div className="product-meta">
                  <span className="product-rating">⭐ {product.rating}</span>
                  <span className="product-reviews">({product.reviewCount})</span>
                </div>
                <div className="product-price-row">
                  <span className="product-price">{formatCurrency(product.price)}</span>
                  {product.originalPrice && (
                    <span className="product-original">{formatCurrency(product.originalPrice)}</span>
                  )}
                </div>
                <div className="bonding-badge">🎯 Dad + Daughter Pick</div>
                <a
                  href={product.amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="amazon-btn"
                >
                  {product.amazonBtnText || 'View on Amazon'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section id="categories">
        <div className="section-header">
          <div className="section-tag">Browse by Category</div>
          <h2 className="section-title">Find Your Perfect Toy</h2>
          <p className="section-subtitle">Explore our carefully curated collections</p>
        </div>
        <div className="categories-grid">
          {categories.map((cat, idx) => (
            <div className="category-card" key={idx}>
              <div className="category-emoji">{cat.emoji}</div>
              <div className="category-name">{cat.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Viral Products Admin Panel */}
      <section id="admin">
        <div className="section-header">
          <div className="section-tag">Store Dashboard</div>
          <h2 className="section-title">Viral Products Admin Panel</h2>
          <p className="section-subtitle">Track trends, manage inventory, and research what's next</p>
        </div>
        <div className="admin-panel">
          <div className="admin-tabs">
            {['Trend Research', 'Product Pipeline', 'Store Stats'].map(tab => (
              <button
                key={tab}
                className={`admin-tab ${activeAdminTab === tab ? 'active' : ''}`}
                onClick={() => setActiveAdminTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeAdminTab === 'Trend Research' && (
            <div>
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-value">🔥 4</div>
                  <div className="admin-stat-label">Viral Products</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-value">📈 +23%</div>
                  <div className="admin-stat-label">Trend Growth</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-value">🎯 87</div>
                  <div className="admin-stat-label">Trend Score</div>
                </div>
              </div>
              <button
                className="run-research-btn"
                onClick={runResearch}
                disabled={isResearchRunning}
              >
                {isResearchRunning ? '🔄 Running Research...' : '🔍 Run Trend Research'}
              </button>
            </div>
          )}

          {activeAdminTab === 'Product Pipeline' && (
            <div>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Trending Score</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 5).map(p => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.category}</td>
                      <td>{p.isTrending ? '✅ Active' : '⏳ Pending'}</td>
                      <td>
                        <div className="score-bar">
                          <div
                            className="score-fill"
                            style={{ width: `${p.rating * 20}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeAdminTab === 'Store Stats' && (
            <div>
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-value">{products.length}</div>
                  <div className="admin-stat-label">Total Products</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-value">12</div>
                  <div className="admin-stat-label">Pending Reviews</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-value">4.7</div>
                  <div className="admin-stat-label">Avg Rating</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* About / Why Us */}
      <section id="about">
        <div className="section-header">
          <div className="section-tag">Why Choose Us</div>
          <h2 className="section-title">The SunMoonOcean Promise</h2>
          <p className="section-subtitle">Built around a simple belief: the right toy can create the right moment between a dad and his daughter</p>
        </div>
        <div className="mission-note">SunMoonOcean was built by a parent who believes the best gift is not just the toy itself — it's the shared laugh, the living-room adventure, and the little ritual of dads showing up to play with their daughters.</div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-emoji">🛡️</div>
            <div className="why-title">Safe & Tested</div>
            <div className="why-desc">All toys meet or exceed safety standards. Non-toxic materials only.</div>
          </div>
          <div className="why-card">
            <div className="why-emoji">🚚</div>
            <div className="why-title">Fast Shipping</div>
            <div className="why-desc">Free shipping over $35. Same-day dispatch for orders before 3pm.</div>
          </div>
          <div className="why-card">
            <div className="why-emoji">😊</div>
            <div className="why-title">Happy Customers</div>
            <div className="why-desc">Over 10,000 five-star reviews from families who love our toys.</div>
          </div>
          <div className="why-card">
            <div className="why-emoji">↩️</div>
            <div className="why-title">Easy Returns</div>
            <div className="why-desc">30-day hassle-free returns. Not happy? We make it right.</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Shop</h4>
            <a onClick={() => scrollToSection('featured')}>All Products</a>
            <a onClick={() => scrollToSection('trending')}>Trending</a>
            <a onClick={() => scrollToSection('categories')}>Categories</a>
            <a href="https://www.amazon.com/gp/search?ie=UTF8&tag=sunmoonocean-20&index=toys-and-games&keywords=kids+toys" target="_blank" rel="noopener noreferrer">Amazon Store</a>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <a onClick={() => scrollToSection('about')}>About Us</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
            <a href="#">Blog</a>
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <a href="#">Help Center</a>
            <a href="#">Shipping Info</a>
            <a href="#">Returns</a>
            <a href="#">Contact Us</a>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <div className="footer-social">
              <span>📸</span>
              <span>🐦</span>
              <span>📘</span>
              <span>▶️</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          Where play brings dads and daughters together. © 2026 SunMoonOcean. All rights reserved. As an Amazon Associate we earn from qualifying purchases.
        </div>
      </footer>
    </div>
  )
}

export default App
