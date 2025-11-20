import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import Features from "./components/Features"
import ApiScrollBlock from "./components/ApiScrollBlock"
import Reviews from "./components/Reviews"
import Footer from "./components/Footer"

export default function App() {
  return (
    <div className="min-h-screen text-neutral-900 bg-white">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <ApiScrollBlock />
        <Reviews />
      </main>
      <Footer />
    </div>
  )
}
