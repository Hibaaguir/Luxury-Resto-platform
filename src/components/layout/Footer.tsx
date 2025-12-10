import { Link } from 'react-router-dom'
import { HiMail, HiPhone, HiLocationMarker } from 'react-icons/hi'

export function Footer() {
  return (
    <footer className="py-12 mt-20 border-t bg-charcoal-dark border-taupe/30">
      <div className="container-luxury">
        <div className="grid grid-cols-1 gap-8 mb-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl">👑</span>
              <span className="text-2xl font-bold font-playfair text-gradient-gold">
                LuxeDine
              </span>
            </div>
            <p className="text-sm text-champagne/70">
              Your gateway to the world's finest dining experiences.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-champagne">Quick Links</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/restaurants" className="text-sm transition-colors text-champagne/70 hover:text-primary">
                Browse Restaurants
              </Link>
              <Link to="/about" className="text-sm transition-colors text-champagne/70 hover:text-primary">
                About Us
              </Link>
              <Link to="/contact" className="text-sm transition-colors text-champagne/70 hover:text-primary">
                Contact
              </Link>
              <Link to="/faq" className="text-sm transition-colors text-champagne/70 hover:text-primary">
                FAQ
              </Link>
            </nav>
          </div>

          {/* For Restaurants */}
          <div>
            <h3 className="mb-4 font-semibold text-champagne">For Restaurants</h3>
            <nav className="flex flex-col gap-2">
              <Link to="/partner" className="text-sm transition-colors text-champagne/70 hover:text-primary">
                Partner With Us
              </Link>
              <Link to="/owner/register" className="text-sm transition-colors text-champagne/70 hover:text-primary">
                Restaurant Login
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold text-champagne">Contact Us</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-champagne/70">
                <HiMail className="text-primary" />
                <span>contact@luxedine.com</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-champagne/70">
                <HiPhone className="text-primary" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col items-center justify-between gap-4 pt-8 border-t border-taupe/30 md:flex-row">
          <p className="text-sm text-champagne/50">
            © 2025 LuxeDine. All rights reserved.
          </p>
          <nav className="flex gap-6">
            <Link to="/privacy" className="text-sm transition-colors text-champagne/50 hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm transition-colors text-champagne/50 hover:text-primary">
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
