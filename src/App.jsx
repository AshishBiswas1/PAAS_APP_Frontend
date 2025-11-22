import React from 'react'
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import Features from "./components/Features"
import ApiScrollBlock from "./components/ApiScrollBlock"
import Reviews from "./components/Reviews"
import Footer from "./components/Footer"
import Login from './pages/Login'
import Signup from './pages/Signup'
import ApiTester from './pages/ApiTester'

export default function App() {
  // If the user hasn't visited this session yet and the URL is
  // `/signup` or `/login`, redirect to `/` so the landing page shows
  // on first open. Subsequent navigations still work normally.
  function FirstLoadRedirect() {
    const location = useLocation();
    const navigate = useNavigate();
    React.useEffect(() => {
      try {
        const visited = sessionStorage.getItem('hasVisited');
        if (!visited) {
          sessionStorage.setItem('hasVisited', '1');
          if (location.pathname === '/signup' || location.pathname === '/login') {
            navigate('/', { replace: true });
          }
        }
      } catch (e) {}
    }, [location, navigate]);
    return null;
  }
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white text-neutral-900 dark:bg-slate-950 dark:text-neutral-100">
        <Navbar />
        <main>
          <FirstLoadRedirect />
          <Routes>
            <Route path="/" element={<>
              <Hero />
              <Features />
              <ApiScrollBlock />
              <Reviews />
              <Footer />
            </>} />
            <Route path="/login" element={<Login/>} />
            <Route path="/signup" element={<Signup/>} />
            <Route path="/app" element={<ApiTester/>} />
            <Route path="*" element={<>
              <Hero />
              <Features />
              <ApiScrollBlock />
              <Reviews />
              <Footer />
            </>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
