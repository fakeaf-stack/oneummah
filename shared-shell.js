function buildSiteHeader() {
  return `
    <header class="site-header">
      <div class="site-header-inner">
        <nav class="site-nav-left" aria-label="Primary navigation">
          <a href="ummahrise-clone.html">HOME</a>
          <a href="catalog.html">CATALOG</a>
          <a href="contact.html">CONTACT</a>
          <a href="track.html">TRACK YOUR ORDER</a>
        </nav>
        <a class="site-logo" href="ummahrise-clone.html">ONEUMMAH</a>
        <nav class="site-nav-right" aria-label="Account and cart">
          <a href="#" class="site-login-link">LOG IN</a>
          <a href="catalog.html" class="site-cart-btn" aria-label="Cart">
            <svg class="site-cart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 01-8 0"></path>
            </svg>
            <span>CART</span>
            <span class="site-cart-count">0</span>
          </a>
        </nav>
      </div>
    </header>
  `
}

function buildSiteFooter() {
  return `
    <footer class="site-footer">
      <div class="site-footer-top">
        <div>
          <p class="site-footer-brand">ONEUMMAH</p>
          <p class="site-footer-tagline">Premium Islamic streetwear for the Muslim community worldwide. Make Ummah Rise Again.</p>
          <div class="site-footer-social">
            <a href="https://www.instagram.com/oneummah.label" target="_blank" rel="noreferrer">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"></circle></svg>
              Instagram
            </a>
          </div>
        </div>
        <div class="site-footer-col">
          <p class="site-footer-col-title">Quick Links</p>
          <ul>
            <li><a href="ummahrise-clone.html">Home</a></li>
            <li><a href="catalog.html">Catalog</a></li>
            <li><a href="contact.html">Contact Us</a></li>
            <li><a href="track.html">Track Your Order</a></li>
          </ul>
        </div>
        <div class="site-footer-col">
          <p class="site-footer-col-title">Policies</p>
          <ul>
            <li><a href="#">Privacy Policy</a></li>
            <li><a href="#">Shipping Policy</a></li>
            <li><a href="#">Terms of Service</a></li>
          </ul>
        </div>
        <div class="site-footer-col">
          <p class="site-footer-col-title">Support</p>
          <ul>
            <li><a href="contact.html">Contact Information</a></li>
            <li><a href="#">FAQ</a></li>
            <li><a href="#">Size Guide</a></li>
            <li><a href="track.html">Order Tracking</a></li>
          </ul>
        </div>
      </div>
      <div class="site-footer-bottom">
        <p class="site-footer-copy">© 2026, ONEUMMAH</p>
        <div class="site-footer-bottom-row">
          <div class="site-footer-links">
            <a href="#">Privacy policy</a>
            <a href="#">Terms of service</a>
            <a href="#">Shipping policy</a>
          </div>
          <div class="site-payment-icons">
            <span class="site-payment-icon">UPI</span>
          </div>
        </div>
      </div>
    </footer>
  `
}

function mountSiteShell() {
  var headerSlot = document.getElementById('sharedHeader')
  var footerSlot = document.getElementById('sharedFooter')

  if (headerSlot) {
    headerSlot.innerHTML = buildSiteHeader()
  }
  if (footerSlot) {
    footerSlot.innerHTML = buildSiteFooter()
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountSiteShell)
} else {
  mountSiteShell()
}
