'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  Mail,
  KeyRound,
  LogIn,
  Sparkles,
  ArrowRight,
  Radio,
  Lock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

function AdminPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Login form state
  const [loginPhoneOrEmail, setLoginPhoneOrEmail] = useState('');
  const [loginPinOrPass, setLoginPinOrPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [autoLoggingIn, setAutoLoggingIn] = useState(false);

  // Auto-authenticate if email & pass/token are present in the URL (e.g. from invite email link)
  useEffect(() => {
    const urlEmail = searchParams?.get('email');
    const urlPass = searchParams?.get('pass');

    if (urlEmail && urlPass) {
      setLoginPhoneOrEmail(urlEmail);
      setLoginPinOrPass(urlPass);
      setAutoLoggingIn(true);
      executeLogin(urlEmail, urlPass);
    }
  }, [searchParams]);

  const executeLogin = async (identifier: string, secret: string) => {
    setLoginError(null);
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: identifier, pinOrId: secret }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.pendingSetup && data.setupUrl) {
          router.push(data.setupUrl);
          return;
        }

        if (data.restaurant) {
          localStorage.setItem(`admin_${data.restaurant.slug}`, secret);
          router.push(`/admin/${data.restaurant.slug}`);
          return;
        }
      }

      setLoginError(data.error || 'Access Denied: Invalid credentials or unauthorized account.');
    } catch (err: any) {
      setLoginError(err.message || 'Network error during login.');
    } finally {
      setLoginLoading(false);
      setAutoLoggingIn(false);
    }
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(loginPhoneOrEmail, loginPinOrPass);
  };

  return (
    <div className="min-h-screen bg-[#0B1326] flex flex-col justify-center items-center p-4 selection:bg-amber-400 selection:text-[#0B1326] relative">
      <div className="ambient-bg pointer-events-none fixed inset-0 z-0" />

      <div className="relative z-10 w-full max-w-md">
        {/* Branding Banner */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg mb-3">
            <Radio className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tap-Bro Partner Portal
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Invite-Only Restaurant Management & Tabletop NFC Hub
          </p>
        </div>

        {/* Security Invite-Only Badge */}
        <div className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-slate-900/80 border border-slate-800 p-2.5 text-xs text-slate-300">
          <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
          <span>Strictly Invite-Only • Verified Partner Access</span>
        </div>

        {/* Login Form Card (Stitch High-Precision Design System) */}
        <div className="rounded-2xl border border-slate-800 bg-[#131B2E] p-6 sm:p-7 shadow-2xl space-y-5 animate-fade-in">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span>Partner Sign In</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Access is restricted to authorized partners with an active Super Admin invitation or temporary pass.
            </p>
          </div>

          {autoLoggingIn && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-center gap-2">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
              <span>Verifying your email invitation link...</span>
            </div>
          )}

          {loginError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleManualLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Authorized Email or Phone
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={loginPhoneOrEmail}
                  onChange={(e) => setLoginPhoneOrEmail(e.target.value)}
                  placeholder="e.g. manager@tajdining.com or 9876543210"
                  className="w-full rounded-xl border border-slate-700 bg-[#0F172A] pl-10 pr-3.5 py-3 text-base sm:text-sm text-white focus:border-amber-400 focus:outline-none placeholder-slate-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Temporary Pass (from email) or Manager PIN
              </label>
              <div className="relative">
                <KeyRound className="h-4 w-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={loginPinOrPass}
                  onChange={(e) => setLoginPinOrPass(e.target.value)}
                  placeholder="e.g. TAP-1234 or 4-digit PIN"
                  className="w-full rounded-xl border border-slate-700 bg-[#0F172A] pl-10 pr-3.5 py-3 text-base sm:text-sm text-white focus:border-amber-400 focus:outline-none placeholder-slate-500 transition-all font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loginLoading}
                className="btn-gold flex w-full items-center justify-center gap-2 rounded-xl py-3.5 px-4 font-bold text-sm transition disabled:opacity-50"
              >
                <LogIn className="h-4 w-4" />
                <span>{loginLoading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
              </button>
            </div>
          </form>

          {/* Security Guarantee */}
          <div className="pt-2 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              New restaurants must be invited by Super Admin.
              <br />
              Public self-registration is closed for platform security.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Tap-Bro Tabletop NFC Review Assistant • End-to-End Encrypted Partner Access</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1326] flex items-center justify-center text-amber-400 text-xs">Loading Partner Portal...</div>}>
      <AdminPortalContent />
    </Suspense>
  );
}
