import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/paas/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Signup failed');
      if (json.token) {
        localStorage.setItem('token', json.token);
      }
      // if API returned user object, store and notify app
      if (json.user) {
        try {
          localStorage.setItem('user', JSON.stringify(json.user));
        } catch (e) {}
        try {
          window.dispatchEvent(
            new CustomEvent('authChanged', { detail: { user: json.user } })
          );
        } catch (e) {}
      }
      import('../lib/alert').then((m) =>
        m.default('Signup successful', 'success')
      );
      navigate('/login');
    } catch (err) {
      import('../lib/alert').then((m) =>
        m.default('Error: ' + err.message, 'error')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <Link
        to="/"
        className="text-sm text-neutral-700 dark:text-neutral-200 hover:underline mb-4 inline-block"
      >
        ← Back
      </Link>
      <h1 className="text-2xl font-semibold mb-4">Create an account</h1>
      <form
        onSubmit={onSubmit}
        className="space-y-4 bg-card-glass p-6 rounded-lg"
      >
        <label className="block">
          <span className="text-sm text-muted block mb-1">Full name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            className="w-full px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-transparent"
            placeholder="Your name"
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted block mb-1">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-transparent"
            placeholder="you@company.com"
          />
        </label>
        <label className="block">
          <span className="text-sm text-muted block mb-1">Password</span>
          <div className="relative">
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              className="w-full px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-transparent"
              placeholder="••••••••"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-600 dark:text-neutral-300"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex justify-center rounded-md bg-brand-600 text-white px-4 py-2"
        >
          {loading ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </section>
  );
}
