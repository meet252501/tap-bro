'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Store,
  KeyRound,
  Mail,
  Phone,
  Link as LinkIcon,
  CheckCircle2,
  ExternalLink,
  Search,
  Copy,
  Check,
  MapPin,
  QrCode,
  ShieldCheck,
  RefreshCw,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface PlaceSuggestion {
  placeId: string;
  name: string;
  address: string;
  description: string;
  reviewUrl: string;
}

function generateSlug(name: string, location?: string): string {
  const parts = [name, location?.split(',')[0]].filter(Boolean).join(' ');
  const s = parts
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return s || 'restaurant';
}

function SetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // "Search & Lock" State
  const [searchInput, setSearchInput] = useState('');
  const [predictions, setPredictions] = useState<PlaceSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Locked Restaurant Details (Pulled from Google)
  const [restaurantName, setRestaurantName] = useState('');
  const [location, setLocation] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [liveTapBroLink, setLiveTapBroLink] = useState('');

  // Owner Access Credentials
  const [phone, setPhone] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [email, setEmail] = useState('');
  const [tempPass, setTempPass] = useState('');
  const [token, setToken] = useState<string | null>(null);

  // UI helpers
  const [copiedReviewUrl, setCopiedReviewUrl] = useState(false);
  const [copiedTapBroUrl, setCopiedTapBroUrl] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize from URL params if present (from invite email)
  useEffect(() => {
    const urlEmail = searchParams?.get('email');
    const urlPass = searchParams?.get('pass');
    const urlToken = searchParams?.get('token');

    if (urlEmail) setEmail(urlEmail);
    if (urlPass) setTempPass(urlPass);
    if (urlToken) setToken(urlToken);
  }, [searchParams]);

  // Autocomplete fetch on search typing
  useEffect(() => {
    if (isLocked) return;

    if (!searchInput.trim() || searchInput.trim().length < 2) {
      setPredictions([]);
      setShowDropdown(false);
      return;
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(searchInput.trim())}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.predictions)) {
          setPredictions(data.predictions);
          setShowDropdown(true);
        }
      } catch (err) {
        console.warn('Place search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchInput, isLocked]);

  // Lock listing when owner taps a suggestion from dropdown
  const handleSelectPlace = (place: PlaceSuggestion) => {
    const cleanName = place.name.trim();
    const cleanAddress = place.address.trim();
    const pid = place.placeId.trim();

    // Direct 5-Star Review Popup URL
    const reviewUrl = pid
      ? `https://search.google.com/local/writereview?placeid=${pid}`
      : place.reviewUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanName + ' ' + cleanAddress)}`;

    const generatedSlug = generateSlug(cleanName, cleanAddress);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tapbro.vercel.app';
    const tapBroLink = `${origin}/r/${generatedSlug}`;

    setRestaurantName(cleanName);
    setLocation(cleanAddress);
    setPlaceId(pid);
    setGoogleReviewUrl(reviewUrl);
    setSlug(generatedSlug);
    setLiveTapBroLink(tapBroLink);
    setIsLocked(true);
    setShowDropdown(false);
    setError(null);
  };

  // Allow manual lock if listing not found in dropdown
  const handleManualLock = () => {
    if (!searchInput.trim()) return;
    const cleanName = searchInput.trim();
    const reviewUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cleanName)}`;
    const generatedSlug = generateSlug(cleanName);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tapbro.vercel.app';

    setRestaurantName(cleanName);
    setLocation('Google Maps Search');
    setGoogleReviewUrl(reviewUrl);
    setSlug(generatedSlug);
    setLiveTapBroLink(`${origin}/r/${generatedSlug}`);
    setIsLocked(true);
    setShowDropdown(false);
  };

  // Rule 1: Instant direct link navigation for testing
  const handleTestReview = () => {
    if (!googleReviewUrl) return;
    window.location.href = googleReviewUrl;
  };

  // Final Station Activation Form Submit
  const handleCompleteSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!restaurantName.trim()) {
      setError('Please search and lock your restaurant first.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your contact phone number.');
      return;
    }
    if (!adminPin.trim() || adminPin.trim().length < 4) {
      setError('Please create a 4-digit Manager PIN (e.g. 1234).');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/setup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: restaurantName.trim(),
          location: location.trim(),
          googleReviewUrl: googleReviewUrl.trim(),
          phone: phone.trim(),
          adminPin: adminPin.trim(),
          email: email.trim() || undefined,
          tempPass: tempPass.trim() || undefined,
          token: token || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(`admin_${data.restaurant.slug}`, adminPin.trim());
        router.push(`/admin/${data.restaurant.slug}?welcome=1`);
      } else {
        setError(data.error || 'Failed to complete setup');
      }
    } catch (err: any) {
      setError(err.message || 'Network setup error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white p-4 sm:p-6 pb-24 max-w-xl mx-auto flex flex-col justify-center">
      {/* Brand Header */}
      <div className="text-center mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-zinc-300" />
          <span>Self-Serve Stand Onboarding</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Search &amp; Lock Your Restaurant
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
          Type your restaurant name below. We&apos;ll automatically lock your direct 5-star Google review target and launch your tabletop stand in 10 seconds.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* STEP 1: Search & Lock Search Box */}
      {!isLocked ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-5 sm:p-6 space-y-4 shadow-xl">
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Search className="h-4 w-4 text-zinc-400" />
              <span>Search Google Business Profile</span>
            </label>
            <div className="relative">
              <Search className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                autoFocus
                autoComplete="off"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder='e.g. "Eat Panjab, Gandhinagar" or paste Maps link'
                className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none transition"
              />
              {isSearching && (
                <RefreshCw className="h-4 w-4 text-zinc-400 absolute right-3.5 top-3.5 animate-spin" />
              )}
            </div>
            <p className="text-[11px] text-zinc-500 mt-1.5 leading-relaxed">
              💡 Works for any business! You do not need to be the Google owner.
            </p>
          </div>

          {/* Autocomplete Predictions Dropdown */}
          {showDropdown && predictions.length > 0 && (
            <div className="rounded-xl border border-zinc-800 bg-[#0A0A0C] divide-y divide-zinc-850 overflow-hidden shadow-2xl animate-fade-in max-h-72 overflow-y-auto">
              {predictions.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPlace(p)}
                  className="w-full text-left p-3 hover:bg-zinc-850 flex items-start gap-2.5 transition group"
                >
                  <MapPin className="h-4 w-4 text-zinc-400 mt-0.5 shrink-0 group-hover:text-white" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate group-hover:text-white">
                      {p.name}
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      {p.address}
                    </p>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono shrink-0 uppercase group-hover:text-zinc-300">
                    Lock ➔
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Fallback Lock Button if typed custom */}
          {searchInput.trim().length >= 2 && !showDropdown && (
            <button
              type="button"
              onClick={handleManualLock}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-2.5 px-3 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-750 transition flex items-center justify-center gap-1.5"
            >
              <span>Lock &quot;{searchInput.trim()}&quot;</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        /* STEP 2: The Locked Restaurant Card + Instant Live Preview + Activation */
        <div className="space-y-4 animate-fade-in">
          {/* Locked Badge & Card */}
          <div className="rounded-2xl border border-emerald-500/30 bg-[#121216] p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>Locked from Google Business Profile</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsLocked(false);
                  setShowDropdown(false);
                }}
                className="text-[11px] text-zinc-400 hover:text-white underline underline-offset-2 transition"
              >
                Change Listing
              </button>
            </div>

            {/* Extracted Business Information */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-zinc-400 shrink-0" />
                <h2 className="text-base font-bold text-white">{restaurantName}</h2>
              </div>
              <p className="text-xs text-zinc-400 pl-6 leading-relaxed">
                {location}
              </p>
            </div>

            {/* Direct 5-Star Review Popup URL Target */}
            <div className="rounded-xl bg-[#0A0A0C] p-3 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Direct 5-Star Review Popup URL:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={googleReviewUrl}
                  className="flex-1 rounded-lg border border-zinc-800 bg-[#121216] px-2.5 py-1.5 text-xs text-emerald-400 font-mono truncate"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(googleReviewUrl);
                      setCopiedReviewUrl(true);
                      setTimeout(() => setCopiedReviewUrl(false), 2000);
                    } catch {}
                  }}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition shrink-0"
                >
                  {copiedReviewUrl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Live TapBro Tabletop Link */}
            <div className="rounded-xl bg-[#0A0A0C] p-3 border border-zinc-800 space-y-1">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Live TapBro Counter Stand Link:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={liveTapBroLink}
                  className="flex-1 rounded-lg border border-zinc-800 bg-[#121216] px-2.5 py-1.5 text-xs text-zinc-200 font-mono truncate"
                />
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(liveTapBroLink);
                      setCopiedTapBroUrl(true);
                      setTimeout(() => setCopiedTapBroUrl(false), 2000);
                    } catch {}
                  }}
                  className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs font-semibold text-zinc-300 hover:text-white transition shrink-0"
                >
                  {copiedTapBroUrl ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            {/* Instant Preview: Test Live Review Button (Rule 1 & Rule 2) */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleTestReview}
                className="btn-gold w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-xs sm:text-sm shadow-xl active:scale-95 transition"
              >
                <Sparkles className="h-4 w-4 fill-current" />
                <span>Test Live Review Button (Watch 5-Star Box Pop Up) 🚀</span>
              </button>

              <div className="text-center">
                <a
                  href={googleReviewUrl}
                  className="text-[11px] text-zinc-400 hover:text-white underline underline-offset-2 transition inline-flex items-center gap-1"
                >
                  <span>Didn&apos;t open automatically? Tap here</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* STEP 3: Owner Credentials & Launch */}
          <form onSubmit={handleCompleteSetup} className="rounded-2xl border border-zinc-800 bg-[#121216] p-5 space-y-4 shadow-xl">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-zinc-400" />
                <span>Owner Credentials (To Access Manager Hub)</span>
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Set a PIN so only you can access your reviews and menu dashboard.
              </p>
            </div>

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
                    className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] pl-10 pr-3.5 py-2.5 text-sm text-white focus:border-zinc-500 focus:outline-none placeholder-zinc-500"
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
                    className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] pl-10 pr-3.5 py-2.5 text-sm text-white focus:border-zinc-500 focus:outline-none placeholder-zinc-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Owner Email (For 30-Day Monthly Performance Report)
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. owner@gmail.com"
                  className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] pl-10 pr-3.5 py-2.5 text-sm text-white focus:border-zinc-500 focus:outline-none placeholder-zinc-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-gold flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold transition text-sm disabled:opacity-50 shadow-xl active:scale-95"
              >
                <Sparkles className="h-4 w-4 fill-current" />
                <span>{submitting ? 'Activating Stand...' : 'Activate Tabletop Station 🚀'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-zinc-500">
        <p>Tap-Bro • 1-Click NFC &amp; QR Tabletop Review Engine</p>
      </div>
    </div>
  );
}

export default function BusinessSetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-4 text-zinc-400 text-xs">Loading Search &amp; Lock Setup...</div>}>
      <SetupContent />
    </Suspense>
  );
}
