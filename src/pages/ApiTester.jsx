import { useEffect, useRef, useState } from "react"

/* Splitter hooks */
function useHorizontalResize(initial, min = 220, max = 520) {
  const [width, setWidth] = useState(initial)
  const dragging = useRef(false)
  useEffect(() => {
    const onMove = (e) => { if (dragging.current) setWidth(Math.max(min, Math.min(max, e.clientX))) }
    const onUp = () => { dragging.current = false }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [min, max])
  return { width, handleMouseDown: () => { dragging.current = true } }
}
function useRightResize(initial, min = 300, max = 640) {
  const [width, setWidth] = useState(initial)
  const dragging = useRef(false)
  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return
      const next = window.innerWidth - e.clientX
      setWidth(Math.max(min, Math.min(max, next)))
    }
    const onUp = () => { dragging.current = false }
    window.addEventListener("mousemove", onMove)
    window.addEventListener("mouseup", onUp)
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp) }
  }, [min, max])
  return { width, handleMouseDown: () => { dragging.current = true } }
}

/* Generic click-outside hook */
function useClickOutside(ref, onOutside) {
  useEffect(() => {
    const onDown = (e) => {
      if (!ref.current) return
      if (!ref.current.contains(e.target)) onOutside?.()
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [ref, onOutside])
}

/* Simple dots icon */
const Dots = () => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
    <circle cx="4" cy="10" r="1.6"></circle>
    <circle cx="10" cy="10" r="1.6"></circle>
    <circle cx="16" cy="10" r="1.6"></circle>
  </svg>
)

export default function ApiTester() {
  const left = useHorizontalResize(260)
  const right = useRightResize(400)

  // Sidebar state (desktop + mobile overlay)
  const [leftOpen, setLeftOpen] = useState(true)
  const [mobileOverlay, setMobileOverlay] = useState(false)

  // Persist sidebar preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("leftOpen")
      if (saved != null) setLeftOpen(saved === "true")
    } catch {}
  }, [])
  useEffect(() => {
    try { localStorage.setItem("leftOpen", String(leftOpen)) } catch {}
  }, [leftOpen])

  // Esc to close overlay and menus
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMobileOverlay(false)
        setRootMenuOpen(false)
        setColMenu(null)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const handleHamburger = () => {
    if (window.innerWidth < 1024) {
      setMobileOverlay(v => !v)
      if (!leftOpen) setLeftOpen(true)
    } else {
      setLeftOpen(v => !v)
    }
  }

  // Collections
  const [collections, setCollections] = useState([])
  const addCollection = () => {
    const name = window.prompt("Collection name")
    if (!name) return
    setCollections(prev => [...prev, { id: crypto.randomUUID(), name, requests: [] }])
  }
  const renameCollection = (id) => {
    const col = collections.find(c => c.id === id)
    if (!col) return
    const name = window.prompt("Rename collection", col.name)
    if (!name) return
    setCollections(prev => prev.map(c => c.id === id ? { ...c, name } : c))
  }
  const duplicateCollection = (id) => {
    const col = collections.find(c => c.id === id)
    if (!col) return
    const copy = { ...col, id: crypto.randomUUID(), name: `${col.name} (copy)` }
    setCollections(prev => [copy, ...prev])
  }
  const deleteCollection = (id) => {
    if (!confirm("Delete this collection?")) return
    setCollections(prev => prev.filter(c => c.id !== id))
  }
  const addRequestTo = (colId) => {
    const name = window.prompt("Request label (e.g. GET /v1/me)")
    if (!name) return
    setCollections(prev => prev.map(c => c.id === colId ? { ...c, requests: [...c.requests, { id: crypto.randomUUID(), name }] } : c))
  }
  const onSelectRequest = (req) => {
    const match = req.name.match(/\/(\S+)/)
    if (match) setUrl(req.name.includes("http") ? req.name : `https://api.pulse.dev${match[0]}`)
    else setUrl(req.name)
    setMobileOverlay(false)
  }

  // Root collections menu (three dots near title)
  const [rootMenuOpen, setRootMenuOpen] = useState(false)
  const rootMenuRef = useRef(null)
  useClickOutside(rootMenuRef, () => setRootMenuOpen(false))

  // Per-collection menu state: store the id that's open
  const [colMenu, setColMenu] = useState(null) // { id, x, y } or null
  const colMenuRef = useRef(null)
  useClickOutside(colMenuRef, () => setColMenu(null))

  // Request builder state
  const [method, setMethod] = useState("GET")
  const [url, setUrl] = useState("https://api.pulse.dev/v1/welcome")
  const [activeReqTab, setActiveReqTab] = useState("params")
  const [params, setParams] = useState([{ k: "lang", v: "en" }])
  const [headers, setHeaders] = useState([{ k: "Accept", v: "application/json" }])
  const [bodyType, setBodyType] = useState("json")
  const [rawBody, setRawBody] = useState('{ "hello": "world" }')

  // Response state
  const [loading, setLoading] = useState(false)
  const [respTab, setRespTab] = useState("body")
  const [status, setStatus] = useState(null)
  const [timeMs, setTimeMs] = useState(null)
  const [respHeaders, setRespHeaders] = useState([])
  const [respBody, setRespBody] = useState("")
  const [history, setHistory] = useState([])

  // Derived URL
  const query = params.filter(p => p.k?.trim().length).map(p => `${encodeURIComponent(p.k)}=${encodeURIComponent(p.v ?? "")}`).join("&")
  const finalUrl = query ? `${url}${url.includes("?") ? "&" : "?"}${query}` : url

  const sendRequest = async () => {
    try {
      setLoading(true)
      setStatus(null)
      setRespHeaders([])
      setRespBody("")
      const t0 = performance.now()

      const init = { method, headers: {} }
      headers.filter(h => h.k?.trim().length).forEach(h => init.headers[h.k] = h.v ?? "")
      if (!["GET","HEAD"].includes(method)) {
        if (bodyType === "json") {
          init.body = rawBody
          if (!init.headers["Content-Type"]) init.headers["Content-Type"] = "application/json"
        } else if (bodyType === "text") {
          init.body = rawBody
          if (!init.headers["Content-Type"]) init.headers["Content-Type"] = "text/plain"
        } else if (bodyType === "form") {
          const fd = new FormData()
          try { Object.entries(JSON.parse(rawBody)).forEach(([k,v]) => fd.append(k, String(v))) }
          catch { fd.append("data", rawBody) }
          init.body = fd
        }
      }

      const res = await fetch(finalUrl, init)
      const t1 = performance.now()
      setTimeMs(Math.round(t1 - t0))
      setStatus(`${res.status} ${res.statusText}`)
      const hdrs = []; res.headers.forEach((v,k)=>hdrs.push({k,v})); setRespHeaders(hdrs)
      const ct = res.headers.get("content-type") || ""
      if (ct.includes("application/json")) {
        const json = await res.json()
        setRespBody(JSON.stringify(json, null, 2))
      } else {
        const txt = await res.text()
        setRespBody(txt)
      }
      setRespTab("body")
      setHistory(h => [{ id: Date.now(), method, url: finalUrl, status: res.status, time: Math.round(t1 - t0) }, ...h].slice(0, 25))
    } catch (e) {
      setStatus("Network error")
      setRespBody(String(e))
      setRespTab("body")
    } finally {
      setLoading(false)
    }
  }

  const addRow = (set) => set(prev => [...prev, { k: "", v: "" }])
  const updateRow = (set, i, field, val) => set(prev => prev.map((row, idx) => idx === i ? { ...row, [field]: val } : row))
  const removeRow = (set, i) => set(prev => prev.filter((_, idx) => idx !== i))

  const methodBadge = (m) => {
    const map = {
      GET: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
      POST: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
      PUT: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
      PATCH: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
      DELETE: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
      HEAD: "bg-neutral-200 text-neutral-800 dark:bg-neutral-500/20 dark:text-neutral-300",
      OPTIONS: "bg-neutral-200 text-neutral-800 dark:bg-neutral-500/20 dark:text-neutral-300",
    }
    return map[m] || "bg-neutral-200 text-neutral-800 dark:bg-neutral-500/20 dark:text-neutral-300"
  }

  return (
    <div className="pt-16 h-[calc(100vh-4rem)] flex flex-col bg-white text-neutral-800 dark:bg-[#0b0f14] dark:text-neutral-200">
      {/* Top app chrome */}
      <div className="h-12 flex items-center gap-3 px-3 border-b border-neutral-200 bg-white dark:border-[#1b2330] dark:bg-[#0e131a]">
        <button onClick={handleHamburger} className="icon-btn light" aria-label="Toggle sidebar">☰</button>
        <div className="text-sm text-neutral-700 dark:text-neutral-300">My Workspace</div>
        <div className="flex-1" />
        <input className="h-8 w-80 rounded bg-white border border-neutral-300 px-3 text-sm dark:bg-[#0b0f14] dark:border-[#1b2330] dark:text-neutral-200" placeholder="Search" />
        <button onClick={sendRequest} className="h-8 px-4 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm disabled:opacity-60" disabled={loading}>{loading ? "Sending…" : "Send"}</button>
        <div className="w-px h-6 bg-neutral-200 dark:bg-[#1b2330]" />
        <button className="icon-btn light" aria-label="settings">⚙︎</button>
      </div>

      {/* Main row */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left rail + mobile overlay */}
        {leftOpen && (
          <>
            <div
              onClick={() => setMobileOverlay(false)}
              className={`lg:hidden fixed inset-0 z-40 bg-black/20 transition-opacity ${mobileOverlay ? "opacity-100 visible" : "opacity-0 invisible"}`}
              aria-hidden
            />
            <aside
              style={{ width: left.width }}
              className={`z-50 lg:z-auto shrink-0 border-r border-neutral-200 bg-neutral-50 dark:border-[#1b2330] dark:bg-[#0e131a] flex flex-col
                ${mobileOverlay ? "fixed left-0 top-16 h-[calc(100vh-4rem)] shadow-xl w-[min(86vw,320px)] translate-x-0 transition-transform" : "relative"}
              `}
              aria-label="Collections sidebar"
            >
              {/* Header row: title + add + root menu */}
              <div className="h-10 flex items-center justify-between px-3 border-b border-neutral-200 dark:border-[#1b2330]">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">Collections</span>
                  <button onClick={addCollection} className="h-6 w-6 inline-flex items-center justify-center rounded border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-100 text-sm dark:bg-[#141b24] dark:border-[#1b2330] dark:text-neutral-300" aria-label="New collection">+</button>
                </div>
                <div className="relative" ref={rootMenuRef}>
                  <button
                    onClick={() => setRootMenuOpen(v => !v)}
                    aria-label="Collections menu"
                    className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-neutral-200/60 text-neutral-600 dark:hover:bg-slate-800/60 dark:text-neutral-300"
                  >
                    <Dots />
                  </button>
                  {rootMenuOpen && (
                    <MenuCard onClose={() => setRootMenuOpen(false)}>
                      <MenuItem onClick={() => { setRootMenuOpen(false); addCollection(); }}>Add collection</MenuItem>
                      <MenuDivider />
                      <MenuItem onClick={() => alert("Import (stub)")}>Import</MenuItem>
                      <MenuItem onClick={() => alert("Export (stub)")}>Export</MenuItem>
                    </MenuCard>
                  )}
                </div>
              </div>

              {/* Collections list */}
              <div className="flex-1 overflow-auto px-2 py-2 space-y-3">
                {collections.length === 0 ? (
                  <div className="text-xs text-neutral-500 px-2">No collections yet. Use + to create one.</div>
                ) : collections.map(col => (
                  <div key={col.id} className="group">
                    <div className="flex items-center justify-between px-2">
                      <div className="text-[11px] uppercase tracking-wide text-neutral-500">{col.name}</div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => addRequestTo(col.id)}
                          className="text-[11px] px-1.5 py-0.5 rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-[#1b2330] dark:bg-[#141b24] dark:text-neutral-300"
                        >
                          + Request
                        </button>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              setColMenu({ id: col.id, x: rect.left, y: rect.bottom })
                            }}
                            aria-label="Collection menu"
                            className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-neutral-200/60 text-neutral-600 dark:hover:bg-slate-800/60 dark:text-neutral-300"
                          >
                            <Dots />
                          </button>
                          {colMenu?.id === col.id && (
                            <MenuCard refEl={colMenuRef} style={{ minWidth: 200 }}>
                              <MenuItem onClick={() => { setColMenu(null); addRequestTo(col.id) }}>Add request</MenuItem>
                              <MenuItem onClick={() => { setColMenu(null); alert("Add folder (stub)") }}>Add folder</MenuItem>
                              <MenuDivider />
                              <MenuItem onClick={() => { setColMenu(null); alert("Run (stub)") }}>Run</MenuItem>
                              <MenuItem onClick={() => { setColMenu(null); alert("Share (stub)") }}>Share</MenuItem>
                              <MenuItem onClick={() => { setColMenu(null); alert("Copy link (stub)") }}>Copy link</MenuItem>
                              <MenuDivider />
                              <MenuItem onClick={() => { setColMenu(null); alert("Ask AI (stub)") }}>Ask AI</MenuItem>
                              <MenuItem onClick={() => { setColMenu(null); alert("Move (stub)") }}>Move</MenuItem>
                              <MenuItem onClick={() => { setColMenu(null); alert("Fork (stub)") }}>
                                Fork <span className="ml-auto text-xs text-neutral-400">Ctrl+Alt+F</span>
                              </MenuItem>
                              <MenuItem onClick={() => { setColMenu(null); renameCollection(col.id) }}>
                                Rename <span className="ml-auto text-xs text-neutral-400">Ctrl+E</span>
                              </MenuItem>
                              <MenuItem onClick={() => { setColMenu(null); duplicateCollection(col.id) }}>
                                Duplicate <span className="ml-auto text-xs text-neutral-400">Ctrl+D</span>
                              </MenuItem>
                              <MenuItem destructive onClick={() => { setColMenu(null); deleteCollection(col.id) }}>
                                Delete <span className="ml-auto text-xs text-neutral-400">Del</span>
                              </MenuItem>
                            </MenuCard>
                          )}
                        </div>
                      </div>
                    </div>
                    <ul className="mt-2">
                      {col.requests.map(req => (
                        <li key={req.id} onClick={()=>onSelectRequest(req)}
                            className="px-2 py-1.5 rounded hover:bg-neutral-100 cursor-pointer text-xs flex items-center gap-2 dark:hover:bg-[#0f1622]">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${methodBadge((req.name.split(' ')[0] || 'GET').toUpperCase())}`}>
                            {(req.name.split(' ')[0] || 'GET').toUpperCase()}
                          </span>
                          <span className="truncate">{req.name.replace(/^\w+\s+/, '')}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="h-7 border-t border-neutral-200 text-[11px] text-neutral-500 flex items-center px-3 dark:border-[#1b2330] dark:text-neutral-400">Console</div>
            </aside>
          </>
        )}

        {/* Handle L */}
        <div onMouseDown={left.handleMouseDown} className="w-1 cursor-col-resize bg-transparent hover:bg-indigo-500/30" aria-hidden />

        {/* Center request builder */}
        <section className="flex-1 min-w-0 flex flex-col bg-white dark:bg-[#0b0f14]">
          {/* URL strip */}
          <div className="h-10 flex items-center gap-2 px-3 border-b border-neutral-200 bg-white dark:border-[#1b2330] dark:bg-[#0e131a]">
            <select value={method} onChange={e=>setMethod(e.target.value)}
                    className="h-8 px-2 rounded bg-white border border-neutral-300 text-sm text-neutral-800 dark:bg-[#141b24] dark:border-[#1b2330] dark:text-neutral-200">
              {["GET","POST","PUT","PATCH","DELETE","HEAD","OPTIONS"].map(m => <option key={m}>{m}</option>)}
            </select>
            <input value={url} onChange={e=>setUrl(e.target.value)}
                   className="flex-1 h-8 rounded bg-white border border-neutral-300 px-3 text-sm text-neutral-800 placeholder:text-neutral-400 dark:bg-[#0b0f14] dark:border-[#1b2330] dark:text-neutral-200"
                   placeholder="https://api.example.com/resource" />
            <button onClick={sendRequest} className="h-8 px-4 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm disabled:opacity-60" disabled={loading}>
              {loading ? "Sending…" : "Send"}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-2 dark:border-[#1b2330] dark:bg-[#0e131a]">
            {["params","headers","body"].map(t => (
              <button key={t} onClick={()=>setActiveReqTab(t)}
                className={`h-9 px-3 text-[13px] border-b-2 ${activeReqTab===t ? "border-indigo-500 text-neutral-900 dark:text-neutral-100" : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"}`}>
                {t[0].toUpperCase()+t.slice(1)}
              </button>
            ))}
            <div className="ml-auto text-[11px] text-neutral-500 truncate max-w-[50%]">Final: <span className="font-mono">{finalUrl}</span></div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto p-3">
            {activeReqTab==="params" && (
              <KeyValueEditor
                rows={params}
                onAdd={()=>addRow(setParams)}
                onUpdate={(i,f,v)=>updateRow(setParams,i,f,v)}
                onRemove={(i)=>removeRow(setParams,i)}
                labelK="Key" labelV="Value"
              />
            )}
            {activeReqTab==="headers" && (
              <KeyValueEditor
                rows={headers}
                onAdd={()=>addRow(setHeaders)}
                onUpdate={(i,f,v)=>updateRow(setHeaders,i,f,v)}
                onRemove={(i)=>removeRow(setHeaders,i)}
                labelK="Header" labelV="Value"
              />
            )}
            {activeReqTab==="body" && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {["json","text","form"].map(bt => (
                    <button key={bt} onClick={()=>setBodyType(bt)}
                            className={`text-[11px] px-2 py-1 rounded border ${bodyType===bt ? "border-indigo-500 text-neutral-900 dark:text-neutral-100" : "border-neutral-300 text-neutral-600 dark:border-[#1b2330] dark:text-neutral-400"}`}>
                      {bt.toUpperCase()}
                    </button>
                  ))}
                </div>
                <textarea className="w-full h-64 rounded border border-neutral-300 bg-neutral-50 p-3 font-mono text-sm text-neutral-800 dark:border-[#1b2330] dark:bg-[#0e131a] dark:text-neutral-200"
                  value={rawBody} onChange={e=>setRawBody(e.target.value)} spellCheck="false" />
              </div>
            )}
          </div>
        </section>

        {/* Handle R */}
        <div onMouseDown={right.handleMouseDown} className="w-1 cursor-col-resize bg-transparent hover:bg-indigo-500/30" aria-hidden />

        {/* Right response viewer */}
        <aside style={{ width: right.width }} className="shrink-0 border-l border-neutral-200 bg-neutral-50 flex flex-col dark:border-[#1b2330] dark:bg-[#0e131a]">
          <div className="h-10 flex items-center justify-between px-3 border-b border-neutral-200 dark:border-[#1b2330] bg-white dark:bg-transparent">
            <div className="text-sm">
              <span className="font-medium text-neutral-800 dark:text-neutral-100">Response</span>
              <span className="ml-2 text-neutral-500">{status || "—"}</span>
            </div>
            <div className="text-[11px] text-neutral-500">{timeMs != null ? `${timeMs} ms` : ""}</div>
          </div>

          <div className="flex items-center gap-2 border-b border-neutral-200 px-2 bg-neutral-50 dark:border-[#1b2330] dark:bg-[#0e131a]">
            {["body","headers","preview"].map(t => (
              <button key={t} onClick={()=>setRespTab(t)}
                className={`h-9 px-3 text-[13px] border-b-2 ${respTab===t ? "border-indigo-500 text-neutral-900 dark:text-neutral-100" : "border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"}`}>
                {t[0].toUpperCase()+t.slice(1)}
              </button>
            ))}
            <div className="ml-auto text-[12px] text-neutral-500 flex items-center gap-2">
              <span>History</span>
              <div className="w-1 h-1 rounded-full bg-neutral-400 dark:bg-neutral-600" />
            </div>
          </div>

          <div className="flex-1 overflow-auto p-3">
            {respTab==="body" && (
              respBody
              ? <pre className="bg-neutral-900 text-neutral-100 p-3 rounded text-sm leading-6 overflow-auto dark:bg-[#0b0f14] dark:border-[#1b2330] border border-neutral-200">{respBody}</pre>
              : <EmptyStateLight />
            )}
            {respTab==="headers" && (
              <div className="space-y-2">
                {respHeaders.length ? respHeaders.map((h,i)=>(
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="min-w-[160px] font-mono text-neutral-500 dark:text-neutral-400">{h.k}</span>
                    <span className="font-mono text-neutral-800 dark:text-neutral-200">{h.v}</span>
                  </div>
                )) : <div className="text-neutral-500 text-sm">No headers</div>}
              </div>
            )}
            {respTab==="preview" && (
              <iframe title="preview" className="w-full h-full bg-white rounded border border-neutral-200 dark:bg-slate-900 dark:border-[#1b2330]"
                srcDoc={respBody.startsWith("<") ? respBody : `<pre style="padding:12px;font:12px/1.6 monospace">${escapeHtml(respBody || "No preview")}</pre>`} />
            )}
          </div>

          <div className="h-24 border-top border-t border-neutral-200 overflow-auto dark:border-[#1b2330]">
            {history.length ? history.map(h => (
              <div key={h.id} className="px-3 py-1.5 text-[12px] text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${methodBadge(h.method)}`}>{h.method}</span>
                <span className="truncate">{h.url}</span>
                <span className="ml-auto text-neutral-500">{h.status} • {h.time}ms</span>
              </div>
            )) : <div className="h-full flex items-center justify-center text-neutral-500 text-[12px]">No recent requests</div>}
          </div>
        </aside>
      </div>
    </div>
  )
}

/* Menu UI primitives */
function MenuCard({ children, onClose, style, refEl }) {
  const innerRef = useRef(null)
  useClickOutside(innerRef, () => onClose?.())
  return (
    <div ref={innerRef}
      className="absolute right-0 mt-1 z-50 rounded-md border border-neutral-200 bg-white shadow-xl text-sm py-1 min-w-[180px] dark:border-[#1b2330] dark:bg-[#0e131a]"
      style={style}
      role="menu"
    >
      {children}
    </div>
  )
}
function MenuDivider() {
  return <div className="my-1 h-px bg-neutral-200 dark:bg-[#1b2330]" />
}
function MenuItem({ children, onClick, destructive }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-slate-800/60 flex items-center ${
        destructive ? "text-rose-600 dark:text-rose-400" : "text-neutral-800 dark:text-neutral-200"
      }`}
    >
      {children}
    </button>
  )
}

/* Forms/editors */
function KeyValueEditor({ rows, onAdd, onUpdate, onRemove, labelK="Key", labelV="Value" }) {
  return (
    <div>
      <div className="grid grid-cols-12 gap-2 text-[11px] text-neutral-500 mb-1 dark:text-neutral-400">
        <div className="col-span-5">{labelK}</div>
        <div className="col-span-6">{labelV}</div>
        <div className="col-span-1"></div>
      </div>
      <div className="space-y-2">
        {rows.map((r,i)=>(
          <div key={i} className="grid grid-cols-12 gap-2">
            <input className="col-span-5 h-8 rounded bg-white border border-neutral-300 px-2 text-sm text-neutral-800 placeholder:text-neutral-400 dark:bg-[#0e131a] dark:border-[#1b2330] dark:text-neutral-200"
              value={r.k} onChange={e=>onUpdate(i,"k",e.target.value)} placeholder={labelK} />
            <input className="col-span-6 h-8 rounded bg-white border border-neutral-300 px-2 text-sm text-neutral-800 placeholder:text-neutral-400 dark:bg-[#0e131a] dark:border-[#1b2330] dark:text-neutral-200"
              value={r.v} onChange={e=>onUpdate(i,"v",e.target.value)} placeholder={labelV} />
            <button onClick={()=>onRemove(i)} className="col-span-1 h-8 rounded bg-white border border-neutral-300 text-sm text-neutral-700 dark:bg-[#141b24] dark:border-[#1b2330] dark:text-neutral-300">−</button>
          </div>
        ))}
      </div>
      <button onClick={onAdd} className="mt-3 text-sm px-3 py-1.5 rounded bg-white border border-neutral-300 text-neutral-700 dark:bg-[#141b24] dark:border-[#1b2330] dark:text-neutral-300">Add</button>
    </div>
  )
}

function EmptyStateLight() {
  return (
    <div className="h-full min-h-[260px] rounded border border-neutral-200 bg-white flex flex-col items-center justify-center text-neutral-500 dark:border-[#1b2330] dark:bg-[#0b0f14] dark:text-neutral-400">
      <div className="w-16 h-16 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center">🚀</div>
      <div className="mt-3 text-sm">Click Send to get a response</div>
    </div>
  )
}

/* Utils */
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))
}
