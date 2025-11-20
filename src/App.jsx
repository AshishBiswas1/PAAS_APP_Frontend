import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LogoGrid from './components/LogoGrid';
import Features from './components/Features';
import Steps from './components/Steps';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import FAQ from './components/FAQ';
import Download from './components/Download';
import Newsletter from './components/Newsletter';
import News from './components/News';
import Footer from './components/Footer';

export default function App() {
  return (
    <div>
      <Navbar />
      <main>
        <Hero />
        <LogoGrid />
        <Features />
        <Steps />
        <Testimonials />
        <Pricing />
        <FAQ />
        <Download />
        <Newsletter />
        <News />
      </main>
      <Footer />
    </div>
  );
}
