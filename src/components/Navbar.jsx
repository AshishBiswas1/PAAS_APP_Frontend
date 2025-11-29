import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

export default function Navbar() {
  const [theme, setTheme] = useState('light');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored) {
        setTheme(stored);
        document.documentElement.classList.toggle('dark', stored === 'dark');
      } else {
        const prefersDark =
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches;
        const t = prefersDark ? 'dark' : 'light';
        setTheme(t);
        document.documentElement.classList.toggle('dark', t === 'dark');
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {}
  }, []);

  // Listen for auth changes (login/logout) from other parts of the app
  useEffect(() => {
    const onAuth = () => {
      try {
        const raw = localStorage.getItem('user');
        setUser(raw ? JSON.parse(raw) : null);
      } catch (e) {}
    };
    window.addEventListener('authChanged', onAuth);
    return () => window.removeEventListener('authChanged', onAuth);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('theme', next);
    } catch (e) {}
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-white/70 dark:bg-slate-900/80 backdrop-blur border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="ClarityPI" className="h-8 w-8 rounded-lg" />
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            ClarityPI
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-sm text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white"
          >
            Features
          </a>
          <a
            href="#api-demo"
            className="text-sm text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white"
          >
            API Demo
          </a>
          <a
            href="#reviews"
            className="text-sm text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white"
          >
            Reviews
          </a>
          <Link
            to="/app"
            onClick={() => {
              try {
                trackEvent('open_app_nav_click');
              } catch (e) {}
            }}
            className="inline-flex items-center rounded-md bg-brand-600 text-white text-sm px-4 py-2 hover:bg-brand-700"
          >
            Start Testing
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="p-2 rounded-full bg-white/60 dark:bg-white/10 hover:bg-white/80 dark:hover:bg-white/20 text-neutral-900 dark:text-neutral-100 transition"
          >
            {theme === 'dark' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zM4.22 4.22a1 1 0 011.42 0l.71.7a1 1 0 11-1.41 1.42l-.71-.7a1 1 0 010-1.42zM2 10a1 1 0 011-1h1a1 1 0 110 2H3a1 1 0 01-1-1zm8 6a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm6.78-1.78a1 1 0 010 1.42l-.71.7a1 1 0 11-1.41-1.42l.71-.7a1 1 0 011.41 0zM16 10a1 1 0 001-1h1a1 1 0 110 2h-1a1 1 0 00-1-1zM5.64 15.36a1 1 0 011.41 1.42l-.7.71a1 1 0 11-1.42-1.41l.71-.72zM15.36 5.64a1 1 0 011.42 1.41l-.7.71a1 1 0 11-1.42-1.41l.7-.71z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M17.293 13.293A8 8 0 116.707 2.707a7 7 0 0010.586 10.586z" />
              </svg>
            )}
          </button>

          {/* Auth actions */}
          {!user ? (
            <>
              <Link
                to="/login"
                className="text-sm text-neutral-700 dark:text-neutral-200 hover:text-neutral-900 dark:hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center rounded-md bg-brand-600 text-white text-sm px-3 py-2 hover:bg-brand-700"
              >
                Sign up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-sm text-neutral-700 dark:text-neutral-200">
                Hello,{' '}
                {user.name ||
                  (user.user_metadata && user.user_metadata.name) ||
                  'User'}
              </div>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                  } catch (e) {}
                  setUser(null);
                  try {
                    window.dispatchEvent(new CustomEvent('authChanged'));
                  } catch (e) {}
                  navigate('/');
                }}
                className="text-sm px-3 py-2 rounded bg-neutral-100 dark:bg-neutral-800"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
