import { Link } from 'react-router-dom'

export default function Hero() {
  return (
    <section className="pt-28 pb-20 bg-gradient-to-b from-white to-neutral-50 dark:from-slate-900 dark:to-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs">
          New • Assertions & Monitors
        </span>
        <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight">
          Test APIs faster with clarity
        </h1>
        <p className="mt-4 text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
          Collections, contract checks, environments, and CI runs—all in one lightweight workflow.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/app" className="inline-flex items-center rounded-md bg-brand-600 text-white px-6 py-3 text-sm font-medium hover:bg-brand-700">
            Open App
          </Link>
          <a href="#api-demo" className="inline-flex items-center rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 px-6 py-3 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-slate-800/60">
            Live Demo
          </a>
        </div>
      </div>
    </section>
  )
}
