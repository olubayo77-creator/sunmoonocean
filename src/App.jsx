import { products } from './data/products'
import './App.css'

function App() {
  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
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
            <button className="nav-cta" onClick={() => scrollToSection('featured')}>
              Shop Now
            </button>
          </div>
        </div>
      </nav>

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
              <div className="hero-stat-value">8 Picks</div>
              <div className="hero-stat-label">Current Favorites</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">Amazon</div>
              <div className="hero-stat-label">Affiliate Links</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-value">Dad + Daughter</div>
              <div className="hero-stat-label">Play Ideas</div>
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

      {/* About / Why Us */}
      <section id="about">
        <div className="section-header">
          <div className="section-tag">Why Choose Us</div>
          <h2 className="section-title">Why SunMoonOcean</h2>
          <p className="section-subtitle">Built around a simple belief: the right toy can create the right moment between a dad and his daughter</p>
        </div>
        <div className="mission-note">SunMoonOcean was built by a parent who believes the best gift is not just the toy itself — it's the shared laugh, the living-room adventure, and the little ritual of dads showing up to play with their daughters.</div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-emoji">🎯</div>
            <div className="why-title">Play Together</div>
            <div className="why-desc">We focus on picks that make it easier for dads and daughters to laugh, build, imagine, and bond.</div>
          </div>
          <div className="why-card">
            <div className="why-emoji">🛍️</div>
            <div className="why-title">Direct Amazon Links</div>
            <div className="why-desc">Every product button sends visitors straight to a monetized Amazon listing.</div>
          </div>
          <div className="why-card">
            <div className="why-emoji">🔥</div>
            <div className="why-title">Trending Picks</div>
            <div className="why-desc">We spotlight fun, giftable products that feel exciting right now, not generic filler.</div>
          </div>
          <div className="why-card">
            <div className="why-emoji">ℹ️</div>
            <div className="why-title">Amazon Handles Fulfillment</div>
            <div className="why-desc">Pricing, shipping, returns, availability, and fulfillment are handled on Amazon.</div>
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
          </div>
          <div className="footer-col">
            <h4>Support</h4>
            <a href="https://www.amazon.com/gp/help/customer/display.html" target="_blank" rel="noopener noreferrer">Amazon Help</a>
            <a href="https://www.amazon.com/gp/css/order-history" target="_blank" rel="noopener noreferrer">Order History</a>
            <a href="https://www.amazon.com/returns" target="_blank" rel="noopener noreferrer">Amazon Returns</a>
          </div>
        </div>
        <div className="footer-bottom">
          Where play brings dads and daughters together. © 2026 SunMoonOcean. All rights reserved. As an Amazon Associate we earn from qualifying purchases. SunMoonOcean curates and links to products sold on Amazon, and Amazon is responsible for product details, pricing, availability, shipping, returns, and fulfillment.
        </div>
      </footer>
    </div>
  )
}

export default App
