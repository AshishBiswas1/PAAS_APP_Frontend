import React, { useState, useEffect, useRef } from 'react';

// API base URL from environment
const API_BASE = import.meta.env.VITE_API_BASE;

// Simple hook for clicking outside
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler(e);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// Simple Dots icon component
function Dots() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="3" cy="8" r="1.5" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="13" cy="8" r="1.5" />
    </svg>
  );
}

// Workspace collection mapping helpers
function getWorkspaceCollections() {
  try {
    const stored = localStorage.getItem('workspaceCollections');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setWorkspaceCollections(map) {
  try {
    localStorage.setItem('workspaceCollections', JSON.stringify(map));
  } catch {}
}

export default function ApiTester() {
  // Workspace state
  const [workspaces, setWorkspaces] = useState(() => {
    try {
      const stored = localStorage.getItem('workspaces');
      return stored
        ? JSON.parse(stored)
        : [{ id: 'default', name: 'My Workspace' }];
    } catch {
      return [{ id: 'default', name: 'My Workspace' }];
    }
  });
  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    try {
      return localStorage.getItem('activeWorkspace') || 'default';
    } catch {
      return 'default';
    }
  });

  // Collections state
  const [collections, setCollections] = useState([]);

  // Sidebar state
  const [leftOpen, setLeftOpen] = useState(true);
  const [mobileOverlay, setMobileOverlay] = useState(false);

  // Resizable panel state
  const [left, setLeft] = useState({ width: 280, handleMouseDown: () => {} });
  const [right, setRight] = useState({ width: 480, handleMouseDown: () => {} });

  // Collapse state for collections and folders
  const [collapsedCols, setCollapsedCols] = useState({});
  const [collapsedFolders, setCollapsedFolders] = useState({});

  const handleHamburger = () => {
    if (window.innerWidth < 1024) {
      setMobileOverlay((v) => !v);
    } else {
      setLeftOpen((v) => !v);
    }
  };

  const addWorkspace = () => {
    const name = window.prompt('Workspace name');
    if (!name) return;
    const newWs = { id: crypto.randomUUID(), name };
    setWorkspaces((prev) => [...prev, newWs]);
    try {
      localStorage.setItem(
        'workspaces',
        JSON.stringify([...workspaces, newWs])
      );
    } catch {}
  };

  const addCollection = async () => {
    const title = window.prompt('Collection name');
    if (!title) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(
        `${API_BASE}/api/paas/collection/userCollection`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ title, description: '' })
        }
      );
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || 'Failed to create collection');
      const colId =
        (j.data && (j.data.id || j.data.col_id || j.data.cid)) ||
        crypto.randomUUID();
      const newCol = { id: colId, name: title, requests: [], folders: [] };
      setCollections((prev) => [newCol, ...prev]);

      // Map to active workspace
      const map = getWorkspaceCollections();
      if (!map[activeWorkspace]) map[activeWorkspace] = [];
      if (!map[activeWorkspace].includes(colId))
        map[activeWorkspace].push(colId);
      setWorkspaceCollections(map);

      import('../lib/alert').then((m) =>
        m.default('Collection created', 'success')
      );
    } catch (err) {
      import('../lib/alert').then((m) =>
        m.default('Create collection failed: ' + (err.message || err), 'error')
      );
    }
  };

  const renameCollection = (id) => {
    const col = collections.find((c) => c.id === id);
    if (!col) return;
    const newName = window.prompt('New name', col.name);
    if (!newName) return;
    setCollections((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name: newName } : c))
    );
  };

  const toggleCollection = (id) => {
    setCollapsedCols((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFolder = (id) => {
    setCollapsedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const duplicateCollection = (id) => {
    const col = collections.find((c) => c.id === id);
    if (!col) return;
    const copy = {
      ...col,
      id: crypto.randomUUID(),
      name: `${col.name} (copy)`
    };
    setCollections((prev) => [copy, ...prev]);
  };
  const deleteCollection = async (id) => {
    if (
      !confirm(
        'Delete this collection? This will also delete all folders and APIs within it.'
      )
    )
      return;
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(
        `${API_BASE}/api/paas/collection/deleteCollection/${id}`,
        {
          method: 'DELETE',
          headers
        }
      );

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || 'Failed to delete collection');
      }

      // Remove from local state
      setCollections((prev) => prev.filter((c) => c.id !== id));

      // Remove from workspace collections mapping
      const map = getWorkspaceCollections();
      Object.keys(map).forEach((workspaceId) => {
        map[workspaceId] = map[workspaceId].filter((colId) => colId !== id);
      });
      setWorkspaceCollections(map);

      import('../lib/alert').then((m) =>
        m.default('Collection deleted successfully', 'success')
      );
    } catch (err) {
      console.error('Delete collection error:', err);
      import('../lib/alert').then((m) =>
        m.default('Delete failed: ' + (err.message || err), 'error')
      );
    }
  };
  const addRequestTo = (colId) => {
    const name = window.prompt('Request label (e.g. GET /v1/me)');
    if (!name) return;
    setCollections((prev) =>
      prev.map((c) =>
        c.id === colId
          ? {
              ...c,
              requests: [...c.requests, { id: crypto.randomUUID(), name }]
            }
          : c
      )
    );
  };

  // Fetch collections + folders + APIs from backend when user is logged in
  const fetchCollectionsFromServer = async (user) => {
    if (!user || !user.id) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Fetch all user's saved APIs
      let userApis = [];
      try {
        const apiRes = await fetch(`${API_BASE}/api/paas/url/userapi`, {
          method: 'GET',
          headers
        });
        if (apiRes.ok) {
          const apiJson = await apiRes.json();
          userApis = Array.isArray(apiJson.data) ? apiJson.data : [];
        }
      } catch (e) {
        console.error('Failed to fetch user APIs:', e);
      }

      const res = await fetch(
        `${API_BASE}/api/paas/collection/getCollection/${user.id}`,
        {
          method: 'GET',
          headers
        }
      );
      if (!res.ok) return; // silently ignore
      const json = await res.json();
      const cols = Array.isArray(json.data) ? json.data : [];

      // for each collection, fetch folders and match APIs
      const enriched = await Promise.all(
        cols.map(async (c) => {
          const col = {
            id: c.id || c.col_id || c.cid || String(c.id),
            name: c.title || c.name || `Collection ${c.id}`,
            description: c.description || '',
            requests: [],
            folders: []
          };

          try {
            const fr = await fetch(
              `${API_BASE}/api/paas/folder/${col.id}/folder`,
              { headers }
            );
            if (fr.ok) {
              const fj = await fr.json();
              if (Array.isArray(fj.data)) {
                col.folders = fj.data.map((f) => {
                  const folderId = f.id || f._id || crypto.randomUUID();
                  // Find APIs that belong to this folder
                  const folderApis = userApis.filter(
                    (api) => api.folder_id === folderId
                  );
                  return {
                    id: folderId,
                    name: f.name,
                    description: f.description,
                    apis: folderApis
                  };
                });
              }
            }
          } catch (e) {
            // ignore per-collection folder failures
          }

          // Find APIs that belong directly to this collection (no folder)
          const collectionApis = userApis.filter(
            (api) => !api.folder_id && api.collection_id === col.id
          );

          // Map APIs to request format
          col.requests = collectionApis.map((api) => ({
            id: api.id || api._id,
            name: `${api.method || 'GET'} ${api.url || ''}`,
            method: api.method,
            url: api.url,
            folder: null
          }));

          return col;
        })
      );

      setCollections(enriched);
    } catch (e) {
      console.error('Failed to fetch collections:', e);
    }
  };

  // Environments
  const [envs, setEnvs] = useState([]);
  const [envModalOpen, setEnvModalOpen] = useState(false);
  const [activeEnvId, setActiveEnvId] = useState(null);
  const [envVariables, setEnvVariables] = useState([]); // array of {id,key,value}
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');

  const fetchEnvsForUser = async (user) => {
    if (!user || !user.id) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/paas/env/getEnvCol/${user.id}`, {
        headers
      });
      if (!res.ok) return;
      const j = await res.json();
      const list = Array.isArray(j.data) ? j.data : [];
      setEnvs(
        list.map((e) => ({
          id: e.id || e._id,
          title: e.title || e.name || 'Env'
        }))
      );
    } catch (e) {}
  };

  const fetchEnvVars = async (envId) => {
    if (!envId) return setEnvVariables([]);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(
        `${API_BASE}/api/paas/env/getvariables/${envId}`,
        {
          headers
        }
      );
      if (!res.ok) return setEnvVariables([]);
      const j = await res.json();
      setEnvVariables(Array.isArray(j.data) ? j.data : []);
    } catch (e) {
      setEnvVariables([]);
    }
  };

  // load envs on mount (and on auth change)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (raw) fetchEnvsForUser(JSON.parse(raw));
    } catch {}
    const onAuth = (e) => {
      const user = (e && e.detail && e.detail.user) || null;
      if (user) fetchEnvsForUser(user);
      else setEnvs([]);
    };
    window.addEventListener('authChanged', onAuth);
    return () => window.removeEventListener('authChanged', onAuth);
  }, []);

  const openEnvManager = async (prefEnvId) => {
    // Fetch environments from backend first if user is logged in
    let fetchedEnvs = envs;
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw);
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const res = await fetch(
          `${API_BASE}/api/paas/env/getEnvCol/${user.id}`,
          {
            headers
          }
        );
        if (res.ok) {
          const j = await res.json();
          const list = Array.isArray(j.data) ? j.data : [];
          fetchedEnvs = list.map((e) => ({
            id: e.id || e._id,
            title: e.title || e.name || 'Env'
          }));
          setEnvs(fetchedEnvs);
        }
      }
    } catch (e) {
      console.error('Failed to fetch environments:', e);
    }

    setEnvModalOpen(true);
    const targetEnvId =
      prefEnvId || (fetchedEnvs[0] && fetchedEnvs[0].id) || null;
    setActiveEnvId(targetEnvId);
    if (targetEnvId) fetchEnvVars(targetEnvId);
  };

  const handleCreateEnv = async (title) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        import('../lib/alert').then((m) =>
          m.default('Please login first', 'error')
        );
        return;
      }

      const headers = { 'Content-Type': 'application/json' };
      headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/paas/env/createEnv`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ title })
      });
      const j = await res.json();

      if (!res.ok) {
        throw new Error(j.message || j.error || 'Failed to create environment');
      }

      // refresh env list
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const user = JSON.parse(raw);
          await fetchEnvsForUser(user);
        }
      } catch (e) {
        console.error('Failed to refresh env list:', e);
      }

      // set the newly created env as active
      const newEnvId = j.data && (j.data.id || j.data._id);
      if (newEnvId) {
        setActiveEnvId(newEnvId);
        await fetchEnvVars(newEnvId);
      }

      import('../lib/alert').then((m) =>
        m.default('Environment created successfully', 'success')
      );
    } catch (err) {
      console.error('Create env error:', err);
      import('../lib/alert').then((m) =>
        m.default('Create env failed: ' + (err.message || err), 'error')
      );
    }
  };

  const handleAddEnvVar = async () => {
    if (!activeEnvId || !newEnvKey) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(
        `${API_BASE}/api/paas/env/saveEnv/${activeEnvId}`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({ key: newEnvKey, value: newEnvValue })
        }
      );
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || 'Failed');
      // refresh vars
      await fetchEnvVars(activeEnvId);
      setNewEnvKey('');
      setNewEnvValue('');
      import('../lib/alert').then((m) =>
        m.default('Variable saved', 'success')
      );
    } catch (err) {
      import('../lib/alert').then((m) =>
        m.default('Save var failed: ' + (err.message || err), 'error')
      );
    }
  };

  const handleUpdateEnvVar = async (varItem) => {
    const varId = varItem && (varItem.id || varItem._id);
    if (!varItem || !varId) return;
    try {
      const newKey = window.prompt('Edit key', varItem.key);
      if (newKey === null) return; // cancelled
      const newValue = window.prompt('Edit value', varItem.value ?? '');
      if (newValue === null) return;

      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/paas/env/variable/${varId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ key: newKey, value: newValue })
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || 'Failed to update variable');
      await fetchEnvVars(activeEnvId);
      import('../lib/alert').then((m) =>
        m.default('Variable updated', 'success')
      );
    } catch (err) {
      import('../lib/alert').then((m) =>
        m.default('Update var failed: ' + (err.message || err), 'error')
      );
    }
  };

  const handleDeleteEnvVar = async (varItem) => {
    const varId = varItem && (varItem.id || varItem._id);
    if (!varItem || !varId) return;
    if (!window.confirm(`Delete variable ${varItem.key}?`)) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/paas/env/variable/${varId}`, {
        method: 'DELETE',
        headers
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.message || 'Failed to delete variable');
      await fetchEnvVars(activeEnvId);
      import('../lib/alert').then((m) =>
        m.default('Variable deleted', 'success')
      );
    } catch (err) {
      import('../lib/alert').then((m) =>
        m.default('Delete var failed: ' + (err.message || err), 'error')
      );
    }
  };

  const insertEnvPlaceholderIntoUrl = (key) => {
    const placeholder = `{{${key}}}`;
    // insert at cursor would be ideal; append for simplicity
    setUrl((u) => (u || '') + placeholder);
  };

  const applyEnvToUrl = (rawUrl) => {
    if (!activeEnvId || !envVariables || envVariables.length === 0)
      return rawUrl;
    let out = rawUrl;
    for (const v of envVariables) {
      if (!v || !v.key) continue;
      const re = new RegExp(`\\{\\{${escapeRegExp(v.key)}\\}\\}`, 'g');
      out = out.replace(re, v.value ?? '');
    }
    return out;
  };

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&');
  }

  useEffect(() => {
    // initial load: if user exists in localStorage, fetch their collections
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const user = JSON.parse(raw);
        fetchCollectionsFromServer(user);
      }
    } catch (e) {}

    // listen for auth changes (login/logout)
    const onAuth = (e) => {
      const user = (e && e.detail && e.detail.user) || null;
      if (user) fetchCollectionsFromServer(user);
      else setCollections([]);
    };
    window.addEventListener('authChanged', onAuth);
    return () => window.removeEventListener('authChanged', onAuth);
  }, []);
  const onSelectRequest = async (req) => {
    try {
      // Fetch the API details from backend using the request ID
      const token = localStorage.getItem('token');
      if (!token || !req.id) {
        // Fallback to old behavior if no token or ID
        const match = req.name.match(/\/(\S+)/);
        if (match) setUrl(req.name.includes('http') ? req.name : req.name);
        else setUrl(req.name);
        setMobileOverlay(false);
        return;
      }

      const headers = { 'Content-Type': 'application/json' };
      headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/api/paas/url/${req.id}`, {
        method: 'GET',
        headers
      });

      if (!res.ok) {
        throw new Error('Failed to fetch API details');
      }

      const json = await res.json();
      const apiData = json.data;

      // Populate all fields with the fetched data
      if (apiData) {
        // Set method
        if (apiData.method) setMethod(apiData.method.toUpperCase());

        // Set URL
        if (apiData.url) setUrl(apiData.url);

        // Set headers
        if (apiData.headers && typeof apiData.headers === 'object') {
          const headerArray = Object.entries(apiData.headers).map(([k, v]) => ({
            k,
            v: String(v)
          }));
          setHeaders(
            headerArray.length > 0
              ? headerArray
              : [{ k: 'Accept', v: 'application/json' }]
          );
        }

        // Set body
        if (apiData.body) {
          setRawBody(
            typeof apiData.body === 'string'
              ? apiData.body
              : JSON.stringify(apiData.body, null, 2)
          );
        }

        // Set response if available
        if (apiData.response) {
          setRespBody(
            typeof apiData.response === 'string'
              ? apiData.response
              : JSON.stringify(apiData.response, null, 2)
          );
        }

        // Set status if available
        if (apiData.res_statuscode) {
          const statusText = apiData.statusmessage || '';
          setStatus(`${apiData.res_statuscode} ${statusText}`.trim());
        }
      }

      setMobileOverlay(false);
    } catch (err) {
      console.error('Failed to fetch API details:', err);
      import('../lib/alert').then((m) =>
        m.default('Failed to load API: ' + (err.message || err), 'error')
      );
      setMobileOverlay(false);
    }
  };

  // Root collections menu (three dots near title)
  const [rootMenuOpen, setRootMenuOpen] = useState(false);
  const rootMenuRef = useRef(null);
  useClickOutside(rootMenuRef, () => setRootMenuOpen(false));

  // Per-collection menu state: store the id that's open
  const [colMenu, setColMenu] = useState(null); // { id, x, y } or null
  const colMenuRef = useRef(null);
  useClickOutside(colMenuRef, () => setColMenu(null));

  // displayed collections filter by active workspace mapping (if present)
  const displayedCollections = (() => {
    try {
      const map = getWorkspaceCollections();
      const ids = map[activeWorkspace];
      if (Array.isArray(ids) && ids.length)
        return collections.filter((c) => ids.includes(c.id));
    } catch {}
    return collections;
  })();

  // Request builder state
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://api.claritypi.dev/v1/welcome');
  const [activeReqTab, setActiveReqTab] = useState('params');
  const [params, setParams] = useState([]);
  const [headers, setHeaders] = useState([
    { k: 'Accept', v: 'application/json' }
  ]);
  const [bodyType, setBodyType] = useState('json');
  const [rawBody, setRawBody] = useState('{ "hello": "world" }');

  // Response state
  const [loading, setLoading] = useState(false);
  const [respTab, setRespTab] = useState('body');
  const [status, setStatus] = useState(null);
  const [timeMs, setTimeMs] = useState(null);
  const [respHeaders, setRespHeaders] = useState([]);
  const [respBody, setRespBody] = useState('');
  const [history, setHistory] = useState([]);

  // Derived URL
  const query = params
    .filter((p) => p.k?.trim().length)
    .map((p) => `${encodeURIComponent(p.k)}=${encodeURIComponent(p.v ?? '')}`)
    .join('&');
  const finalUrl = query
    ? `${url}${url.includes('?') ? '&' : '?'}${query}`
    : url;

  const sendRequest = async () => {
    try {
      setLoading(true);
      setStatus(null);
      setRespHeaders([]);
      setRespBody('');
      const t0 = performance.now();

      const init = { method, headers: {} };
      headers
        .filter((h) => h.k?.trim().length)
        .forEach((h) => (init.headers[h.k] = h.v ?? ''));
      if (!['GET', 'HEAD'].includes(method)) {
        if (bodyType === 'json') {
          init.body = rawBody;
          if (!init.headers['Content-Type'])
            init.headers['Content-Type'] = 'application/json';
        } else if (bodyType === 'text') {
          init.body = rawBody;
          if (!init.headers['Content-Type'])
            init.headers['Content-Type'] = 'text/plain';
        } else if (bodyType === 'form') {
          const fd = new FormData();
          try {
            Object.entries(JSON.parse(rawBody)).forEach(([k, v]) =>
              fd.append(k, String(v))
            );
          } catch {
            fd.append('data', rawBody);
          }
          init.body = fd;
        }
      }

      // Send request to backend proxy
      const proxyUrl = `${API_BASE}/api/paas/proxy`;

      // Check if API_BASE is defined
      if (!API_BASE) {
        throw new Error(
          'API_BASE is not defined. Check your .env file for VITE_API_BASE'
        );
      }

      // apply environment variable substitutions to the final URL before sending
      const urlToSend = applyEnvToUrl(finalUrl);

      // Check if there are still unresolved environment variables
      const unresolvedVars = urlToSend.match(/\{\{([^}]+)\}\}/g);
      if (unresolvedVars) {
        const varNames = unresolvedVars
          .map((v) => v.replace(/[{}]/g, ''))
          .join(', ');
        throw new Error(
          `URL contains unresolved environment variables: ${varNames}\n\n` +
            `Please:\n` +
            `1. Click "Manage Env" to create an environment\n` +
            `2. Add the variable(s): ${varNames}\n` +
            `3. Select the environment before sending the request\n\n` +
            `Or replace {{${varNames}}} with an actual URL like: http://localhost:3000`
        );
      }

      const proxyBody = { method, url: urlToSend, headers: init.headers || {} };
      if (!['GET', 'HEAD'].includes(method)) {
        // include raw body where applicable
        if (bodyType === 'form') {
          try {
            proxyBody.body = JSON.parse(rawBody);
          } catch {
            proxyBody.body = rawBody;
          }
        } else {
          proxyBody.body = rawBody;
        }
      }

      const proxyReqInit = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proxyBody)
      };

      // Add auth token if available
      const token = localStorage.getItem('token');
      if (token) {
        proxyReqInit.headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Sending request to:', proxyUrl);
      console.log('Request payload:', proxyBody);

      const proxyRes = await fetch(proxyUrl, proxyReqInit);
      const t1 = performance.now();
      setTimeMs(Math.round(t1 - t0));

      // proxy returns a JSON object describing the proxied response
      let proxyJson = null;
      try {
        proxyJson = await proxyRes.json();
      } catch (_) {
        proxyJson = null;
      }

      if (proxyJson) {
        // expected shape: { status, statusText, timeMs, headers, body }
        const code = proxyJson.status || proxyRes.status;
        const txt = proxyJson.statusText || proxyRes.statusText || '';
        setStatus(`${code} ${txt}`.trim());
        // prefer proxy time if provided
        setTimeMs(
          typeof proxyJson.timeMs === 'number'
            ? proxyJson.timeMs
            : Math.round(t1 - t0)
        );

        // normalize headers into an array of {k,v} and sort by key
        let hdrsArr = [];
        if (Array.isArray(proxyJson.headers)) hdrsArr = proxyJson.headers;
        else if (proxyJson.headers && typeof proxyJson.headers === 'object')
          hdrsArr = Object.entries(proxyJson.headers)
            .map(([k, v]) => ({ k, v }))
            .sort((a, b) => a.k.localeCompare(b.k));
        setRespHeaders(hdrsArr);

        // pretty-print body when it's an object; otherwise stringify safely
        try {
          if (proxyJson.body === null || proxyJson.body === undefined)
            setRespBody('');
          else if (typeof proxyJson.body === 'object')
            setRespBody(JSON.stringify(proxyJson.body, null, 2));
          else {
            // try to parse as JSON string
            try {
              const parsed = JSON.parse(String(proxyJson.body));
              setRespBody(JSON.stringify(parsed, null, 2));
            } catch {
              setRespBody(String(proxyJson.body ?? ''));
            }
          }
        } catch (e) {
          setRespBody(String(proxyJson.body ?? ''));
        }

        setRespTab('body');

        setHistory((h) =>
          [
            {
              id: Date.now(),
              method,
              url: finalUrl,
              status: code,
              time:
                typeof proxyJson.timeMs === 'number'
                  ? proxyJson.timeMs
                  : Math.round(t1 - t0)
            },
            ...h
          ].slice(0, 25)
        );
      } else {
        // fallback: treat proxy response as plain text
        const txt = await proxyRes.text();
        setStatus(`${proxyRes.status} ${proxyRes.statusText}`);
        setRespHeaders([]);
        setRespBody(txt);
        setRespTab('body');
        setHistory((h) =>
          [
            {
              id: Date.now(),
              method,
              url: finalUrl,
              status: proxyRes.status,
              time: Math.round(t1 - t0)
            },
            ...h
          ].slice(0, 25)
        );
      }
    } catch (e) {
      console.error('Request failed:', e);
      setStatus('Network error');
      setRespBody(
        `Error: ${e.message || String(e)}\n\nDetails: ${
          e.stack || 'No stack trace available'
        }`
      );
      setRespTab('body');
      import('../lib/alert').then((m) =>
        m.default('Request failed: ' + (e.message || e), 'error')
      );
    } finally {
      setLoading(false);
    }
  };

  // Save request modal state
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveCollectionId, setSaveCollectionId] = useState('');
  const [saveNewCollectionName, setSaveNewCollectionName] = useState('');
  const [saveFolderName, setSaveFolderName] = useState('');

  const openSave = (prefColId) => {
    setSaveCollectionId(
      prefColId || (collections[0] ? collections[0].id : '__new')
    );
    setSaveNewCollectionName('');
    setSaveFolderName('');
    setSaveOpen(true);
  };

  const handleSaveRequest = async () => {
    const token = localStorage.getItem('token');
    const authHeaders = { 'Content-Type': 'application/json' };
    if (token) authHeaders['Authorization'] = `Bearer ${token}`;

    try {
      // Determine or create collection on server
      let targetColId = saveCollectionId;
      if (saveCollectionId === '__new') {
        const title = saveNewCollectionName || 'Untitled';
        const res = await fetch(
          `${API_BASE}/api/paas/collection/userCollection`,
          {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ title, description: '' })
          }
        );
        const j = await res.json();
        if (!res.ok)
          throw new Error(
            j.message || j.error || 'Failed to create collection'
          );
        targetColId =
          j.data && (j.data.id || j.data.col_id || j.data.cid)
            ? j.data.id || j.data.col_id || j.data.cid
            : targetColId;

        // add to local collections
        setCollections((prev) => [
          { id: targetColId, name: title, requests: [], folders: [] },
          ...prev
        ]);
      }

      // Ensure folder exists (if specified) — try to match existing folder by name
      let folderId = null;
      if (saveFolderName && saveFolderName.trim()) {
        const col = collections.find((c) => c.id === targetColId);
        const existing =
          col && Array.isArray(col.folders)
            ? col.folders.find((f) => f.name === saveFolderName)
            : null;
        if (existing) folderId = existing.id;
        else {
          // create folder on server
          try {
            const fr = await fetch(`${API_BASE}/api/paas/folder/create`, {
              method: 'POST',
              headers: authHeaders,
              body: JSON.stringify({
                col_id: targetColId,
                name: saveFolderName,
                description: ''
              })
            });
            const fj = await fr.json();
            if (fr.ok && fj.data) {
              folderId = fj.data.id || fj.data._id || fj.data.folder_id || null;
              // update local collection folders
              setCollections((prev) =>
                prev.map((c) =>
                  c.id === targetColId
                    ? {
                        ...c,
                        folders: [
                          ...(c.folders || []),
                          { id: folderId, name: saveFolderName }
                        ]
                      }
                    : c
                )
              );
            }
          } catch (e) {
            // ignore folder creation errors
          }
        }
      }

      // Build request headers object from the component state `headers`
      const requestHeadersObj = {};
      const stateHeaders = headers; // `headers` is the component state array
      for (const h of stateHeaders) {
        if (h && h.k?.trim?.()) requestHeadersObj[h.k] = h.v ?? '';
      }

      // response status parse
      let parsedStatus = null;
      let statusMessage = '';
      if (status) {
        const parts = String(status).split(' ');
        const num = parseInt(parts[0], 10);
        if (!Number.isNaN(num)) parsedStatus = num;
        statusMessage = parts.slice(1).join(' ');
      }

      const savePayload = {
        f_id: folderId,
        url: finalUrl,
        headers: requestHeadersObj,
        body: rawBody,
        method,
        response: respBody,
        res_status: parsedStatus,
        statusmessage: statusMessage
      };

      console.log('Saving API with payload:', savePayload);

      const saveRes = await fetch(`${API_BASE}/api/paas/url/save`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(savePayload)
      });
      const saveJson = await saveRes.json();
      if (!saveRes.ok)
        throw new Error(
          saveJson.message || saveJson.error || 'Failed to save API'
        );

      // update local UI: add saved API to collection.requests
      const saved = saveJson.data;
      const reqLabel = `${method} ${finalUrl}`;
      const reqObj = {
        id: saved.id || saved._id || crypto.randomUUID(),
        name: reqLabel,
        folder: folderId
      };
      setCollections((prev) =>
        prev.map((c) =>
          c.id === targetColId
            ? { ...c, requests: [...(c.requests || []), reqObj] }
            : c
        )
      );

      import('../lib/alert').then((m) =>
        m.default('Saved request to backend', 'success')
      );
      setSaveOpen(false);
    } catch (err) {
      import('../lib/alert').then((m) =>
        m.default('Save failed: ' + (err.message || err), 'error')
      );
    }
  };

  const addRow = (set) => set((prev) => [...prev, { k: '', v: '' }]);
  const updateRow = (set, i, field, val) =>
    set((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [field]: val } : row))
    );
  const removeRow = (set, i) =>
    set((prev) => prev.filter((_, idx) => idx !== i));

  const methodBadge = (m) => {
    const map = {
      GET: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
      POST: 'bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
      PUT: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
      PATCH:
        'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
      DELETE:
        'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
      HEAD: 'bg-neutral-200 text-neutral-800 dark:bg-neutral-500/20 dark:text-neutral-300',
      OPTIONS:
        'bg-neutral-200 text-neutral-800 dark:bg-neutral-500/20 dark:text-neutral-300'
    };
    return (
      map[m] ||
      'bg-neutral-200 text-neutral-800 dark:bg-neutral-500/20 dark:text-neutral-300'
    );
  };

  return (
    <div className="pt-16 h-[calc(100vh-4rem)] flex flex-col bg-white text-neutral-800 dark:bg-[#0b0f14] dark:text-neutral-200">
      {/* Top app chrome */}
      <div className="h-12 flex items-center gap-3 px-3 border-b border-neutral-200 bg-white dark:border-[#1b2330] dark:bg-[#0e131a]">
        <button
          onClick={handleHamburger}
          className="icon-btn light"
          aria-label="Toggle sidebar"
        >
          ☰
        </button>
        <div className="text-sm text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
          <select
            value={activeWorkspace}
            onChange={(e) => {
              setActiveWorkspace(e.target.value);
              try {
                localStorage.setItem('activeWorkspace', e.target.value);
              } catch {}
            }}
            className="text-sm bg-white dark:bg-transparent border border-neutral-200 rounded px-2 h-8"
          >
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
          <button
            onClick={addWorkspace}
            title="Add workspace"
            className="h-8 w-8 inline-flex items-center justify-center rounded bg-white border border-neutral-300 text-sm"
          >
            +
          </button>
        </div>
        <div className="flex-1" />
        <input
          className="h-8 w-80 rounded bg-white border border-neutral-300 px-3 text-sm dark:bg-[#0b0f14] dark:border-[#1b2330] dark:text-neutral-200"
          placeholder="Search"
        />
        <button
          onClick={sendRequest}
          className="h-8 px-4 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm disabled:opacity-60"
          disabled={loading}
        >
          {loading ? 'Sending…' : 'Send'}
        </button>
        <button
          onClick={async () => {
            const title = window.prompt(
              'Environment title (for this collection)'
            );
            if (!title) return;
            handleCreateEnv(title);
          }}
          className="ml-2 h-8 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
        >
          Create Env
        </button>
        <button
          onClick={() => openEnvManager()}
          className="ml-2 h-8 px-3 rounded bg-sky-600 hover:bg-sky-500 text-white text-sm"
        >
          Manage Env
        </button>
        <button
          onClick={() => openSave()}
          className="ml-2 h-8 px-3 rounded bg-yellow-600 hover:bg-yellow-500 text-white text-sm"
        >
          Save
        </button>
        <div className="w-px h-6 bg-neutral-200 dark:bg-[#1b2330]" />
        <button className="icon-btn light" aria-label="settings">
          ⚙︎
        </button>
      </div>

      {/* Main row */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left rail + mobile overlay */}
        {leftOpen && (
          <>
            <div
              onClick={() => setMobileOverlay(false)}
              className={`lg:hidden fixed inset-0 z-40 bg-black/20 transition-opacity ${
                mobileOverlay ? 'opacity-100 visible' : 'opacity-0 invisible'
              }`}
              aria-hidden
            />
            <aside
              style={{ width: left.width }}
              className={`z-50 lg:z-auto shrink-0 border-r border-neutral-200 bg-neutral-50 dark:border-[#1b2330] dark:bg-[#0e131a] flex flex-col
                ${
                  mobileOverlay
                    ? 'fixed left-0 top-16 h-[calc(100vh-4rem)] shadow-xl w-[min(86vw,320px)] translate-x-0 transition-transform'
                    : 'relative'
                }
              `}
              aria-label="Collections sidebar"
            >
              {/* Header row: title + add + root menu */}
              <div className="h-10 flex items-center justify-between px-3 border-b border-neutral-200 dark:border-[#1b2330]">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-700 dark:text-neutral-300">
                    Collections
                  </span>
                  <button
                    onClick={addCollection}
                    className="h-6 w-6 inline-flex items-center justify-center rounded border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-100 text-sm dark:bg-[#141b24] dark:border-[#1b2330] dark:text-neutral-300"
                    aria-label="New collection"
                  >
                    +
                  </button>
                </div>
                <div className="relative" ref={rootMenuRef}>
                  <button
                    onClick={() => setRootMenuOpen((v) => !v)}
                    aria-label="Collections menu"
                    className="h-7 w-7 inline-flex items-center justify-center rounded hover:bg-neutral-200/60 text-neutral-600 dark:hover:bg-slate-800/60 dark:text-neutral-300"
                  >
                    <Dots />
                  </button>
                  {rootMenuOpen && (
                    <MenuCard onClose={() => setRootMenuOpen(false)}>
                      <MenuItem
                        onClick={() => {
                          setRootMenuOpen(false);
                          addCollection();
                        }}
                      >
                        Add collection
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem onClick={() => alert('Import (stub)')}>
                        Import
                      </MenuItem>
                      <MenuItem onClick={() => alert('Export (stub)')}>
                        Export
                      </MenuItem>
                    </MenuCard>
                  )}
                </div>
              </div>

              {/* Collections list */}
              <div className="flex-1 overflow-auto px-2 py-2 space-y-3">
                {displayedCollections.length === 0 ? (
                  <div className="text-xs text-neutral-500 px-2">
                    No collections yet. Use + to create one.
                  </div>
                ) : (
                  displayedCollections.map((col) => (
                    <div key={col.id} className="group">
                      <div className="flex items-center justify-between px-2">
                        <div className="text-[11px] uppercase tracking-wide text-neutral-500">
                          {col.name}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => openSave(col.id)}
                            className="text-[11px] px-1.5 py-0.5 rounded border border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-[#1b2330] dark:bg-[#141b24] dark:text-neutral-300"
                          >
                            + Request
                          </button>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                setColMenu({
                                  id: col.id,
                                  x: rect.left,
                                  y: rect.bottom
                                });
                              }}
                              aria-label="Collection menu"
                              className="h-6 w-6 inline-flex items-center justify-center rounded hover:bg-neutral-200/60 text-neutral-600 dark:hover:bg-slate-800/60 dark:text-neutral-300"
                            >
                              <Dots />
                            </button>
                            {colMenu?.id === col.id && (
                              <MenuCard
                                refEl={colMenuRef}
                                style={{ minWidth: 200 }}
                              >
                                <MenuItem
                                  onClick={() => {
                                    setColMenu(null);
                                    openSave(col.id);
                                  }}
                                >
                                  Add request
                                </MenuItem>
                                <MenuItem
                                  onClick={async () => {
                                    setColMenu(null);
                                    const name = window.prompt('Folder name');
                                    if (!name) return;
                                    try {
                                      const token =
                                        localStorage.getItem('token');
                                      const headers = {
                                        'Content-Type': 'application/json'
                                      };
                                      if (token)
                                        headers[
                                          'Authorization'
                                        ] = `Bearer ${token}`;
                                      const fr = await fetch(
                                        `${API_BASE}/api/paas/folder/create`,
                                        {
                                          method: 'POST',
                                          headers,
                                          body: JSON.stringify({
                                            col_id: col.id,
                                            name,
                                            description: ''
                                          })
                                        }
                                      );
                                      const fj = await fr.json();
                                      if (!fr.ok)
                                        throw new Error(fj.message || 'Failed');
                                      // update local
                                      setCollections((prev) =>
                                        prev.map((c) =>
                                          c.id === col.id
                                            ? {
                                                ...c,
                                                folders: [
                                                  ...(c.folders || []),
                                                  {
                                                    id:
                                                      (fj.data &&
                                                        (fj.data.id ||
                                                          fj.data._id)) ||
                                                      crypto.randomUUID(),
                                                    name
                                                  }
                                                ]
                                              }
                                            : c
                                        )
                                      );
                                      import('../lib/alert').then((m) =>
                                        m.default('Folder created', 'success')
                                      );
                                    } catch (err) {
                                      import('../lib/alert').then((m) =>
                                        m.default(
                                          'Create folder failed: ' +
                                            (err.message || err),
                                          'error'
                                        )
                                      );
                                    }
                                  }}
                                >
                                  Add folder
                                </MenuItem>
                                <MenuDivider />
                                <MenuItem
                                  onClick={() => {
                                    setColMenu(null);
                                    alert('Run (stub)');
                                  }}
                                >
                                  Run
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setColMenu(null);
                                    alert('Share (stub)');
                                  }}
                                >
                                  Share
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setColMenu(null);
                                    alert('Copy link (stub)');
                                  }}
                                >
                                  Copy link
                                </MenuItem>
                                <MenuDivider />
                                <MenuItem
                                  onClick={() => {
                                    setColMenu(null);
                                    alert('Ask AI (stub)');
                                  }}
                                >
                                  Ask AI
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setColMenu(null);
                                    alert('Move (stub)');
                                  }}
                                >
                                  Move
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setColMenu(null);
                                    alert('Fork (stub)');
                                  }}
                                >
                                  Fork{' '}
                                  <span className="ml-auto text-xs text-neutral-400">
                                    Ctrl+Alt+F
                                  </span>
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setColMenu(null);
                                    renameCollection(col.id);
                                  }}
                                >
                                  Rename{' '}
                                  <span className="ml-auto text-xs text-neutral-400">
                                    Ctrl+E
                                  </span>
                                </MenuItem>
                                <MenuItem
                                  onClick={() => {
                                    setColMenu(null);
                                    duplicateCollection(col.id);
                                  }}
                                >
                                  Duplicate{' '}
                                  <span className="ml-auto text-xs text-neutral-400">
                                    Ctrl+D
                                  </span>
                                </MenuItem>
                                <MenuItem
                                  destructive
                                  onClick={() => {
                                    setColMenu(null);
                                    deleteCollection(col.id);
                                  }}
                                >
                                  Delete{' '}
                                  <span className="ml-auto text-xs text-neutral-400">
                                    Del
                                  </span>
                                </MenuItem>
                              </MenuCard>
                            )}
                          </div>
                        </div>
                      </div>
                      <ul className="mt-2">
                        {Array.isArray(col.folders) &&
                          col.folders.length > 0 && (
                            <div className="mb-2">
                              {col.folders.map((f) => (
                                <div key={f.id} className="mb-1">
                                  <div
                                    onClick={() => toggleFolder(f.id)}
                                    className="px-2 py-1 rounded text-xs text-neutral-600 dark:text-neutral-400 flex items-center gap-2 hover:bg-neutral-100 dark:hover:bg-[#0f1622] cursor-pointer"
                                  >
                                    <span className="text-[11px]">
                                      {collapsedFolders[f.id] ? '▶' : '▼'}
                                    </span>
                                    <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#141b24]">
                                      📁
                                    </span>
                                    <span className="truncate">{f.name}</span>
                                  </div>
                                  {!collapsedFolders[f.id] &&
                                    f.apis &&
                                    f.apis.length > 0 && (
                                      <div className="ml-4 mt-1 space-y-1">
                                        {f.apis.map((api) => (
                                          <div
                                            key={api.id}
                                            onClick={() =>
                                              onSelectRequest({
                                                id: api.id,
                                                name: `${api.method || 'GET'} ${
                                                  api.url || ''
                                                }`,
                                                method: api.method,
                                                url: api.url
                                              })
                                            }
                                            className="px-2 py-1.5 rounded hover:bg-neutral-100 cursor-pointer text-xs flex items-center gap-2 dark:hover:bg-[#0f1622]"
                                          >
                                            <span
                                              className={`text-[10px] px-1.5 py-0.5 rounded ${methodBadge(
                                                (
                                                  api.method || 'GET'
                                                ).toUpperCase()
                                              )}`}
                                            >
                                              {(
                                                api.method || 'GET'
                                              ).toUpperCase()}
                                            </span>
                                            <span className="truncate">
                                              {api.url || 'Untitled API'}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                </div>
                              ))}
                            </div>
                          )}
                        {col.requests.map((req) => (
                          <li
                            key={req.id}
                            onClick={() => onSelectRequest(req)}
                            className="px-2 py-1.5 rounded hover:bg-neutral-100 cursor-pointer text-xs flex items-center gap-2 dark:hover:bg-[#0f1622]"
                          >
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded ${methodBadge(
                                (req.name.split(' ')[0] || 'GET').toUpperCase()
                              )}`}
                            >
                              {(req.name.split(' ')[0] || 'GET').toUpperCase()}
                            </span>
                            <span className="truncate">
                              {req.name.replace(/^\w+\s+/, '')}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>

              <div className="h-7 border-t border-neutral-200 text-[11px] text-neutral-500 flex items-center px-3 dark:border-[#1b2330] dark:text-neutral-400">
                Console
              </div>
            </aside>
          </>
        )}

        {/* Handle L */}
        <div
          onMouseDown={left.handleMouseDown}
          className="w-1 cursor-col-resize bg-transparent hover:bg-indigo-500/30"
          aria-hidden
        />

        {/* Center request builder */}
        <section className="flex-1 min-w-0 flex flex-col bg-white dark:bg-[#0b0f14]">
          {/* URL strip */}
          <div className="h-10 flex items-center gap-2 px-3 border-b border-neutral-200 bg-white dark:border-[#1b2330] dark:bg-[#0e131a]">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="h-8 px-2 rounded bg-white border border-neutral-300 text-sm text-neutral-800 dark:bg-[#141b24] dark:border-[#1b2330] dark:text-neutral-200"
            >
              {['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map(
                (m) => (
                  <option key={m}>{m}</option>
                )
              )}
            </select>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1 h-8 rounded bg-white border border-neutral-300 px-3 text-sm text-neutral-800 placeholder:text-neutral-400 dark:bg-[#0b0f14] dark:border-[#1b2330] dark:text-neutral-200"
              placeholder="https://api.example.com/resource"
            />
            <button
              onClick={sendRequest}
              className="h-8 px-4 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-sm disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Sending…' : 'Send'}
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-neutral-200 bg-neutral-50 px-2 dark:border-[#1b2330] dark:bg-[#0e131a]">
            {['params', 'headers', 'body'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveReqTab(t)}
                className={`h-9 px-3 text-[13px] border-b-2 ${
                  activeReqTab === t
                    ? 'border-indigo-500 text-neutral-900 dark:text-neutral-100'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
            <div className="ml-auto text-[11px] text-neutral-500 truncate max-w-[50%]">
              Final: <span className="font-mono">{finalUrl}</span>
            </div>
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto p-3">
            {activeReqTab === 'params' && (
              <KeyValueEditor
                rows={params}
                onAdd={() => addRow(setParams)}
                onUpdate={(i, f, v) => updateRow(setParams, i, f, v)}
                onRemove={(i) => removeRow(setParams, i)}
                labelK="Key"
                labelV="Value"
              />
            )}
            {activeReqTab === 'headers' && (
              <KeyValueEditor
                rows={headers}
                onAdd={() => addRow(setHeaders)}
                onUpdate={(i, f, v) => updateRow(setHeaders, i, f, v)}
                onRemove={(i) => removeRow(setHeaders, i)}
                labelK="Header"
                labelV="Value"
              />
            )}
            {activeReqTab === 'body' && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {['json', 'text', 'form'].map((bt) => (
                    <button
                      key={bt}
                      onClick={() => setBodyType(bt)}
                      className={`text-[11px] px-2 py-1 rounded border ${
                        bodyType === bt
                          ? 'border-indigo-500 text-neutral-900 dark:text-neutral-100'
                          : 'border-neutral-300 text-neutral-600 dark:border-[#1b2330] dark:text-neutral-400'
                      }`}
                    >
                      {bt.toUpperCase()}
                    </button>
                  ))}
                </div>
                <textarea
                  className="w-full h-64 rounded border border-neutral-300 bg-neutral-50 p-3 font-mono text-sm text-neutral-800 dark:border-[#1b2330] dark:bg-[#0e131a] dark:text-neutral-200"
                  value={rawBody}
                  onChange={(e) => setRawBody(e.target.value)}
                  spellCheck="false"
                />
              </div>
            )}
          </div>
        </section>

        {/* Handle R */}
        <div
          onMouseDown={right.handleMouseDown}
          className="w-1 cursor-col-resize bg-transparent hover:bg-indigo-500/30"
          aria-hidden
        />

        {/* Right response viewer */}
        <aside
          style={{ width: right.width }}
          className="shrink-0 border-l border-neutral-200 bg-neutral-50 flex flex-col dark:border-[#1b2330] dark:bg-[#0e131a]"
        >
          <div className="h-10 flex items-center justify-between px-3 border-b border-neutral-200 dark:border-[#1b2330] bg-white dark:bg-transparent">
            <div className="text-sm">
              <span className="font-medium text-neutral-800 dark:text-neutral-100">
                Response
              </span>
              <span className="ml-2 text-neutral-500">{status || '—'}</span>
            </div>
            <div className="text-[11px] text-neutral-500">
              {timeMs != null ? `${timeMs} ms` : ''}
            </div>
          </div>

          <div className="flex items-center gap-2 border-b border-neutral-200 px-2 bg-neutral-50 dark:border-[#1b2330] dark:bg-[#0e131a]">
            {['body', 'headers', 'preview'].map((t) => (
              <button
                key={t}
                onClick={() => setRespTab(t)}
                className={`h-9 px-3 text-[13px] border-b-2 ${
                  respTab === t
                    ? 'border-indigo-500 text-neutral-900 dark:text-neutral-100'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
                }`}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
            <div className="ml-auto text-[12px] text-neutral-500" />
          </div>

          <div className="flex-1 overflow-auto p-3">
            {respTab === 'body' &&
              (respBody ? (
                <pre className="bg-neutral-900 text-neutral-100 p-3 rounded text-sm leading-6 overflow-auto dark:bg-[#0b0f14] dark:border-[#1b2330] border border-neutral-200">
                  {respBody}
                </pre>
              ) : (
                <EmptyStateLight />
              ))}
            {respTab === 'headers' && (
              <div className="space-y-2">
                {respHeaders.length ? (
                  respHeaders.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="min-w-[160px] font-mono text-neutral-500 dark:text-neutral-400">
                        {h.k}
                      </span>
                      <span className="font-mono text-neutral-800 dark:text-neutral-200">
                        {h.v}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-neutral-500 text-sm">No headers</div>
                )}
              </div>
            )}
            {respTab === 'preview' && (
              <iframe
                title="preview"
                className="w-full h-full bg-white rounded border border-neutral-200 dark:bg-slate-900 dark:border-[#1b2330]"
                srcDoc={
                  respBody.startsWith('<')
                    ? respBody
                    : `<pre style="padding:12px;font:12px/1.6 monospace">${escapeHtml(
                        respBody || 'No preview'
                      )}</pre>`
                }
              />
            )}
          </div>

          {/* Recent requests removed so Response takes full right column */}
        </aside>
      </div>
      {/* Save modal */}
      {saveOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setSaveOpen(false)}
          />
          <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(520px,92%)] bg-white dark:bg-[#0b0f14] rounded shadow-xl border border-neutral-200 dark:border-[#1b2330] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-medium">Save Request</div>
              <button
                onClick={() => setSaveOpen(false)}
                className="text-sm text-neutral-500"
              >
                Close
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-neutral-500 mb-1">
                  Choose collection
                </div>
                <select
                  className="w-full h-9 rounded border border-neutral-300 px-2 bg-white dark:bg-[#0e131a]"
                  value={saveCollectionId}
                  onChange={(e) => setSaveCollectionId(e.target.value)}
                >
                  <option value="__new">Create new collection…</option>
                  {collections.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>
              {saveCollectionId === '__new' && (
                <div>
                  <div className="text-xs text-neutral-500 mb-1">
                    New collection name
                  </div>
                  <input
                    className="w-full h-9 rounded border border-neutral-300 px-2 bg-white dark:bg-[#0e131a]"
                    value={saveNewCollectionName}
                    onChange={(e) => setSaveNewCollectionName(e.target.value)}
                  />
                </div>
              )}
              <div>
                <div className="text-xs text-neutral-500 mb-1">
                  Folder (optional)
                </div>
                <input
                  className="w-full h-9 rounded border border-neutral-300 px-2 bg-white dark:bg-[#0e131a]"
                  placeholder="Folder name"
                  value={saveFolderName}
                  onChange={(e) => setSaveFolderName(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setSaveOpen(false)}
                  className="h-8 px-3 rounded bg-white border border-neutral-300 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRequest}
                  className="h-8 px-3 rounded bg-indigo-600 text-white text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      {/* Env manager modal */}
      {envModalOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setEnvModalOpen(false)}
          />
          <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(720px,96%)] bg-white dark:bg-[#0b0f14] rounded shadow-xl border border-neutral-200 dark:border-[#1b2330] p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-medium">Manage Environments</div>
              <button
                onClick={() => setEnvModalOpen(false)}
                className="text-sm text-neutral-500"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-xs text-neutral-500 mb-1">
                  Environments
                </div>
                <div className="space-y-2 max-h-[280px] overflow-auto">
                  {envs.length === 0 && (
                    <div className="text-sm text-neutral-500">No envs yet</div>
                  )}
                  {envs.map((e) => (
                    <div
                      key={e.id}
                      className={`p-2 rounded hover:bg-neutral-100 cursor-pointer ${
                        activeEnvId === e.id ? 'bg-neutral-100' : ''
                      }`}
                      onClick={() => {
                        setActiveEnvId(e.id);
                        fetchEnvVars(e.id);
                      }}
                    >
                      <div className="text-sm font-medium">{e.title}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <button
                    onClick={() => {
                      const t = window.prompt('Environment title');
                      if (t) handleCreateEnv(t);
                    }}
                    className="h-8 px-3 rounded bg-emerald-600 text-white text-sm"
                  >
                    Create
                  </button>
                </div>
              </div>

              <div className="col-span-2">
                <div className="text-xs text-neutral-500 mb-1">
                  Variables for{' '}
                  {envs.find((x) => x.id === activeEnvId)?.title || '—'}
                </div>
                <div className="space-y-2 max-h-[220px] overflow-auto mb-3">
                  {envVariables.length === 0 && (
                    <div className="text-sm text-neutral-500">No variables</div>
                  )}
                  {envVariables.map((v) => (
                    <div
                      key={v.id || v._id}
                      className="flex items-center gap-2 p-2 rounded border border-neutral-200 dark:border-[#1b2330]"
                    >
                      <div className="min-w-[120px] font-mono text-sm">
                        {v.key}
                      </div>
                      <div className="flex-1 font-mono text-sm truncate">
                        {v.value}
                      </div>
                      <button
                        className="text-sm px-2 py-1 rounded bg-sky-600 text-white"
                        onClick={() => insertEnvPlaceholderIntoUrl(v.key)}
                      >
                        Insert
                      </button>
                      <button
                        className="text-sm px-2 py-1 rounded bg-amber-500 text-white"
                        onClick={() => handleUpdateEnvVar(v)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-sm px-2 py-1 rounded bg-rose-600 text-white"
                        onClick={() => handleDeleteEnvVar(v)}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    value={newEnvKey}
                    onChange={(e) => setNewEnvKey(e.target.value)}
                    placeholder="Key"
                    className="h-9 px-2 rounded border border-neutral-300"
                  />
                  <input
                    value={newEnvValue}
                    onChange={(e) => setNewEnvValue(e.target.value)}
                    placeholder="Value"
                    className="h-9 px-2 rounded border border-neutral-300 flex-1"
                  />
                  <button
                    onClick={handleAddEnvVar}
                    className="h-9 px-3 rounded bg-indigo-600 text-white"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
/* Menu UI primitives */
function MenuCard({ children, onClose, style, refEl }) {
  const innerRef = useRef(null);
  useClickOutside(innerRef, () => onClose?.());
  return (
    <div
      ref={innerRef}
      className="absolute right-0 mt-1 z-50 rounded-md border border-neutral-200 bg-white shadow-xl text-sm py-1 min-w-[180px] dark:border-[#1b2330] dark:bg-[#0e131a]"
      style={style}
      role="menu"
    >
      {children}
    </div>
  );
}
function MenuDivider() {
  return <div className="my-1 h-px bg-neutral-200 dark:bg-[#1b2330]" />;
}
function MenuItem({ children, onClick, destructive }) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className={`w-full text-left px-3 py-2 hover:bg-neutral-100 dark:hover:bg-slate-800/60 flex items-center ${
        destructive
          ? 'text-rose-600 dark:text-rose-400'
          : 'text-neutral-800 dark:text-neutral-200'
      }`}
    >
      {children}
    </button>
  );
}

/* Forms/editors */
function KeyValueEditor({
  rows,
  onAdd,
  onUpdate,
  onRemove,
  labelK = 'Key',
  labelV = 'Value'
}) {
  return (
    <div>
      <div className="grid grid-cols-12 gap-2 text-[11px] text-neutral-500 mb-1 dark:text-neutral-400">
        <div className="col-span-5">{labelK}</div>
        <div className="col-span-6">{labelV}</div>
        <div className="col-span-1"></div>
      </div>
      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="grid grid-cols-12 gap-2">
            <input
              className="col-span-5 h-8 rounded bg-white border border-neutral-300 px-2 text-sm text-neutral-800 placeholder:text-neutral-400 dark:bg-[#0e131a] dark:border-[#1b2330] dark:text-neutral-200"
              value={r.k}
              onChange={(e) => onUpdate(i, 'k', e.target.value)}
              placeholder={labelK}
            />
            <input
              className="col-span-6 h-8 rounded bg-white border border-neutral-300 px-2 text-sm text-neutral-800 placeholder:text-neutral-400 dark:bg-[#0e131a] dark:border-[#1b2330] dark:text-neutral-200"
              value={r.v}
              onChange={(e) => onUpdate(i, 'v', e.target.value)}
              placeholder={labelV}
            />
            <button
              onClick={() => onRemove(i)}
              className="col-span-1 h-8 rounded bg-white border border-neutral-300 text-sm text-neutral-700 dark:bg-[#141b24] dark:border-[#1b2330] dark:text-neutral-300"
            >
              −
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={onAdd}
        className="mt-3 text-sm px-3 py-1.5 rounded bg-white border border-neutral-300 text-neutral-700 dark:bg-[#141b24] dark:border-[#1b2330] dark:text-neutral-300"
      >
        Add
      </button>
    </div>
  );
}

function EmptyStateLight() {
  return (
    <div className="h-full min-h-[260px] rounded border border-neutral-200 bg-white flex flex-col items-center justify-center text-neutral-500 dark:border-[#1b2330] dark:bg-[#0b0f14] dark:text-neutral-400">
      <div className="w-16 h-16 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center">
        🚀
      </div>
      <div className="mt-3 text-sm">Click Send to get a response</div>
    </div>
  );
}

/* Utils */
function escapeHtml(s) {
  return s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[
        c
      ])
  );
}
