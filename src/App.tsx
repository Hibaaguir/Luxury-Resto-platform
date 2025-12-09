import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-dark">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* More routes coming soon */}
        </Routes>
      </div>
    </Router>
  )
}

// Temporary homepage component
function HomePage() {
  return (
    <div className="flex items-center justify-center min-h-screen container-luxury">
      <div className="text-center">
        <h1 className="mb-4 text-display text-gradient-gold">
          Luxury Restaurant Platform
        </h1>
        <p className="mb-8 text-body text-champagne/80">
          Your premium reservation experience starts here
        </p>
        <button className="btn-primary">
          Get Started
        </button>
      </div>
    </div>
  )
}

export default App
