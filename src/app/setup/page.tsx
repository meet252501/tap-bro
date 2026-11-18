'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Store,
  KeyRound,
  Mail,
  Phone,
  Link as LinkIcon,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [tempPass, setTempPass] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restaurant details fed by the owner
  const [restaurantName, setRestaurantName] = useState('');
  const [phone, setPhone] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [tagline, setTagline] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const urlEmail = searchParams?.get('email');
    const urlPass = searchParams?.get('pass');
    if (urlEmail) setEmail(urlEmail);
    if (urlPass) setTempPass(urlPass);
  }, [searchParams]);

  const handleVerifyPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidating(true);

    try {
      const res = await fetch('/api/setup/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), tempPass: tempPass.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsVerified(true);
      } else {
        setError(data.error || 'Invalid or expired temporary password');
      }
    } catch (err: any) {
      setError(err.message || 'Validation error');
    } finally {
      setValidating(false);
    }
  };

  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/setup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          tempPass: tempPass.trim(),
          restaurantName: restaurantName.trim(),
          phone: phone.trim(),
          adminPin: adminPin.trim(),
          cuisine: cuisine.trim(),
          tagline: tagline.trim(),
          googleReviewUrl: googleReviewUrl.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(`admin_${data.restaurant.slug}`, adminPin);
        router.push(`/admin/${data.restaurant.slug}?new=1`);
      } else {
        setError(data.error || 'Failed to complete setup');
      }
    } catch (err: any) {
      setError(err.message || 'Setup error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-lg">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden border border-amber-400/40 shadow-xl shadow-amber-500/20 mb-3 bg-surface">
          <img src="/tap-bro-logo.png" alt="Tap-Bro Logo" className="h-full w-full object-cover" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Tap-Bro Restaurant Activation
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-text-secondary">
          Feed your restaurant details to activate your tabletop NFC review station
        </p>
      </div>

      {/* Step 1: Verify Temp Pass */}
      {!isVerified ? (
        <div className="rounded-2xl border border-border bg-surface-card p-6 shadow-2xl space-y-5 animate-fade-in">
          <div>
            <h2 className="text-base font-bold text-white">Enter Your Temporary Access Pass</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Check the invitation email sent by Tap-Bro to your inbox.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyPass} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Your Registered Email
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. manager@tajdining.com"
                  className="w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Temporary Access Code (Temp Pass)
              </label>
              <div className="relative">
                <KeyRound className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. TAP-7892"
                  value={tempPass}
                  onChange={(e) => setTempPass(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-amber-300 font-mono font-bold tracking-wider focus:border-amber-400 focus:outline-none uppercase"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={validating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 font-semibold text-page shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 transition text-xs sm:text-sm"
            >
              <span>{validating ? 'Verifying Pass...' : 'Unlock Restaurant Setup'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        /* Step 2: Feed Restaurant Details */
        <div className="rounded-2xl border border-amber-500/30 bg-surface-card p-6 shadow-2xl space-y-5 animate-fade-in">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4" />
            <span>Temporary Pass Verified ({email})</span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">Feed Your Restaurant Profile</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Set up your business name, menu, and Google review link so Tap-Bro AI can craft diner drafts.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleCompleteSetup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Restaurant / Dining Spot Name *
              </label>
              <div className="relative">
                <Store className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="e.g. The Saffron Royal Chaat Bistro"
                  className="w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Contact Phone *
                </label>
                <div className="relative">
                  <Phone className="h-4 w-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-xl border border-border bg-surface pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Create Permanent PIN *
                </label>
                <div className="relative">
                  <KeyRound className="h-4 w-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    maxLength={8}
                    placeholder="4-digit PIN"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full rounded-xl border border-border bg-surface pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Cuisine & Specialty
              </label>
              <input
                type="text"
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                placeholder="e.g. North Indian & Street Chaat"
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Tagline / Catchphrase
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Authentic Taste & Royal Hospitality"
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5 text-amber-400" />
                <span>Google Business Review URL</span>
              </label>
              <input
                type="url"
                value={googleReviewUrl}
                onChange={(e) => setGoogleReviewUrl(e.target.value)}
                placeholder="https://search.google.com/local/writereview?placeid=..."
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none font-mono"
              />
              <p className="mt-1 text-[11px] text-zinc-400">
                Diners will be redirected here after copying their AI review draft.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 font-semibold text-page shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 transition text-xs sm:text-sm disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>{submitting ? 'Activating Restaurant...' : 'Activate My Tap-Bro Station ➔'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-6 text-center text-xs text-zinc-500">
        <p>Tap-Bro Tabletop NFC Review Assistant</p>
      </div>
    </div>
  );
}

export default function BusinessSetupPage() {
  return (
    <div className="min-h-screen bg-page flex flex-col justify-center items-center p-4 selection:bg-amber-400 selection:text-page relative">
      <div className="ambient-bg pointer-events-none fixed inset-0 z-0" />
      <Suspense fallback={<div className="text-amber-400 text-xs">Loading Setup Portal...</div>}>
        <SetupContent />
      </Suspense>
    </div>
  );
}
