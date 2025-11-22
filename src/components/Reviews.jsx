const reviews = [
  { name: "Aisha K.", role: "SRE Lead", text: "The monitors caught a schema drift before prod. Instant win." },
  { name: "Marco L.", role: "Backend Dev", text: "Collections + envs replaced three tools for our team." },
  { name: "Ivy T.", role: "QA Engineer", text: "Assertions are readable, and the CLI slots right into CI." },
]

export default function Reviews() {
  return (
    <section id="reviews" className="py-20 bg-neutral-50 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Loved by fast teams</h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">Real stories from engineers shipping reliable APIs.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <figure key={i} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900 p-6 shadow-card">
              <blockquote className="text-neutral-800 dark:text-neutral-100">“{r.text}”</blockquote>
              <figcaption className="mt-4 text-sm text-neutral-600 dark:text-neutral-300">{r.name} • {r.role}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
