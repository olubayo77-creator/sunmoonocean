import { useEffect, useMemo } from 'react'
import { products } from './data/products'
import { blogPosts } from './data/blogPosts'
import './App.css'

function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const featuredProducts = products
  const dadDaughterPicks = products.filter(p => p.tags?.includes('dad-daughter-pick'))
  const mainPosts = blogPosts.filter(post => post.category === 'Dad Blog')
  const dadStrongPosts = blogPosts.filter(post => post.category === 'Dad Strong')
  const featuredBlogPosts = blogPosts.slice(0, 3)

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num)
  }

  const currentPost = useMemo(() => {
    if (!path.startsWith('/blog/')) return null
    const slug = path.replace('/blog/', '')
    return blogPosts.find(post => post.slug === slug) || null
  }, [path])

  const relatedPosts = useMemo(() => {
    if (!currentPost) return []
    return blogPosts.filter(post => post.slug !== currentPost.slug).slice(0, 3)
  }, [currentPost])

  useEffect(() => {
    const ensureMeta = (selector, attrs) => {
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        Object.entries(attrs.base || {}).forEach(([k, v]) => el.setAttribute(k, v))
        document.head.appendChild(el)
      }
      Object.entries(attrs.set || {}).forEach(([k, v]) => el.setAttribute(k, v))
      return el
    }

    const ensureLink = (selector, rel, href) => {
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('link')
        el.setAttribute('rel', rel)
        document.head.appendChild(el)
      }
      el.setAttribute('href', href)
      return el
    }

    const setJsonLd = (data) => {
      let script = document.getElementById('seo-jsonld')
      if (!script) {
        script = document.createElement('script')
        script.type = 'application/ld+json'
        script.id = 'seo-jsonld'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(data)
    }

    const setShared = (title, description, url) => {
      document.title = title
      ensureMeta('meta[name="description"]', { base: { name: 'description' }, set: { content: description } })
      ensureMeta('meta[property="og:title"]', { base: { property: 'og:title' }, set: { content: title } })
      ensureMeta('meta[property="og:description"]', { base: { property: 'og:description' }, set: { content: description } })
      ensureMeta('meta[property="og:url"]', { base: { property: 'og:url' }, set: { content: url } })
      ensureMeta('meta[name="twitter:title"]', { base: { name: 'twitter:title' }, set: { content: title } })
      ensureMeta('meta[name="twitter:description"]', { base: { name: 'twitter:description' }, set: { content: description } })
      ensureLink('link[rel="canonical"]', 'canonical', url)
    }

    if (currentPost) {
      setShared(currentPost.metaTitle, currentPost.metaDescription, `https://sunmoonocean.com/blog/${currentPost.slug}`)
      setJsonLd({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: currentPost.title,
        datePublished: currentPost.date,
        dateModified: currentPost.date,
        description: currentPost.metaDescription,
        mainEntityOfPage: `https://sunmoonocean.com/blog/${currentPost.slug}`,
        publisher: {
          '@type': 'Organization',
          name: 'SunMoonOcean'
        },
        author: {
          '@type': 'Person',
          name: 'SunMoonOcean Founder'
        }
      })
      return
    }

    if (path === '/blog') {
      setShared(
        'Dad Blog & Dad Strong | SunMoonOcean',
        'Dad Blog and Dad Strong from SunMoonOcean with dad and daughter activities, parental alienation recovery for dads, and best toys for dads and daughters.',
        'https://sunmoonocean.com/blog'
      )
      setJsonLd({
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'SunMoonOcean Dad Blog',
        url: 'https://sunmoonocean.com/blog',
        description: 'Dad Blog and Dad Strong posts for dads building deeper connection with their daughters.'
      })
      return
    }

    setShared(
      'SunMoonOcean | Dad and Daughter Activities, Toy Picks & Gift Ideas',
      'SunMoonOcean shares dad and daughter activities, best toys for dads and daughters, and thoughtful gifts for daughters from dad with direct Amazon affiliate links.',
      'https://sunmoonocean.com/'
    )
    setJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          name: 'SunMoonOcean',
          url: 'https://sunmoonocean.com/'
        },
        {
          '@type': 'WebSite',
          name: 'SunMoonOcean',
          url: 'https://sunmoonocean.com/'
        }
      ]
    })
  }, [path, currentPost])

  const BlogNav = () => (
    <a href="/blog">Dad Blog</a>
  )

  if (currentPost) {
    return (
      <div className="app blog-app">
        <nav className="navbar">
          <div className="nav-container">
            <a className="logo" href="/">
              <span className="brand-coral">Sun</span>
              <span className="brand-teal">Moon</span>
              <span className="brand-sand">Ocean</span>
            </a>
            <div className="nav-links">
              <a href="/">Shop</a>
              <a href="/">Dad + Daughter Picks</a>
              <BlogNav />
            </div>
          </div>
        </nav>

        <main className="blog-shell">
          <div className="blog-hero">
            <div className="section-tag">{currentPost.category}</div>
            <h1 className="blog-post-title">{currentPost.title}</h1>
            <p className="blog-post-date">{currentPost.date}</p>
          </div>

          <article className="blog-post-content card-surface">
            <div dangerouslySetInnerHTML={{ __html: currentPost.content }} />
            <div className="blog-disclosure">As an Amazon Associate I earn from qualifying purchases.</div>
            <div className="blog-post-actions">
              <a href="/blog" className="btn-secondary blog-link-btn">← Back to Dad Blog</a>
              <a href="/" className="btn-primary blog-link-btn">Shop SunMoonOcean</a>
            </div>
          </article>

          <section className="related-section">
            <div className="section-header">
              <div className="section-tag">Keep Reading</div>
              <h2 className="section-title related-title">Related Posts</h2>
            </div>
            <div className="blog-grid">
              {relatedPosts.map(post => (
                <article className="blog-card" key={post.slug}>
                  <div className="blog-card-date">{post.date} · {post.category}</div>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-preview">{post.preview}</p>
                  <a href={`/blog/${post.slug}`} className="btn-primary blog-readmore">Read more</a>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    )
  }

  if (path === '/blog') {
    return (
      <div className="app blog-app">
        <nav className="navbar">
          <div className="nav-container">
            <a className="logo" href="/">
              <span className="brand-coral">Sun</span>
              <span className="brand-teal">Moon</span>
              <span className="brand-sand">Ocean</span>
            </a>
            <div className="nav-links">
              <a href="/">Shop</a>
              <a href="/">Dad + Daughter Picks</a>
              <BlogNav />
              <a href="/">About</a>
            </div>
            <div className="nav-actions">
              <a className="nav-cta blog-nav-cta" href="/">Shop Now</a>
            </div>
          </div>
        </nav>

        <main className="blog-shell">
          <section className="blog-hero">
            <div className="hero-badge">📝 Stories from real dad + daughter play time</div>
            <h1 className="section-title blog-page-title">Dad Blog</h1>
            <p className="section-subtitle blog-page-subtitle">
              Honest stories, toy picks, and simple ideas for dads who want more meaningful time with their daughters.
            </p>
            <div className="founder-story card-surface">
              SunMoonOcean was built by a dad who knows what it means to fight for moments with his daughter. After surviving narcissistic abuse and parental alienation, time together became precious. Every product on this site was chosen with one goal — make every moment count. This store is for every dad who refuses to let distance, circumstance, or a broken system define his relationship with his daughter.
            </div>
          </section>

          <section className="blog-list-section">
            <div className="section-header">
              <div className="section-tag">Dad Blog</div>
              <h2 className="related-title">Stories, toy picks, and everyday connection</h2>
            </div>
            <div className="blog-grid">
              {mainPosts.map(post => (
                <article className="blog-card" key={post.slug}>
                  <div className="blog-card-date">{post.date}</div>
                  <h2 className="blog-card-title">{post.title}</h2>
                  <p className="blog-card-preview">{post.preview}</p>
                  <a href={`/blog/${post.slug}`} className="btn-primary blog-readmore">Read more</a>
                </article>
              ))}
            </div>
          </section>

          <section className="blog-list-section dad-strong-section">
            <div className="section-header">
              <div className="section-tag">Dad Strong</div>
              <h2 className="related-title">For dads rebuilding, healing, and showing up anyway</h2>
              <p className="section-subtitle blog-page-subtitle">
                You're not alone. Whether you're navigating limited custody, healing from a toxic relationship, or just trying to be more present — this space is for you. These posts are written from experience, not theory.
              </p>
            </div>
            <div className="blog-grid">
              {dadStrongPosts.map(post => (
                <article className="blog-card" key={post.slug}>
                  <div className="blog-card-date">{post.date} · Dad Strong</div>
                  <h2 className="blog-card-title">{post.title}</h2>
                  <p className="blog-card-preview">{post.preview}</p>
                  <a href={`/blog/${post.slug}`} className="btn-primary blog-readmore">Read more</a>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo" onClick={() => scrollToSection('hero')}>
            <span className="brand-coral">Sun</span>
            <span className="brand-teal">Moon</span>
            <span className="brand-sand">Ocean</span>
          </div>
          <div className="nav-links">
            <a onClick={() => scrollToSection('featured')}>Shop</a>
            <a onClick={() => scrollToSection('dad-daughter-picks')}>Dad + Daughter Picks</a>
            <a href="/blog">Dad Blog</a>
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
          <div className="hero-badge">✨ Amazon affiliate toy picks</div>
          <h1 className="hero-title">
            <span className="hero-tagline">Toys picked to help dads and daughters play together</span>
          </h1>
          <p className="hero-subtitle">
            SunMoonOcean helps dads find gifts that spark laughter, imagination, and real connection with their daughters.
            Simple toy picks for shared play, imagination, and time together.
          </p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={() => scrollToSection('featured')}>
              🛍️ Shop Now
            </button>
            <button className="btn-secondary" onClick={() => scrollToSection('dad-daughter-picks')}>
              🎯 See Dad + Daughter Picks
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

      <section id="featured">
        <div className="section-header">
          <div className="section-tag">Shop</div>
          <h2 className="section-title">Toy Picks</h2>
          <p className="section-subtitle">Direct Amazon affiliate picks chosen for fun, connection, and play time that dads and daughters can share</p>
          <p className="section-subtitle">Disclosure: product links on this site are Amazon affiliate links, and we may earn from qualifying purchases.</p>
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
                <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer" className="amazon-btn">
                  {product.amazonBtnText || 'View on Amazon'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="dad-daughter-picks">
        <div className="section-header">
          <div className="section-tag">Bonding Time</div>
          <h2 className="section-title">Dad + Daughter Picks</h2>
          <p className="section-subtitle">Toy ideas that make it easier to laugh, build, imagine, and play together</p>
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
                <a href={product.amazonUrl} target="_blank" rel="noopener noreferrer" className="amazon-btn">
                  {product.amazonBtnText || 'View on Amazon'}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="blog-preview">
        <div className="section-header">
          <div className="section-tag">Dad Blog</div>
          <h2 className="section-title">Stories that make every moment count</h2>
          <p className="section-subtitle">Read honest posts about play, connection, healing, and being present with your daughter.</p>
        </div>
        <div className="blog-grid">
          {featuredBlogPosts.map(post => (
            <article className="blog-card" key={post.slug}>
              <div className="blog-card-date">{post.date} · {post.category}</div>
              <h3 className="blog-card-title">{post.title}</h3>
              <p className="blog-card-preview">{post.preview}</p>
              <a href={`/blog/${post.slug}`} className="btn-primary blog-readmore">Read more</a>
            </article>
          ))}
        </div>
      </section>

      <section id="about">
        <div className="section-header">
          <div className="section-tag">About</div>
          <h2 className="section-title">Why SunMoonOcean</h2>
          <p className="section-subtitle">Built around a simple belief: the right toy can create the right moment between a dad and his daughter</p>
        </div>
        <div className="mission-note">SunMoonOcean shares Amazon affiliate toy links with a focus on products that can help dads and daughters spend time playing together.</div>
        <div className="founder-story card-surface">SunMoonOcean was built by a dad who knows what it means to fight for moments with his daughter. After surviving narcissistic abuse and parental alienation, time together became precious. Every product on this site was chosen with one goal — make every moment count. This store is for every dad who refuses to let distance, circumstance, or a broken system define his relationship with his daughter.</div>
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

      <footer id="footer" className="footer">
        <div className="footer-grid">
          <div className="footer-col">
            <h4>Shop</h4>
            <a onClick={() => scrollToSection('featured')}>All Products</a>
            <a onClick={() => scrollToSection('dad-daughter-picks')}>Dad + Daughter Picks</a>
            <a href="/blog">Dad Blog</a>
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
