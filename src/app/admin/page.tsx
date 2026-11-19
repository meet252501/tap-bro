'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store,
  Phone,
  Mail,
  KeyRound,
  LogIn,
  PlusCircle,
  Sparkles,
  ShieldCheck,
  Check,
  ArrowRight,
  QrCode,
  Radio,
  Send,
} from 'lucide-react';

export default function AdminPortalPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // Register form
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPin, setRegPin] = useState('');
  const [regCuisine, setRegCuisine] = useState('');
  const [regGoogleUrl, setRegGoogleUrl] = useState('');
  const [regError, setRegError] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: loginPhone, pinOrId: loginPin }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(`admin_${data.restaurant.slug}`, loginPin);
        router.push(`/admin/${data.restaurant.slug}`);
      } else {
        setLoginError(data.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Network error during login.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);
    setRegLoading(true);

    try {
      const res = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          phone: regPhone,
          email: regEmail,
          adminPin: regPin,
          cuisine: regCuisine || 'Multi-Cuisine',
          googleReviewUrl: regGoogleUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(`admin_${data.restaurant.slug}`, regPin);
        router.push(`/admin/${data.restaurant.slug}?new=1`);
      } else {
        setRegError(data.error || 'Registration failed.');
      }
    } catch (err: any) {
      setRegError(err.message || 'Network error during registration.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-page flex flex-col justify-center items-center p-4 selection:bg-amber-400 selection:text-page relative">
      <div className="ambient-bg pointer-events-none fixed inset-0 z-0" />

      <div className="relative z-10 w-full max-w-md">
        {/* Branding Banner */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-xl shadow-amber-500/20 mb-3">
            <Radio className="h-7 w-7 text-page" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Tap-Bro Partner Hub
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">
            Tabletop NFC & QR AI Review Assistant • Multi-Restaurant Portal
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 rounded-xl bg-surface-card border border-border p-1 mb-5">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              mode === 'login'
                ? 'bg-amber-400 text-page shadow-sm'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Restaurant Login</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              mode === 'register'
                ? 'bg-amber-400 text-page shadow-sm'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>Register Business</span>
          </button>
        </div>

        {/* Login Form */}
        {mode === 'login' && (
          <div className="rounded-2xl border border-border bg-surface-card p-6 shadow-2xl space-y-5 animate-fade-in">
            <div>
              <h2 className="text-base font-bold text-white">Access Your Restaurant Hub</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Log in with your registered phone number and unique PIN or Restaurant ID.
              </p>
            </div>

            {loginError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Owner Phone Number
                </label>
                <div className="relative">
                  <Phone className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 py-3 text-base sm:text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Admin PIN or Restaurant ID
                </label>
                <div className="relative">
                  <KeyRound className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    placeholder="e.g. 1234 or REST_SAFFRON_01"
                    className="w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 py-3 text-base sm:text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loginLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 px-4 font-bold text-page shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 transition active:scale-[0.98] disabled:opacity-50 text-sm"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{loginLoading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                </button>
              </div>

              <div className="rounded-xl bg-surface-raised/70 border border-border/80 p-3 text-[11px] text-zinc-400 space-y-1">
                <span className="font-semibold text-amber-400 block">Sample Demo Account:</span>
                <div>Phone: <code className="text-white font-mono">9876543210</code> | PIN: <code className="text-white font-mono">1234</code></div>
              </div>
            </form>
          </div>
        )}

        {/* Register New Restaurant Form */}
        {mode === 'register' && (
          <div className="rounded-2xl border border-border bg-surface-card p-6 shadow-2xl space-y-5 animate-fade-in">
            <div>
              <h2 className="text-base font-bold text-white">Register a New Business on Tap-Bro</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Generates unique ID, instant tabletop QR code, and dispatches confirmation email.
              </p>
            </div>

            {regError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {regError}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Restaurant / Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Haveli Fine Dining & Sweets"
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Owner Email Address * (Welcome credentials sent here)
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 text-zinc-500 absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. owner@havelibistro.com"
                    className="w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 py-2 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Owner Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="e.g. 9811223344"
                    className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Set Admin PIN *
                  </label>
                  <input
                    type="text"
                    required
                    value={regPin}
                    onChange={(e) => setRegPin(e.target.value)}
                    placeholder="4-digit PIN"
                    maxLength={8}
                    className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Cuisine / Category
                </label>
                <input
                  type="text"
                  value={regCuisine}
                  onChange={(e) => setRegCuisine(e.target.value)}
                  placeholder="e.g. Traditional Awadhi & Chaat"
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Google Business Review URL
                </label>
                <input
                  type="url"
                  value={regGoogleUrl}
                  onChange={(e) => setRegGoogleUrl(e.target.value)}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              {/* Super Admin Notice */}
              <div className="rounded-xl bg-surface-raised p-2.5 border border-border/80 text-[11px] text-zinc-400 flex items-center gap-2">
                <Send className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>
                  Notification automatically delivered to Super Admin: <code className="text-amber-300">princesharma9955a@gmail.com</code>
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={regLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 px-4 font-semibold text-page shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 transition active:scale-[0.99] disabled:opacity-50 text-xs sm:text-sm"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{regLoading ? 'Registering & Sending Email...' : 'Register on Tap-Bro & Generate QR'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6 text-center text-xs text-zinc-500">
          <p>Tap-Bro Tabletop NFC & QR AI Review Assistant • Super Admin: princesharma9955a@gmail.com</p>
        </div>
      </div>
    </div>
  );
};
