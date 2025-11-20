export default function Newsletter() {
  return (
    <section className="newsletter-section text-center px-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-blue-700 to-purple-500">
        Stay in the Loop
      </h2>
      <p className="mb-5 text-indigo-800">Get product updates & API tips.</p>
      <form className="flex flex-wrap justify-center">
        <input type="email" placeholder="Your email" className="newsletter-input mb-3" required/>
        <button className="newsletter-button">Subscribe</button>
      </form>
    </section>
  )
}
