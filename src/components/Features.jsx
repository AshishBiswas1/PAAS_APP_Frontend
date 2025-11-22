const items = [
  { title: "Smart Collections", desc: "Organize requests, variables, and examples with zero friction.", icon: "🗂️" },
  { title: "Contract Validation", desc: "Validate against OpenAPI/JSON Schema directly in your tests.", icon: "🧩" },
  { title: "Environments & Secrets", desc: "Securely swap tokens and URLs per environment.", icon: "🔐" },
  { title: "Team Workspaces", desc: "Share collections and history with role-based access.", icon: "👥" },
  { title: "Assertions & Monitors", desc: "Automate checks for status, body, and performance.", icon: "✅" },
  { title: "CLI + CI", desc: "Run suites in pipelines and export artifacts.", icon: "⚙️" },
]

export default function Features() {
  return (
    <section id="features" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Everything for fast feedback</h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">Build, validate, and automate API checks in one place.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((f, i) => (
            <div key={i} className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900 p-6 shadow-card hover:shadow-lg transition">
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
