import { useState } from "react"

const code = `{
  "message": "Welcome, Developer!",
  "plan": "Pro",
  "requests_today": 128,
  "latency_ms": 42,
  "features": ["Assertions", "Monitors", "OpenAPI", "Workspaces", "CLI", "CI"],
  "tips": ["Use env vars for tokens","Add contract tests to prevent regressions","Invite teammates to share collections","Schedule monitors for uptime and SLOs","Export CLI runs in CI for artifacts","Tag requests for changelogs"],
  "example_response": { "status": 200, "headers": { "content-type": "application/json", "x-request-id": "req_9f8c", "cache-control": "no-store" }, "body": { "hello": "world", "timestamp": 1732112345, "data": "…" } }
}`

const tabs = {
  curl: `curl -s https://api.pulse.dev/v1/welcome \\
  -H "Authorization: Bearer $TOKEN"`,
  fetch: `await fetch("https://api.pulse.dev/v1/welcome", { headers: { Authorization: "Bearer " + token } }).then(r => r.json())`,
  axios: `const res = await axios.get("/v1/welcome", { baseURL: "https://api.pulse.dev", headers: { Authorization: "Bearer " + token } })`,
}

export default function ApiScrollBlock() {
  const [tab, setTab] = useState("curl")

  return (
    <section id="api-demo" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <h2 className="text-3xl font-bold">See responses in real time</h2>
          <p className="mt-3 text-neutral-600 dark:text-neutral-300">
            A sticky response window creates focus while you scroll the page—perfect
            for explaining what a great API feels like.
          </p>

          <div className="mt-6 inline-flex rounded-lg border border-neutral-300 dark:border-neutral-700 p-1 bg-white dark:bg-slate-900">
            {["curl","fetch","axios"].map(k => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`px-3 py-1.5 text-sm rounded-md ${tab===k ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900" : "text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-slate-800/60"}`}
              >
                {k.toUpperCase()}
              </button>
            ))}
          </div>

          <pre className="mt-4 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-slate-900 text-sm overflow-x-auto">
{tabs[tab]}
          </pre>

          <ul className="mt-6 space-y-2 text-sm text-neutral-700 dark:text-neutral-300">
            <li>• 200 OK with sub‑50ms p95 on edge regions.</li>
            <li>• Structured errors and request IDs for tracing.</li>
            <li>• Contract‑first with OpenAPI and JSON Schema.</li>
          </ul>
        </div>

        <div className="sticky-window">
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-card bg-white dark:bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-emerald-100 text-emerald-700">GET</span>
                <span className="font-mono text-sm text-neutral-800 dark:text-neutral-200">/v1/welcome</span>
              </div>
              <div className="text-sm text-neutral-600 dark:text-neutral-300">
                <span className="text-emerald-600">200</span> • 42ms
              </div>
            </div>

            <div className="h-96 overflow-y-auto mask-fade-y pr-3">
              <pre className="p-4 bg-neutral-900 text-neutral-100 text-sm leading-7 font-mono">
{code}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
