'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  Store,
  Phone,
  KeyRound,
  Mail,
  ExternalLink,
  Search,
  Copy,
  Check,
  MapPin,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Building2,
  Navigation,
  Lock,
  Unlock,
} from 'lucide-react';
import { PlaceSuggestion } from '@/app/api/places/autocomplete/route';
import { StoreBranchMap } from '@/components/StoreBranchMap';

function generateSlug(name: string, location?: string): string {
  const parts = [name, location?.split(',')[0]].filter(Boolean).join(' ');
  const s = parts
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return s || 'restaurant';
}

function formatGujaratReviewQuery(name: string, address?: string): string {
  const full = `${name.trim()} ${(address || '').trim()}`.trim();
  const hasGujarat = /gujarat/i.test(full);
  const hasIndia = /india/i.test(full);
  const suffix = !hasGujarat ? 'Gujarat, India' : !hasIndia ? 'India' : '';
  const query = suffix ? `${full}, ${suffix}` : full;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export interface StoreSetupViewProps {
  mode?: 'invite' | 'direct';
}

export function StoreSetupView({ mode = 'invite' }: StoreSetupViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Invite Gate State (Only active in 'invite' mode)
  const isDirectMode = mode === 'direct';
  const [email, setEmail] = useState('');
  const [tempPass, setTempPass] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(isDirectMode);
  const [validatingInvite, setValidatingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Search & Map Discovery State
  const [searchInput, setSearchInput] = useState('');
  const [predictions, setPredictions] = useState<PlaceSuggestion[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<PlaceSuggestion | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Locked Restaurant Details (Pulled from Map Selection)
  const [restaurantName, setRestaurantName] = useState('');
  const [location, setLocation] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [liveTapBroLink, setLiveTapBroLink] = useState('');

  // Owner Access Credentials
  const [phone, setPhone] = useState('');
  const [adminPin, setAdminPin] = useState('');

  // UI helpers
  const [copiedReviewUrl, setCopiedReviewUrl] = useState(false);
  const [copiedTapBroUrl, setCopiedTapBroUrl] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-verify if email and temp pass are in URL query params
  useEffect(() => {
    const urlEmail = searchParams?.get('email');
    const urlPass = searchParams?.get('pass');
    const urlToken = searchParams?.get('token');

    if (urlEmail) setEmail(urlEmail.trim());
    if (urlPass) setTempPass(urlPass.trim());
    if (urlToken) setToken(urlToken.trim());

    if (!isDirectMode && urlEmail && urlPass) {
      setValidatingInvite(true);
      setInviteError(null);
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
            setInviteError(null);
          } else {
            setInviteError(data.error || 'Temporary pass is invalid or expired.');
          }
        })
        .catch(() => setInviteError('Could not validate temporary pass. Check your connection.'))
        .finally(() => setValidatingInvite(false));
    }
  }, [searchParams, isDirectMode]);

  // Manual Invite Verification Handler
  const handleVerifyInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);

    if (!email.trim() || !tempPass.trim()) {
      setInviteError('Please enter both your business email and temporary password.');
      return;
    }

    setValidatingInvite(true);
    try {
      const res = await fetch('/api/setup/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          tempPass: tempPass.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsVerified(true);
        setInviteError(null);
      } else {
        setInviteError(data.error || 'Invalid or expired temporary password for this email.');
      }
    } catch (err: any) {
      setInviteError(err.message || 'Validation network error. Try again.');
    } finally {
      setValidatingInvite(false);
    }
  };

  // Search query with Gujarat / India bias
  useEffect(() => {
    if (isLocked) return;

    if (!searchInput.trim() || searchInput.trim().length < 2) {
      setPredictions([]);
      setSelectedBranch(null);
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
          if (data.predictions.length > 0) {
            setSelectedBranch(data.predictions[0]);
          }
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

  // Lock branch when owner selects a branch on map or card
  const handleSelectPlace = (place: PlaceSuggestion) => {
    const cleanName = place.branchName || place.name.trim();
    const cleanAddress = place.address.trim();
    const pid = place.placeId.trim();

    // Direct 5-Star Review Popup URL (Strictly Gujarat & India bounded)
    const reviewUrl = pid && pid.startsWith('ChIJ')
      ? `https://search.google.com/local/writereview?placeid=${pid}`
      : place.reviewUrl || formatGujaratReviewQuery(cleanName, cleanAddress);

    const generatedSlug = generateSlug(cleanName, cleanAddress);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tapbro.vercel.app';
    const tapBroLink = `${origin}/r/${generatedSlug}`;

    setSelectedBranch(place);
    setRestaurantName(cleanName);
    setLocation(cleanAddress || 'Gujarat, India');
    setPlaceId(pid);
    setGoogleReviewUrl(reviewUrl);
    setSlug(generatedSlug);
    setLiveTapBroLink(tapBroLink);
    setIsLocked(true);
    setError(null);
  };

  // Allow manual lock if listing not found in dropdown
  const handleManualLock = () => {
    if (!searchInput.trim()) return;
    const cleanName = searchInput.trim();
    const reviewUrl = formatGujaratReviewQuery(cleanName, 'Gujarat, India');
    const generatedSlug = generateSlug(cleanName);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tapbro.vercel.app';

    setRestaurantName(cleanName);
    setLocation('Gujarat, India');
    setGoogleReviewUrl(reviewUrl);
    setSlug(generatedSlug);
    setLiveTapBroLink(`${origin}/r/${generatedSlug}`);
    setIsLocked(true);
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
      setError('Please select and lock your store branch on the map first.');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter your contact phone number.');
      return;
    }
    if (!adminPin.trim() || adminPin.trim().length < 4) {
      setError('Please choose at least a 4-digit PIN for your manager dashboard.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/setup/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: restaurantName.trim(),
          phone: phone.trim(),
          adminPin: adminPin.trim(),
          location: location.trim(),
          googleReviewUrl: googleReviewUrl.trim(),
          placeId: placeId.trim() || undefined,
          email: email.trim() || undefined,
          tempPass: tempPass.trim().toUpperCase() || undefined,
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
    <div className="min-h-screen bg-[#0A0A0C] text-white p-4 sm:p-6 pb-24 max-w-2xl mx-auto flex flex-col justify-center">
      {/* Brand Header */}
      <div className="text-center mb-6 space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-xs text-zinc-400">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>{isDirectMode ? 'Self-Serve Stand Onboarding' : 'Official Invite Setup Portal'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {isDirectMode
            ? 'Launch Your Tabletop Stand'
            : isVerified
            ? 'Select Your Store Branch'
            : 'Enter Your Invitation Pass'}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
          {isDirectMode
            ? 'Search your brand or restaurant below to plot all Gujarat branches on the map and activate your NFC review stand.'
            : isVerified
            ? `Invitation verified for ${email}! Search your restaurant below to plot your store branches on the map.`
            : 'Enter the temporary password sent to your email to verify your invite and configure your live tabletop station.'}
        </p>
      </div>

      {/* Global Error Banner */}
      {(error || inviteError) && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {error || inviteError}
        </div>
      )}

      {/* GATE: If in Invite mode and not yet verified, show Temp Pass Gate */}
      {!isDirectMode && !isVerified ? (
        <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-5 sm:p-6 space-y-5 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Lock className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Verify Business Invitation
            </span>
          </div>

          <form onSubmit={handleVerifyInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Owner Email Address *
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. owner@restaurant.com"
                  className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] pl-10 pr-3.5 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>Temporary Password (Single-Use Pass) *</span>
                <span className="text-[10px] text-amber-400 font-mono">e.g. TAP-4829</span>
              </label>
              <div className="relative">
                <KeyRound className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  autoComplete="off"
                  value={tempPass}
                  onChange={(e) => setTempPass(e.target.value)}
                  placeholder="Paste your temporary pass (e.g. TAP-XXXX)"
                  className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] pl-10 pr-3.5 py-3 text-sm text-white placeholder-zinc-500 font-mono uppercase tracking-wider focus:border-amber-400 focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={validatingInvite}
              className="btn-gold w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-sm shadow-xl active:scale-95 transition disabled:opacity-50"
            >
              {validatingInvite ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-black" />
                  <span>Verifying Temporary Pass...</span>
                </>
              ) : (
                <>
                  <Unlock className="h-4 w-4 text-black" />
                  <span>Verify Invitation &amp; Continue ➔</span>
                </>
              )}
            </button>
          </form>

          {/* Quick link to /create if no invite code */}
          <div className="pt-2 text-center text-xs text-zinc-500">
            <span>Don&apos;t have an invite code? </span>
            <Link
              href="/create"
              className="text-amber-400 hover:text-amber-300 underline underline-offset-2 font-medium transition"
            >
              Start direct self-serve setup on /create ➔
            </Link>
          </div>
        </div>
      ) : (
        /* UNLOCKED: Store Branch Map Flow */
        <>
          {/* Direct Mode Invitation Switcher Banner */}
          {isDirectMode && (
            <div className="mb-4 rounded-xl border border-zinc-800 bg-[#121216] p-3 flex items-center justify-between text-xs text-zinc-400 animate-fade-in">
              <span className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Have an official invitation code or temporary password?</span>
              </span>
              <Link
                href="/setup"
                className="text-amber-400 hover:text-amber-300 font-semibold text-[11px] underline underline-offset-2 shrink-0 transition"
              >
                Go to Setup Portal ➔
              </Link>
            </div>
          )}

          {/* Verified Invite Banner (when in invite mode) */}
          {!isDirectMode && email && (
            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between text-xs text-emerald-300 animate-fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  Invitation Verified for <strong>{email}</strong>
                  {tempPass ? ` (Pass: ${tempPass.toUpperCase()})` : ''}
                </span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                1-Time Pass Ready
              </span>
            </div>
          )}

          {/* STEP 1: Search & Interactive Branch Map */}
          {!isLocked ? (
            <div className="space-y-4 animate-fade-in">
              {/* Search Box */}
              <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-4 sm:p-5 space-y-3 shadow-xl">
                <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Search className="h-4 w-4 text-amber-400" />
                    <span>Search Restaurant or Chain Name</span>
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    Gujarat &amp; India • Map view
                  </span>
                </label>
                <div className="relative">
                  <Search className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    autoFocus
                    autoComplete="off"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder='e.g. "Karnavati", "Eat Punjab", "Honest", "Tea Post"...'
                    className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition"
                  />
                  {isSearching && (
                    <RefreshCw className="h-4 w-4 text-amber-400 absolute right-3.5 top-3.5 animate-spin" />
                  )}
                </div>
              </div>

              {/* Interactive Store Branch Map */}
              <StoreBranchMap
                branches={predictions}
                selectedBranch={selectedBranch}
                onSelectBranch={handleSelectPlace}
                isLoading={isSearching}
              />

              {/* Branch Store Cards (Tappable Pins / Cards) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="h-3.5 w-3.5 text-amber-400" />
                    <span>
                      {predictions.length > 0
                        ? `Discovered Branches (${predictions.length} locations in Gujarat)`
                        : 'Search a brand above to view branches'}
                    </span>
                  </h3>
                  <span className="text-[10px] text-zinc-500">Tap pin or card to lock</span>
                </div>

                {predictions.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2.5 max-h-80 overflow-y-auto pr-1">
                    {predictions.map((p, idx) => {
                      const isCurrent =
                        selectedBranch?.name === p.name && selectedBranch?.address === p.address;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectPlace(p)}
                          className={`p-3.5 rounded-xl border text-left transition-all duration-150 cursor-pointer active:scale-[0.99] flex items-center justify-between gap-3 ${
                            isCurrent
                              ? 'bg-[#18181E] border-amber-400/90 shadow-[0_0_15px_rgba(245,200,76,0.15)]'
                              : 'bg-[#121216] border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850'
                          }`}
                        >
                          <div className="flex items-start gap-3 min-w-0">
                            {/* Numbered Pin Badge */}
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                                isCurrent
                                  ? 'bg-amber-400 text-black shadow-md'
                                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                              }`}
                            >
                              {idx + 1}
                            </div>

                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-bold text-white truncate">
                                {p.branchName || p.name}
                              </p>
                              <p className="text-[11px] text-zinc-400 truncate mt-0.5 flex items-center gap-1">
                                <MapPin className="h-3 w-3 shrink-0 text-zinc-500" />
                                <span>{p.address}</span>
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectPlace(p);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
                              isCurrent
                                ? 'bg-amber-400 text-black'
                                : 'bg-zinc-800 text-zinc-200 hover:bg-zinc-700'
                            }`}
                          >
                            Lock Branch ➔
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
                    Type your restaurant name above to plot all branch locations on the map.
                  </div>
                )}

                {/* Manual fallback button */}
                {searchInput.trim().length >= 2 && (
                  <button
                    type="button"
                    onClick={handleManualLock}
                    className="w-full rounded-xl border border-zinc-800 bg-[#121216] py-2.5 px-3 text-xs font-semibold text-zinc-400 hover:text-white transition flex items-center justify-center gap-1.5"
                  >
                    <span>Branch not on map? Lock &quot;{searchInput.trim()}&quot; in Gujarat directly</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* STEP 2: The Locked Restaurant Branch Card + Instant Live Preview + Activation */
            <div className="space-y-4 animate-fade-in">
              {/* Locked Badge & Card */}
              <div className="rounded-2xl border border-amber-400/30 bg-[#121216] p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Store Branch Locked on Map</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsLocked(false)}
                    className="text-[11px] text-zinc-400 hover:text-white underline underline-offset-2 transition flex items-center gap-1"
                  >
                    <Navigation className="h-3 w-3" />
                    <span>Pick Another Branch on Map</span>
                  </button>
                </div>

                {/* Extracted Business Information */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-amber-400 shrink-0" />
                    <h2 className="text-base font-bold text-white">{restaurantName}</h2>
                  </div>
                  <p className="text-xs text-zinc-400 pl-6 leading-relaxed">
                    {location}
                  </p>
                </div>

                {/* Direct 5-Star Review Popup URL Target */}
                <div className="rounded-xl bg-[#0A0A0C] p-3 border border-zinc-800 space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Direct 5-Star Review Popup URL (Gujarat, India):
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={googleReviewUrl}
                      className="flex-1 rounded-lg border border-zinc-800 bg-[#121216] px-2.5 py-1.5 text-xs text-amber-400 font-mono truncate"
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
                      {copiedReviewUrl ? <Check className="h-3.5 w-3.5 text-amber-400" /> : <Copy className="h-3.5 w-3.5" />}
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
                      {copiedTapBroUrl ? <Check className="h-3.5 w-3.5 text-amber-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Instant Preview: Test Live Review Button */}
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
                        className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] pl-10 pr-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none placeholder-zinc-500"
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
                        className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] pl-10 pr-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none placeholder-zinc-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Owner Email Address {isDirectMode ? '(For 30-Day Monthly Performance Report)' : '(Verified Invite Email)'}
                  </label>
                  <div className="relative">
                    <Mail className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      readOnly={!isDirectMode && Boolean(email)}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. owner@gmail.com"
                      className={`w-full rounded-xl border border-zinc-800 pl-10 pr-3.5 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none placeholder-zinc-500 ${
                        !isDirectMode && email ? 'bg-zinc-900 text-zinc-300 cursor-not-allowed' : 'bg-[#0A0A0C]'
                      }`}
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
        </>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-zinc-500">
        <p>Tap-Bro • 1-Click NFC &amp; QR Tabletop Review Engine</p>
      </div>
    </div>
  );
}
export default StoreSetupView;
