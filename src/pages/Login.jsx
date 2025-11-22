import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <Link to="/" className="text-sm text-neutral-700 dark:text-neutral-200 hover:underline mb-4 inline-block">← Back</Link>
      <h1 className="text-2xl font-semibold mb-4">Sign in to your account</h1>
      <form className="space-y-4 bg-card-glass p-6 rounded-lg">
        <label className="block">
          <span className="text-sm text-muted block mb-1">Email</span>
          <input type="email" className="w-full px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-transparent" placeholder="you@company.com" />
        </label>
        <label className="block">
          <span className="text-sm text-muted block mb-1">Password</span>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="w-full px-3 py-2 rounded-md border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-transparent"
              placeholder="••••••••"
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(s => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-neutral-600 dark:text-neutral-300"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M4.03 3.97a.75.75 0 10-1.06 1.06l1.12 1.12A9.72 9.72 0 001.5 10c2.5 4 6.5 6 10.5 6 1.49 0 2.86-.28 4.01-.78l1.01 1.01a.75.75 0 001.06-1.06L4.03 3.97zM10 6a4 4 0 014 4c0 .64-.17 1.24-.46 1.76l-1.5-1.5A1.5 1.5 0 0010 9.5V6z"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 3C6 3 2.5 5.5 1 9c1.5 3.5 5 6 9 6s7.5-2.5 9-6c-1.5-3.5-5-6-9-6zm0 10a4 4 0 110-8 4 4 0 010 8z"/></svg>
              )}
            </button>
          </div>
        </label>
        <div className="flex items-center justify-between">
          <label className="text-sm">
            <input type="checkbox" className="mr-2" /> Remember me
          </label>
          <a href="#" className="text-sm text-brand-600 hover:underline">Forgot password?</a>
        </div>
        <button type="submit" className="w-full inline-flex justify-center rounded-md bg-brand-600 text-white px-4 py-2">Sign in</button>
      </form>
    </section>
  );
}
