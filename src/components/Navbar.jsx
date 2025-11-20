import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Animation for logo
  const logoAnim = "transition-transform duration-700 ease-out hover:scale-105 group";
  const navAnim = "transition-all duration-200 hover:text-purple-100";

  return (
    <header className="fixed top-0 left-0 w-full z-[60] backdrop-blur-lg shadow-2xl" style={{background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)', borderBottom: '2px solid rgba(255, 255, 255, 0.2)'}}>
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        
        {/* LOGO AND BRAND */}
        <a href="#home" className="flex items-center gap-3 select-none group" style={{textDecoration: 'none'}}>
          <svg className={logoAnim + " h-11 w-11 drop-shadow-2xl"} viewBox="0 0 100 100">
            <defs>
              <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="44" fill="white" />
            <path d="M30 50 L50 30 L70 50 L50 70 Z" fill="url(#logo-grad)" />
            <circle cx="50" cy="30" r="5" fill="#10b981" />
            <circle cx="70" cy="50" r="5" fill="#06b6d4" />
            <circle cx="50" cy="70" r="5" fill="#8b5cf6" />
            <circle cx="30" cy="50" r="5" fill="#3b82f6" />
            <line x1="50" y1="30" x2="70" y2="50" stroke="#6366f1" strokeWidth="2.5" />
            <line x1="70" y1="50" x2="50" y2="70" stroke="#6366f1" strokeWidth="2.5" />
            <line x1="50" y1="70" x2="30" y2="50" stroke="#6366f1" strokeWidth="2.5" />
            <line x1="30" y1="50" x2="50" y2="30" stroke="#6366f1" strokeWidth="2.5" />
          </svg>
          <span className="font-black text-3xl tracking-tight drop-shadow-lg" style={{color: 'white', WebkitTextFillColor: 'white'}}>apisurge</span>
        </a>

        {/* NAVIGATION */}
        <nav className="hidden lg:flex items-center gap-1">
          <a href="#features" className="font-semibold text-base px-5 py-2 rounded-lg hover:bg-white/20 transition-all nav-link">Features</a>
          <a href="#steps" className="font-semibold text-base px-5 py-2 rounded-lg hover:bg-white/20 transition-all nav-link">How It Works</a>
          <a href="#pricing" className="font-semibold text-base px-5 py-2 rounded-lg hover:bg-white/20 transition-all nav-link">Pricing</a>
          <a href="#faq" className="font-semibold text-base px-5 py-2 rounded-lg hover:bg-white/20 transition-all nav-link">FAQ</a>
        </nav>

        {/* BUTTONS & MOBILE */}
        <div className="flex items-center gap-3">
          <a href="#login"
            className="font-bold text-base px-6 py-2.5 rounded-full hover:bg-white/20 transition-all"
            style={{color: 'white', WebkitTextFillColor: 'white', textDecoration: 'none', border: '2px solid rgba(255, 255, 255, 0.4)'}}
          >
            Login
          </a>
          <a href="#signup"
            className="font-bold text-base px-7 py-2.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
            style={{background: 'white', color: '#6366f1', WebkitTextFillColor: '#6366f1', textDecoration: 'none'}}
          >Sign Up</a>
          <button
            className="lg:hidden p-2 hover:bg-white/20 rounded-lg transition-all"
            style={{color: 'white'}}
            aria-label="Open menu"
            onClick={() => setMenuOpen(v => !v)}
            tabIndex={0}
          >
            <svg className="w-6 h-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE OVERLAY MENU */}
      {menuOpen && (
        <div className="fixed inset-0 top-[70px] bg-gradient-to-br from-indigo-800 via-purple-700 to-purple-500/80 backdrop-blur-lg z-[80] flex flex-col px-7 py-10 gap-7 animate-fadeInLeft">
          {[
            { label: 'Features', href: '#features' },
            { label: 'How It Works', href: '#steps' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'FAQ', href: '#faq' }
          ].map((item) => (
            <a key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className="text-xl font-black px-7 py-3 rounded-2xl text-white bg-white/10 hover:bg-white/20 tracking-tight shadow transition-all"
            >{item.label}</a>
          ))}
          <div className="flex gap-4 mt-3">
            <a href="#login" className="px-7 py-2 rounded-full border-2 border-white/30 text-white font-bold shadow-lg hover:bg-white/20 transition">Login</a>
            <a href="#signup" className="font-bold px-7 py-2 rounded-full bg-white text-indigo-700 shadow-xl hover:scale-105 transition">Sign Up</a>
          </div>
        </div>
      )}
    </header>
  );
}
