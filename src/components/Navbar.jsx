export default function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-white/70 backdrop-blur border-b border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-brand-600"></div>
          <span className="font-semibold">PulseAPI</span>
        </a>
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-neutral-700 hover:text-neutral-900">Features</a>
          <a href="#api-demo" className="text-sm text-neutral-700 hover:text-neutral-900">API Demo</a>
          <a href="#reviews" className="text-sm text-neutral-700 hover:text-neutral-900">Reviews</a>
          <a href="#" className="inline-flex items-center rounded-md bg-brand-600 text-white text-sm px-4 py-2 hover:bg-brand-700">
            Start Testing
          </a>
        </div>
      </div>
    </nav>
  )
}
