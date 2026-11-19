'use client';

export const dynamic = 'force-dynamic';

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
  UtensilsCrossed,
  Plus,
  X,
  HelpCircle,
  ExternalLink,
  Search,
  Copy,
} from 'lucide-react';

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [tempPass, setTempPass] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restaurant details fed by the owner (Completely blank by default)
  const [restaurantName, setRestaurantName] = useState('');
  const [phone, setPhone] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [tagline, setTagline] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Custom signature dishes added by the owner during setup
  const [dishTags, setDishTags] = useState<string[]>([]);
  const [newDishInput, setNewDishInput] = useState('');
  const [showGoogleHelp, setShowGoogleHelp] = useState(false);

  // Auto-verify if email and temp pass are in the URL parameters
  useEffect(() => {
    const urlEmail = searchParams?.get('email');
    const urlPass = searchParams?.get('pass');
    const urlToken = searchParams?.get('token');

    if (urlEmail) setEmail(urlEmail);
    if (urlPass) setTempPass(urlPass);
    if (urlToken) setToken(urlToken);

    if (urlEmail && urlPass) {
      setValidating(true);
      fetch('/api/setup/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: urlEmail.trim(),
          tempPass: urlPass.trim(),
          token: urlToken || undefined,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIsVerified(true);
            setError(null);
          } else {
            setError(data.error || 'Temporary pass is invalid or expired (valid for 48 hours)');
          }
        })
        .catch(() => setError('Unable to auto-validate temporary pass. Please verify manually.'))
        .finally(() => setValidating(false));
    }
  }, [searchParams]);

  const handleVerifyPass = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidating(true);

    try {
      const res = await fetch('/api/setup/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          tempPass: tempPass.trim(),
          token: token || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsVerified(true);
      } else {
        setError(data.error || 'Invalid or expired temporary password (valid for 48 hours)');
      }
    } catch (err: any) {
      setError(err.message || 'Validation error');
    } finally {
      setValidating(false);
    }
  };

  const handleAddDish = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newDishInput.trim();
    if (trimmed && !dishTags.includes(trimmed)) {
      setDishTags([...dishTags, trimmed]);
      setNewDishInput('');
    }
  };

  const handleRemoveDish = (dish: string) => {
    setDishTags(dishTags.filter((d) => d !== dish));
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
          token: token || undefined,
          restaurantName: restaurantName.trim(),
          phone: phone.trim(),
          adminPin: adminPin.trim(),
          cuisine: cuisine.trim(),
          tagline: tagline.trim(),
          googleReviewUrl: googleReviewUrl.trim(),
          customDishes: dishTags,
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
    <div className="relative z-10 w-full max-w-md mx-auto px-3.5 sm:px-0 py-6">
      {/* Brand Header */}
      <div className="text-center mb-7">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl overflow-hidden border border-zinc-700/80 mb-3 bg-[#0A0A0C] p-1.5">
          <img src="/tap-bro-logo.png" alt="Tap-Bro Logo" className="h-full w-full object-cover rounded-lg" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          Tap-Bro Restaurant Activation
        </h1>
        <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
          Set up your restaurant name &amp; menu to activate your tabletop NFC review stand.
        </p>
      </div>

      {/* Step 1: Verify Temp Pass (Auto-bypassed if URL has valid credentials) */}
      {!isVerified ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-6 sm:p-7 space-y-5 animate-fade-in">
          <div>
            <h2 className="text-base font-bold text-white">Temporary Access Pass</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Enter the 4-digit pass received in your Tap-Bro invitation email or link.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleVerifyPass} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Your Email Address
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your-restaurant-email@gmail.com"
                  className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] pl-10 pr-3.5 py-3 text-base sm:text-sm text-white focus:border-zinc-500 focus:outline-none placeholder-zinc-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Temporary Pass (from email)
              </label>
              <div className="relative">
                <KeyRound className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. TAP-7892"
                  value={tempPass}
                  onChange={(e) => setTempPass(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-[#0A0A0C] pl-10 pr-3.5 py-3 text-base sm:text-sm text-white font-mono font-bold tracking-widest focus:border-zinc-500 focus:outline-none uppercase placeholder-zinc-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={validating}
              className="flex w-full items-center justify-center gap-2 rounded-xl btn-gold py-3 font-semibold text-sm transition disabled:opacity-50 active:scale-[0.98]"
            >
              <span>{validating ? 'Verifying Pass...' : 'Unlock Setup Form'}</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </form>
        </div>
      ) : (
        /* Step 2: Clean, Unprefilled Restaurant Profile Setup */
        <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-6 sm:p-7 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-zinc-800">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <CheckCircle2 className="h-4 w-4" />
              <span>Pass Verified ({email})</span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono uppercase bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-700">
              Single-use pass
            </span>
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-bold text-white">Your Restaurant Profile</h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Fill in your details. You can update these anytime in your manager dashboard.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleCompleteSetup} className="space-y-4">
            {/* Restaurant Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Restaurant / Cafe Name *
              </label>
              <div className="relative">
                <Store className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                  placeholder="Enter your restaurant name"
                  className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] pl-10 pr-3.5 py-3 text-base sm:text-sm text-white focus:border-zinc-500 focus:outline-none placeholder-zinc-500"
                />
              </div>
            </div>

            {/* Phone & PIN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Contact Phone Number *
                </label>
                <div className="relative">
                  <Phone className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    autoComplete="off"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] pl-10 pr-3.5 py-3 text-base sm:text-sm text-white focus:border-zinc-500 focus:outline-none placeholder-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Create Manager PIN *
                </label>
                <div className="relative">
                  <KeyRound className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    maxLength={8}
                    autoComplete="new-password"
                    placeholder="4-digit PIN (e.g. 1234)"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] pl-10 pr-3.5 py-3 text-base sm:text-sm text-white focus:border-zinc-500 focus:outline-none placeholder-zinc-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Cuisine & Tagline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Cuisine / Category
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  placeholder="e.g. Italian, Cafe, North Indian"
                  className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] px-3.5 py-3 text-base sm:text-sm text-white focus:border-zinc-500 focus:outline-none placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Tagline / Catchphrase
                </label>
                <input
                  type="text"
                  autoComplete="off"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Fresh Bites & Great Vibes"
                  className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] px-3.5 py-3 text-base sm:text-sm text-white focus:border-zinc-500 focus:outline-none placeholder-zinc-500"
                />
              </div>
            </div>

            {/* Signature Dishes Editor */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UtensilsCrossed className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Signature Dishes (Optional)</span>
                </span>
                <span className="text-[10px] text-zinc-500">Guests will pick from these</span>
              </label>

              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newDishInput}
                  onChange={(e) => setNewDishInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddDish();
                    }
                  }}
                  placeholder="e.g. Paneer Tikka, Cold Brew"
                  className="flex-1 rounded-xl border border-zinc-800 bg-[#0A0A0C] px-3.5 py-2.5 text-base sm:text-xs text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddDish}
                  disabled={!newDishInput.trim()}
                  className="flex items-center gap-1 rounded-xl bg-zinc-800 border border-zinc-700 px-3.5 py-2.5 text-xs font-semibold text-zinc-300 hover:bg-zinc-700 disabled:opacity-40 transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {dishTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {dishTags.map((dish) => (
                    <span
                      key={dish}
                      className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 border border-zinc-700 px-3 py-1 text-xs text-zinc-300 font-medium"
                    >
                      <span>{dish}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDish(dish)}
                        className="text-zinc-400 hover:text-white ml-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Google Review URL with Dead-Simple 1-Tap Search & Paste */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <LinkIcon className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Google Business Review URL</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowGoogleHelp(!showGoogleHelp)}
                  className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Quick Guide</span>
                </button>
              </div>

              {/* 1-Tap Google Search & Quick Paste Helper */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const name = restaurantName.trim();
                    const query = encodeURIComponent(name ? `${name} restaurant` : 'my restaurant');
                    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition active:scale-95"
                >
                  <Search className="h-3.5 w-3.5 text-zinc-400" />
                  <span>
                    1-Tap: Find &quot;{restaurantName.trim() || 'My Business'}&quot; on Maps
                  </span>
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const text = await navigator.clipboard.readText();
                      if (text && (text.startsWith('http://') || text.startsWith('https://'))) {
                        setGoogleReviewUrl(text.trim());
                      }
                    } catch {}
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition active:scale-95"
                >
                  <Copy className="h-3.5 w-3.5 text-zinc-400" />
                  <span>Paste Copied Link</span>
                </button>
              </div>

              {/* Step-by-Step Visual Guide for Shop Owners */}
              {showGoogleHelp && (
                <div className="rounded-xl border border-zinc-700 bg-[#0A0A0C] p-3 text-xs space-y-2 animate-fade-in">
                  <p className="font-semibold text-white">How to connect in 10 seconds:</p>
                  <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
                    <li>Tap <strong>&quot;1-Tap: Find on Maps&quot;</strong> above to open your store on Google Maps.</li>
                    <li>On your store card, tap <strong>&quot;Share&quot;</strong> (or <strong>&quot;Ask for reviews&quot;</strong>) and tap <strong>Copy Link</strong>.</li>
                    <li>Come back here and tap <strong>&quot;Paste Copied Link&quot;</strong>. Done!</li>
                  </ol>
                  <p className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                    💡 Accepts any Google link: Google Maps share link, g.page short link, or Place ID review link.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="url"
                  autoComplete="off"
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  placeholder="Paste any Google Maps link (e.g. https://maps.app.goo.gl/...)"
                  className="flex-1 rounded-xl border border-zinc-800 bg-[#0A0A0C] px-3.5 py-3 text-xs sm:text-sm text-white focus:border-zinc-500 focus:outline-none font-mono placeholder-zinc-500"
                />
                {googleReviewUrl && (
                  <button
                    type="button"
                    onClick={() => window.open(googleReviewUrl, '_blank')}
                    className="flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-3 text-xs font-semibold text-white hover:bg-zinc-700 transition shrink-0"
                    title="Test your review link"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Test Link</span>
                  </button>
                )}
              </div>

              {googleReviewUrl && (
                <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Google Link Connected! Tap &quot;Test Link&quot; to verify.</span>
                </p>
              )}

              <p className="text-[11px] text-zinc-500">
                Optional: You can also skip this and add or update it anytime later in your manager dashboard.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-gold flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold transition text-sm sm:text-base disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4 fill-current" />
                <span>{submitting ? 'Activating Restaurant...' : 'Activate Tabletop Station'}</span>
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
    <div className="min-h-[100dvh] bg-[#0A0A0C] flex flex-col justify-center items-center p-3 sm:p-4 text-white relative overflow-x-hidden">
      <div className="ambient-bg pointer-events-none fixed inset-0 z-0" />
      <Suspense fallback={<div className="text-zinc-400 text-xs">Loading Setup Portal...</div>}>
        <SetupContent />
      </Suspense>
    </div>
  );
}
