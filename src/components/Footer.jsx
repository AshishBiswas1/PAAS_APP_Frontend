export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="ClarityPI" className="h-8 w-8 rounded-lg" />
            <span className="font-semibold">ClarityPI</span>
          </div>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
            Modern API testing for teams who move fast.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Product</h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
            <li>
              <a href="#features">Features</a>
            </li>
            <li>
              <a href="#api-demo">Live Demo</a>
            </li>
            <li>
              <a href="#reviews">Reviews</a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Resources</h3>
          <ul className="mt-3 space-y-2 text-sm text-neutral-600 dark:text-neutral-300">
            <li>
              <a href="#">Docs</a>
            </li>
            <li>
              <a href="#">CLI</a>
            </li>
            <li>
              <a href="#">Status</a>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Get updates</h3>
          <form className="mt-3 flex gap-2">
            <input
              type="email"
              placeholder="you@example.com"
              className="flex-1 rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
            <button className="rounded-md bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm px-4 py-2">
              Subscribe
            </button>
          </form>
        </div>
      </div>
      <div className="border-t border-neutral-200 dark:border-neutral-800 py-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
        © {new Date().getFullYear()} ClarityPI. All rights reserved.
      </div>
    </footer>
  );
}
