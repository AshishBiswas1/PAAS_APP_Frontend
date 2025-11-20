import { motion } from 'framer-motion';
import heroSVG from '../assets/hero-bg.svg';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center pt-32 overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-100">
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
          <defs>
            <pattern id="api-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <circle cx="25" cy="25" r="3" fill="#6366f1" opacity="0.4"/>
              <circle cx="75" cy="75" r="3" fill="#a78bfa" opacity="0.4"/>
              <line x1="25" y1="25" x2="75" y2="75" stroke="#818cf8" strokeWidth="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#api-pattern)"/>
          <circle cx="10%" cy="20%" r="150" fill="#6366f1" opacity="0.08"/>
          <circle cx="90%" cy="15%" r="120" fill="#a78bfa" opacity="0.08"/>
          <circle cx="85%" cy="85%" r="180" fill="#c4b5fd" opacity="0.08"/>
          <circle cx="20%" cy="80%" r="140" fill="#818cf8" opacity="0.08"/>
          <rect x="5%" y="30%" width="250" height="350" rx="20" fill="#6366f1" opacity="0.05" transform="rotate(-15 130 205)"/>
          <rect x="75%" y="40%" width="280" height="300" rx="20" fill="#a78bfa" opacity="0.05" transform="rotate(12 910 190)"/>
        </svg>
      </div>
      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center text-center px-6">
        <motion.h1 initial={{ opacity: 0, y: -60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.1 }}
          className="text-6xl md:text-8xl lg:text-9xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-700 mb-8 drop-shadow-2xl leading-tight">
          Level Up<br /><span className="bg-gradient-to-l from-purple-400 to-indigo-600 text-transparent bg-clip-text">API Testing</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.4 }}
          className="mt-6 mb-12 text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-700 max-w-4xl mx-auto leading-relaxed">
          <span className="text-indigo-600 font-bold">apisurge</span> redefines testing, automation, and collaboration—instantly, beautifully.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.8 }}
          className="flex flex-col sm:flex-row justify-center gap-6 mb-12">
          <a href="#pricing" className="px-16 py-6 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-600 hover:from-indigo-600 hover:via-purple-600 hover:to-blue-700 text-3xl rounded-3xl shadow-2xl font-black hover:scale-105 hover:shadow-3xl transition-all duration-300 no-underline" style={{color: 'white', WebkitTextFillColor: 'white', textDecoration: 'none'}}>
            Start Free
          </a>
          <a href="#features" className="px-14 py-6 bg-white/90 text-2xl rounded-3xl shadow-xl font-bold hover:bg-indigo-50 hover:scale-105 transition-all duration-300 no-underline" style={{color: '#4338ca', WebkitTextFillColor: '#4338ca', textDecoration: 'none'}}>
            See Features
          </a>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 1.1 }}
          className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-white/80 backdrop-blur-sm p-8">
          <div className="relative w-full h-[400px] bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 rounded-2xl flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block p-6 bg-white rounded-2xl shadow-lg mb-4">
                <svg className="w-32 h-32" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="45" fill="#6366f1" opacity="0.1"/>
                  <path d="M 30 50 L 45 65 L 70 35" stroke="#6366f1" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="50" cy="30" r="8" fill="#10b981"/>
                  <circle cx="70" cy="50" r="8" fill="#a78bfa"/>
                  <circle cx="50" cy="70" r="8" fill="#818cf8"/>
                  <circle cx="30" cy="50" r="8" fill="#c4b5fd"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-indigo-700 mb-2">API Testing Dashboard</h3>
              <p className="text-gray-600">Powerful automation, beautiful interface</p>
            </div>
          </div>
        </motion.div>
        <div className="flex flex-wrap justify-center gap-3 mt-7">
          <span className="bg-gradient-to-r from-blue-400 to-indigo-200 text-indigo-900 text-sm font-semibold rounded-2xl px-5 py-2 shadow">No credit card required</span>
          <span className="bg-gradient-to-r from-purple-300 to-pink-200 text-indigo-900 text-sm font-semibold rounded-2xl px-5 py-2 shadow">Free for teams</span>
        </div>
      </div>
    </section>
  );
}
