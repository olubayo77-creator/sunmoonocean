import { useState, useEffect, useRef } from 'react'
import { products } from './data/products'
import './App.css'

function App() {
  const [cart, setCart] = useState([])
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Hi there! 🧸 I'm your Toy Expert AI. Looking for the perfect gift? Ask me about age recommendations, trending toys, or anything else!" }
  ])
  const [chatInput, setChatInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [activeAdminTab, setActiveAdminTab] = useState('Trend Research')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false)
  const [isResearchRunning, setIsResearchRunning] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, isTyping])

  const addToCart = (product) => {
    setCart([...cart, product])
  }

  const cartCount = cart.length

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const sendQuickQuestion = (question) => {
    handleChatSubmit(null, question)
  }

  const handleChatSubmit = async (e, quickQuestion = null) => {
    if (e) e.preventDefault()
    const message = quickQuestion || chatInput
    if (!message.trim()) return

    const userMessage = { role: 'user', content: message }
    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setIsTyping(true)

    setTimeout(() => {
      const responses = {
        'What\'s trending for ages 5-7?': 'For ages 5-7, our hottest picks right now are the 3D Dinosaur Puzzle (viral on TikTok!) and the Princess & Knight Costume Box. Both encourage imaginative play and fine motor skills! 🎭',
        'Best STEM toys for 8-year-olds?': 'Our Junior Scientist Lab Kit is flying off the shelves! It has 50 real experiments and perfect for curious 8-year-olds. The Cosmic Rocket Set is also a huge hit! 🚀',
        'What\'s a good gift for a toddler?': 'For toddlers, I recommend our Organic Cotton Sleep Bear (so soft and hypoallergenic!) or the Montessori Sensory Blocks which help with color recognition and motor skills. 🧸',
        'Do you have free shipping?': 'Yes! We offer free shipping on all orders over $35. Plus, orders placed before 3pm ship the same day! 🚚'
      }
      
      const aiResponse = responses[message] || 
        "That's a great question! I'm here to help you find the perfect toy. Would you like me to suggest something based on age, interest, or budget? Just let me know! 🎁"
      
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }])
      setIsTyping(false)
    }, 1200)
  }

  const handleNewsletterSubmit = (e) => {
    e.preventDefault()
    if (!newsletterEmail) return
    setNewsletterSubmitted(true)
  }

  const runResearch = () => {
    setIsResearchRunning(true)
    setTimeout(() => {
      setIsResearchRunning(false)
    }, 2000)
  }

  const featuredProducts = products.filter(p => p.isFeatured).slice(0, 6)
  const trendingProducts = products.filter(p => p.isTrending)

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
            <button className="cart-btn">
              🛒
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
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
            <span className="hero-tagline">Where Play Goes Viral</span>
          </h1>
          <p className="hero-subtitle">
            Curated toys that spark imagination, creativity, and endless fun. 
            From trending viral hits to timeless classics — find the perfect gift at SunMoonOcean.
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
          <p className="section-subtitle">Hand-picked favorites loved by kids and parents alike</p>
        </div>
        <div className="products-grid">
          {featuredProducts.map(product => (
            <div className="product-card" key={product.id}>
              <div className="product-image" style={{ background: product.image.bg }}>
                {product.isTrending && (
                  <span className="trending-badge">🔥 Trending</span>
                )}
                <span>{product.image.emoji}</span>
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
                <button className="add-cart-btn" onClick={() => addToCart(product)}>
                  Add to Cart
                </button>
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
          <p className="section-subtitle">The toys everyone's talking about — going viral for a reason!</p>
        </div>
        <div className="trending-scroll">
          {trendingProducts.map(product => (
            <div className="product-card" key={product.id}>
              <div className="product-image" style={{ background: product.image.bg }}>
                <span className="trending-badge">🔥 Trending</span>
                <span>{product.image.emoji}</span>
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
                <button className="add-cart-btn" onClick={() => addToCart(product)}>
                  Add to Cart
                </button>
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
          <p className="section-subtitle">Track trends, manage inventory, and research what\'s next</p>
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
          <p className="section-subtitle">We\'re parents too — so we only sell what we\'d give our own kids</p>
        </div>
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

      {/* AI Advisor Section */}
      <section id="advisor">
        <div className="section-header">
          <div className="section-tag">Toy Expert AI</div>
          <h2 className="section-title">Ask Me Anything!</h2>
          <p className="section-subtitle">Get personalized toy recommendations from our AI assistant</p>
        </div>
        <div className="advisor-section">
          <div className="quick-questions">
            <button onClick={() => sendQuickQuestion("What's trending for ages 5-7?")}>
              What's trending for ages 5-7?
            </button>
            <button onClick={() => sendQuickQuestion("Best STEM toys for 8-year-olds?")}>
              Best STEM toys for 8-year-olds?
            </button>
            <button onClick={() => sendQuickQuestion("What's a good gift for a toddler?")}>
              What's a good gift for a toddler?
            </button>
            <button onClick={() => sendQuickQuestion("Do you have free shipping?")}>
              Do you have free shipping?
            </button>
          </div>
          <div className="chat-container">
            <div className="chat-messages">
              {chatMessages.map((msg, i) => (
                <div key={i} className={`chat-message ${msg.role}`}>
                  <div className="chat-avatar">{msg.role === 'assistant' ? '🧸' : '👤'}</div>
                  <div className="chat-bubble">{msg.content}</div>
                </div>
              ))}
              {isTyping && (
                <div className="chat-message assistant">
                  <div className="chat-avatar">🧸</div>
                  <div className="chat-bubble typing"><span></span><span></span><span></span></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form className="chat-input-area" onSubmit={handleChatSubmit}>
              <input
                type="text"
                placeholder="Ask me about toys, ages, or recommendations..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section id="newsletter">
        <div className="newsletter">
          <h2 className="newsletter-title">🎁 Get 10% Off Your First Order</h2>
          <p className="newsletter-subtitle">Join our newsletter for exclusive deals, new arrivals, and parenting tips</p>
          {!newsletterSubmitted ? (
            <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          ) : (
            <div className="newsletter-success">
              ✅ Welcome! Check your inbox for your 10% off code!
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer id="footer" className="footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Shop</h4>
            <a onClick={() => scrollToSection('featured')}>Featured</a>
            <a onClick={() => scrollToSection('trending')}>Trending</a>
            <a onClick={() => scrollToSection('categories')}>Categories</a>
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            <a>Shipping Info</a>
            <a>Returns</a>
            <a>Track Order</a>
            <a>FAQ</a>
          </div>
          <div className="footer-col">
            <h4>About</h4>
            <a>Our Story</a>
            <a>Sustainability</a>
            <a>Careers</a>
            <a>Press</a>
          </div>
          <div className="footer-col">
            <h4>Connect</h4>
            <div className="footer-social">
              <span>📘</span>
              <span>📸</span>
              <span>🐦</span>
              <span>▶️</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 SunMoonOcean | Where Play Goes Viral
        </div>
      </footer>
    </div>
  )
}

export default App
