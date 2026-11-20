'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  ChevronLeft,
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

type SetupStep = 'verify' | 'info' | 'map';

export function StoreSetupView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Current Step in the Linear Onboarding Pipeline
  const [step, setStep] = useState<SetupStep>('verify');

  // STEP 1: Temporary Mail & Password Verification
  const [email, setEmail] = useState('');
  const [tempPass, setTempPass] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [validatingInvite, setValidatingInvite] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  // STEP 2: Owner & Manager Info
  const [phone, setPhone] = useState('');
  const [adminPin, setAdminPin] = useState('');
  const [infoError, setInfoError] = useState<string | null>(null);

  // STEP 3: Store Branch Map for Google Review & Station Activation
  const [city, setCity] = useState<'gandhinagar' | 'ahmedabad'>('gandhinagar');
  const [setupMode, setSetupMode] = useState<'map' | 'direct_id'>('map');
  const [customStoreName, setCustomStoreName] = useState('');
  const [customPlaceIdInput, setCustomPlaceIdInput] = useState('');
  const [customLocation, setCustomLocation] = useState('');
  const [resolvingPlaceId, setResolvingPlaceId] = useState(false);
  const [directIdError, setDirectIdError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState('');
  const [predictions, setPredictions] = useState<PlaceSuggestion[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<PlaceSuggestion | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Locked Restaurant Details (Extracted from Map Selection)
  const [restaurantName, setRestaurantName] = useState('');
  const [location, setLocation] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [slug, setSlug] = useState('');
  const [liveTapBroLink, setLiveTapBroLink] = useState('');

  // UI helpers
  const [copiedReviewUrl, setCopiedReviewUrl] = useState(false);
  const [copiedTapBroUrl, setCopiedTapBroUrl] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Auto-verify if email and temp pass are in URL query params (clicked from invite email)
  useEffect(() => {
    const urlEmail = searchParams?.get('email');
    const urlPass = searchParams?.get('pass');
    const urlToken = searchParams?.get('token');

    if (urlEmail) setEmail(urlEmail.trim());
    if (urlPass) setTempPass(urlPass.trim());
    if (urlToken) setToken(urlToken.trim());

    if (urlEmail && urlPass) {
      setValidatingInvite(true);
      setInviteError(null);
      fetch('/api/setup/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: urlEmail.trim().toLowerCase(),
          tempPass: urlPass.trim().toUpperCase(),
          token: urlToken || undefined,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIsVerified(true);
            setInviteError(null);
            setStep('info'); // Auto-advance to Step 2: Info
          } else {
            setInviteError(data.error || 'Temporary pass is invalid or expired.');
          }
        })
        .catch(() => setInviteError('Could not validate temporary pass. Check your connection.'))
        .finally(() => setValidatingInvite(false));
    }
  }, [searchParams]);

  // STEP 1 Handler: Manual Invite Verification
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
        setStep('info'); // Advance to Step 2: Info
      } else {
        setInviteError(data.error || 'Invalid or expired temporary password for this email.');
      }
    } catch (err: any) {
      setInviteError(err.message || 'Validation network error. Try again.');
    } finally {
      setValidatingInvite(false);
    }
  };

  // STEP 2 Handler: Validate Owner Info & Move to Map
  const handleProceedToMap = (e: React.FormEvent) => {
    e.preventDefault();
    setInfoError(null);

    const cleanPhone = phone.trim();
    const cleanPin = adminPin.trim();

    if (!cleanPhone || cleanPhone.length < 8) {
      setInfoError('Please enter a valid contact phone number.');
      return;
    }
    if (!cleanPin || cleanPin.length < 4) {
      setInfoError('Please choose at least a 4-digit PIN for your manager dashboard.');
      return;
    }

    setStep('map'); // Advance to Step 3: Map & Review Setup
  };

  // Load default verified places for active city (Gandhinagar or Ahmedabad)
  useEffect(() => {
    if (step !== 'map' || isLocked || searchInput.trim().length >= 2) return;

    let isCurrent = true;
    setIsSearching(true);
    fetch(`/api/places/autocomplete?city=${city}`)
      .then((res) => res.json())
      .then((data) => {
        if (isCurrent && data.success && Array.isArray(data.predictions)) {
          setPredictions(data.predictions);
          if (data.predictions.length > 0) {
            setSelectedBranch(data.predictions[0]);
          }
        }
      })
      .catch((e) => console.warn('Could not load city places:', e))
      .finally(() => {
        if (isCurrent) setIsSearching(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [step, isLocked, city, searchInput]);

  // STEP 3 Handler: Search query with Gandhinagar & Ahmedabad bias
  useEffect(() => {
    if (step !== 'map' || isLocked) return;

    if (!searchInput.trim() || searchInput.trim().length < 2) {
      return;
    }

    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `/api/places/autocomplete?input=${encodeURIComponent(searchInput.trim())}&city=${city}`
        );
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
  }, [searchInput, isLocked, step, city]);

  // Direct Place ID / Google Link Lock Handler
  const handleLockWithDirectPlaceId = async (e: React.FormEvent) => {
    e.preventDefault();
    setDirectIdError(null);

    const rawInput = customPlaceIdInput.trim();
    const sName = customStoreName.trim();
    if (!sName) {
      setDirectIdError('Please enter your business or restaurant name.');
      return;
    }
    if (!rawInput) {
      setDirectIdError('Please enter a Google Place ID or Google Maps link.');
      return;
    }

    setResolvingPlaceId(true);
    try {
      let finalPlaceId = '';
      let finalReviewUrl = '';

      if (/^ChIJ[a-zA-Z0-9_-]{20,}$/.test(rawInput)) {
        finalPlaceId = rawInput;
        finalReviewUrl = `https://search.google.com/local/writereview?placeid=${finalPlaceId}`;
      } else if (rawInput.includes('placeid=')) {
        const match = rawInput.match(/placeid=([a-zA-Z0-9_-]+)/);
        if (match) {
          finalPlaceId = match[1];
          finalReviewUrl = `https://search.google.com/local/writereview?placeid=${finalPlaceId}`;
        }
      } else if (rawInput.includes('g.page') || rawInput.includes('writereview')) {
        finalReviewUrl = rawInput;
      } else {
        const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(rawInput)}`);
        const data = await res.json();
        if (data.success && data.predictions && data.predictions.length > 0) {
          const first = data.predictions[0];
          finalPlaceId = first.placeId;
          finalReviewUrl = first.reviewUrl;
        } else {
          finalReviewUrl = rawInput.startsWith('http') ? rawInput : `https://${rawInput}`;
        }
      }

      if (!finalReviewUrl) {
        finalReviewUrl = finalPlaceId
          ? `https://search.google.com/local/writereview?placeid=${finalPlaceId}`
          : formatGujaratReviewQuery(
              sName,
              customLocation.trim() || `${city === 'gandhinagar' ? 'Gandhinagar' : 'Ahmedabad'}, Gujarat`
            );
      }

      const loc =
        customLocation.trim() ||
        `${city === 'gandhinagar' ? 'Gandhinagar' : 'Ahmedabad'}, Gujarat, India`;
      const generatedSlug = generateSlug(sName, loc);
      const origin =
        typeof window !== 'undefined' ? window.location.origin : 'https://tapbro.vercel.app';

      setRestaurantName(sName);
      setLocation(loc);
      setPlaceId(finalPlaceId);
      setGoogleReviewUrl(finalReviewUrl);
      setSlug(generatedSlug);
      setLiveTapBroLink(`${origin}/r/${generatedSlug}`);
      setIsLocked(true);
      setSubmitError(null);
    } catch (err: any) {
      setDirectIdError(err.message || 'Could not verify Place ID. Please check the format.');
    } finally {
      setResolvingPlaceId(false);
    }
  };

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
    setSubmitError(null);
  };

  // Manual fallback lock if store not on map
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
  const handleCompleteSetup = async () => {
    setSubmitError(null);

    if (!restaurantName.trim()) {
      setSubmitError('Please select and lock your store branch on the map first.');
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
          email: email.trim().toLowerCase(),
          tempPass: tempPass.trim().toUpperCase(),
          token: token || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(`admin_${data.restaurant.slug}`, adminPin.trim());
        window.location.href = `/admin/${data.restaurant.slug}?welcome=1`;
      } else {
        setSubmitError(data.error || 'Failed to complete setup');
      }
    } catch (err: any) {
      setSubmitError(err.message || 'Network setup error');
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
          <span>Tap-Bro Tabletop Stand Setup</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {step === 'verify' && 'Verify Your Invitation Pass'}
          {step === 'info' && 'Manager & Contact Details'}
          {step === 'map' && 'Store Branch Map & Review Setup'}
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
          {step === 'verify' &&
            'Enter the temporary password sent to your business email to unlock your tabletop station setup.'}
          {step === 'info' &&
            `Invitation verified for ${email}. Set your contact phone number and 4-digit manager dashboard PIN.`}
          {step === 'map' &&
            'Search your restaurant name below to plot your Gujarat store branches on the map and activate your stand.'}
        </p>

        {/* 3-Step Guided Progress Tracker */}
        <div className="flex items-center justify-center gap-2 pt-3 max-w-sm mx-auto">
          <div
            className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
              step === 'verify' ? 'bg-amber-400' : 'bg-emerald-500'
            }`}
          />
          <div
            className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
              step === 'info' ? 'bg-amber-400' : step === 'map' ? 'bg-emerald-500' : 'bg-zinc-800'
            }`}
          />
          <div
            className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
              step === 'map' ? 'bg-amber-400' : 'bg-zinc-800'
            }`}
          />
        </div>
        <div className="flex justify-between text-[10px] text-zinc-500 max-w-sm mx-auto px-1">
          <span className={step === 'verify' ? 'text-amber-400 font-bold' : isVerified ? 'text-emerald-400 font-semibold' : ''}>
            1. Verify Pass
          </span>
          <span className={step === 'info' ? 'text-amber-400 font-bold' : step === 'map' ? 'text-emerald-400 font-semibold' : ''}>
            2. Owner Info
          </span>
          <span className={step === 'map' ? 'text-amber-400 font-bold' : ''}>
            3. Store Map &amp; Launch
          </span>
        </div>
      </div>

      {/* Global Error Banners */}
      {(inviteError || infoError || submitError) && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300 animate-fade-in">
          {inviteError || infoError || submitError}
        </div>
      )}

      {/* =========================================================================
          STEP 1: Temporary Mail & Password Verification
          ========================================================================= */}
      {step === 'verify' && (
        <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-5 sm:p-6 space-y-5 shadow-2xl animate-fade-in">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Lock className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Step 1 • Verify Business Invitation
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
        </div>
      )}

      {/* =========================================================================
          STEP 2: Owner & Manager Info (Phone Number + 4-Digit Manager PIN)
          ========================================================================= */}
      {step === 'info' && (
        <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-5 sm:p-6 space-y-5 shadow-2xl animate-fade-in">
          {/* Verified Badge */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center justify-between text-xs text-emerald-300">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                Verified Invitation for <strong>{email}</strong>
              </span>
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
              Pass: {tempPass.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                Step 2 • Owner Contact &amp; Manager Security
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep('verify')}
              className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition"
            >
              <ChevronLeft className="h-3 w-3" />
              <span>Change Pass</span>
            </button>
          </div>

          <form onSubmit={handleProceedToMap} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Contact Phone Number *
              </label>
              <div className="relative">
                <Phone className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  autoFocus
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] pl-10 pr-3.5 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Used for instant WhatsApp/SMS review notifications and hardware support.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                <span>Create Manager PIN (Dashboard Password) *</span>
                <span className="text-[10px] text-zinc-400 font-mono">4 to 8 digits</span>
              </label>
              <div className="relative">
                <KeyRound className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  maxLength={8}
                  autoComplete="new-password"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] pl-10 pr-3.5 py-3 text-sm text-white placeholder-zinc-500 font-mono tracking-widest focus:border-amber-400 focus:outline-none transition"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-1">
                Only you will use this PIN to log into your manager dashboard and view analytics.
              </p>
            </div>

            <button
              type="submit"
              className="btn-gold w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-sm shadow-xl active:scale-95 transition"
            >
              <span>Next: Select Store on Map ➔</span>
            </button>
          </form>
        </div>
      )}

      {/* =========================================================================
          STEP 3: Store Branch Map for Google Review & All Setup
          ========================================================================= */}
      {step === 'map' && (
        <div className="space-y-4 animate-fade-in">
          {/* Header Bar with Back to Info */}
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-amber-400" />
              <span>Step 3 • Find &amp; Lock Your Store Branch</span>
            </span>
            <button
              type="button"
              onClick={() => setStep('info')}
              className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 transition"
            >
              <ChevronLeft className="h-3 w-3" />
              <span>Edit Phone / PIN</span>
            </button>
          </div>

          {!isLocked ? (
            <>
              {/* Mode Switcher: Detailed Map vs Direct Place ID */}
              <div className="grid grid-cols-2 gap-2 bg-[#0A0A0C] p-1 rounded-2xl border border-zinc-800 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSetupMode('map')}
                  className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    setupMode === 'map'
                      ? 'bg-amber-400 text-black font-bold shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Detailed City Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSetupMode('direct_id')}
                  className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                    setupMode === 'direct_id'
                      ? 'bg-amber-400 text-black font-bold shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Enter Place ID Directly</span>
                </button>
              </div>

              {setupMode === 'map' ? (
                <>
                  {/* City Selector Pills */}
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCity('gandhinagar');
                          setSearchInput('');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          city === 'gandhinagar'
                            ? 'bg-amber-400 text-black shadow-md'
                            : 'border border-zinc-800 bg-[#121216] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <MapPin className="h-3 w-3" />
                        <span>Gandhinagar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCity('ahmedabad');
                          setSearchInput('');
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          city === 'ahmedabad'
                            ? 'bg-amber-400 text-black shadow-md'
                            : 'border border-zinc-800 bg-[#121216] text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Navigation className="h-3 w-3" />
                        <span>Ahmedabad</span>
                      </button>
                    </div>

                    <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                      {city === 'gandhinagar' ? 'Kudasan • Infocity • Sargasan' : 'SG Hwy • Bodakdev • Vastrapur'}
                    </span>
                  </div>

                  {/* Search Box */}
                  <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-4 sm:p-5 space-y-3 shadow-xl">
                    <label className="block text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Search className="h-4 w-4 text-amber-400" />
                        <span>Search in {city === 'gandhinagar' ? 'Gandhinagar' : 'Ahmedabad'}</span>
                      </span>
                      <span className="text-[10px] text-emerald-400 font-mono">
                        ✓ Verified Google Place IDs
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
                        placeholder={`e.g. ${city === 'gandhinagar' ? '"Honest", "Eat Punjab", "Karnavati", "Gwalia"...' : '"Honest", "Hocco", "Jassi De Parathe"...'}`}
                        className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] pl-10 pr-10 py-3 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition"
                      />
                      {isSearching && (
                        <RefreshCw className="h-4 w-4 text-amber-400 absolute right-3.5 top-3.5 animate-spin" />
                      )}
                    </div>

                    {/* Quick brand pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none pt-1">
                      <span className="text-zinc-500 shrink-0 font-medium">Quick:</span>
                      {(city === 'gandhinagar'
                        ? ['Honest', 'Eat Punjab', 'Karnavati', 'Gwalia', 'Havmor', "La Pino'z", 'Tea Post', 'Sankalp', 'Marutinandan']
                        : ['Honest', 'Hocco Kitchen', 'Iscon Gathiya', 'Manek Chowk', 'Jassi De Parathe', 'Four Points']
                      ).map((brand) => (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => setSearchInput(brand)}
                          className="px-2.5 py-1 rounded-full border border-zinc-800 bg-[#0A0A0C] text-zinc-300 hover:text-white hover:border-amber-400/50 shrink-0 transition text-[11px]"
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Store Branch Map */}
                  <StoreBranchMap
                    branches={predictions}
                    selectedBranch={selectedBranch}
                    onSelectBranch={handleSelectPlace}
                    isLoading={isSearching}
                    city={city}
                    onCityChange={setCity}
                  />

                  {/* Branch Store Cards (Tappable Pins / Cards) */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between px-1">
                      <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-amber-400" />
                        <span>
                          {predictions.length > 0
                            ? `${city === 'gandhinagar' ? 'Gandhinagar' : 'Ahmedabad'} Locations (${predictions.length})`
                            : 'Select a brand above to view branches'}
                        </span>
                      </h3>
                      <span className="text-[10px] text-zinc-500">Tap card to lock</span>
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
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs sm:text-sm font-bold text-white truncate">
                                      {p.branchName || p.name}
                                    </p>
                                    {p.placeId && p.placeId.startsWith('ChIJ') && (
                                      <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-mono shrink-0">
                                        ✓ Place ID
                                      </span>
                                    )}
                                  </div>
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
                        Type your restaurant name above to plot branch locations on the map.
                      </div>
                    )}

                    {/* Manual fallback button */}
                    {searchInput.trim().length >= 2 && (
                      <button
                        type="button"
                        onClick={handleManualLock}
                        className="w-full rounded-xl border border-zinc-800 bg-[#121216] py-2.5 px-3 text-xs font-semibold text-zinc-400 hover:text-white transition flex items-center justify-center gap-1.5"
                      >
                        <span>Branch not in list? Lock &quot;{searchInput.trim()}&quot; in {city === 'gandhinagar' ? 'Gandhinagar' : 'Ahmedabad'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* OPTION 2: Enter Place ID Directly */
                <form onSubmit={handleLockWithDirectPlaceId} className="rounded-2xl border border-zinc-800 bg-[#121216] p-5 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                    <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-amber-400" />
                      <span>Direct Google Place ID Connection</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">
                      100% 5-Star Dialog Popup
                    </span>
                  </div>

                  {directIdError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                      {directIdError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-300">
                      Restaurant / Business Name:
                    </label>
                    <input
                      type="text"
                      required
                      value={customStoreName}
                      onChange={(e) => setCustomStoreName(e.target.value)}
                      placeholder='e.g. "Honest Restaurant", "Eat Punjab"'
                      className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-zinc-300">
                      Area / City:
                    </label>
                    <input
                      type="text"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder='e.g. "Kudasan, Gandhinagar" or "SG Highway, Ahmedabad"'
                      className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-zinc-300">
                        Google Place ID or Review Link:
                      </label>
                      <a
                        href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5 font-medium"
                      >
                        <span>🔍 Find My Place ID on Google Tool</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                    <input
                      type="text"
                      required
                      value={customPlaceIdInput}
                      onChange={(e) => setCustomPlaceIdInput(e.target.value)}
                      placeholder='e.g. "ChIJJ-nuYQArXDkRClUWF_ENHDM" or "https://g.page/r/..."'
                      className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-amber-400 focus:outline-none transition font-mono"
                    />
                    <p className="text-[11px] text-zinc-400 leading-relaxed pt-1">
                      💡 <strong>How to find your Place ID in 10 seconds:</strong> Click the &quot;Find My Place ID&quot; link above, search your business name on Google&apos;s official tool, and copy the code starting with <code>ChIJ...</code>.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={resolvingPlaceId}
                    className="btn-gold w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-xs sm:text-sm shadow-xl active:scale-95 transition disabled:opacity-50"
                  >
                    {resolvingPlaceId ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Verifying Place ID...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 fill-current" />
                        <span>Lock &amp; Connect Direct Review Link ➔</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          ) : (
            /* LOCKED BRANCH: Review Target Details & Station Activation */
            <div className="space-y-4 animate-fade-in">
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
                <div className="rounded-xl bg-[#0A0A0C] p-3 border border-zinc-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider block">
                      Target Google Review URL:
                    </span>
                    {googleReviewUrl && (googleReviewUrl.includes('writereview') || googleReviewUrl.includes('/review')) ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        ✓ Direct 5-Star Form
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        Map Search Fallback
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={googleReviewUrl}
                      onChange={(e) => {
                        const val = e.target.value.trim();
                        if (/^ChIJ[a-zA-Z0-9_-]{20,}$/.test(val)) {
                          setGoogleReviewUrl(`https://search.google.com/local/writereview?placeid=${val}`);
                        } else {
                          setGoogleReviewUrl(e.target.value);
                        }
                      }}
                      placeholder="https://search.google.com/local/writereview?placeid=..."
                      className="flex-1 rounded-lg border border-zinc-800 bg-[#121216] px-2.5 py-2 text-xs text-amber-400 font-mono truncate focus:border-amber-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (googleReviewUrl) window.open(googleReviewUrl, '_blank');
                      }}
                      className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition shrink-0 flex items-center gap-1"
                      title="Test if link opens 5-star review dialog"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Test</span>
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(googleReviewUrl);
                          setCopiedReviewUrl(true);
                          setTimeout(() => setCopiedReviewUrl(false), 2000);
                        } catch {}
                      }}
                      className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-2 text-xs font-semibold text-zinc-300 hover:text-white transition shrink-0"
                    >
                      {copiedReviewUrl ? <Check className="h-3.5 w-3.5 text-amber-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-tight">
                    💡 <strong>Pro-Tip:</strong> You can paste your Google Place ID or Google &quot;Ask for reviews&quot; link here so customers immediately get the 5-star rating popup!
                  </p>
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

              {/* Station Summary & Final Activation */}
              <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-5 space-y-4 shadow-xl">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>Ready to Launch Review Station</span>
                  </span>
                  <span className="text-zinc-400 font-mono text-[11px]">
                    PIN: •••• | {phone}
                  </span>
                </div>

                <div className="text-xs text-zinc-400 space-y-1">
                  <p>• Station will be linked to <strong>{restaurantName}</strong> ({location})</p>
                  <p>• Single-use pass <strong>{tempPass.toUpperCase()}</strong> will be redeemed for <strong>{email}</strong></p>
                  <p>• You will be redirected straight to your live manager dashboard</p>
                </div>

                <button
                  type="button"
                  onClick={handleCompleteSetup}
                  disabled={submitting}
                  className="btn-gold flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold transition text-sm disabled:opacity-50 shadow-xl active:scale-95"
                >
                  <Sparkles className="h-4 w-4 fill-current" />
                  <span>{submitting ? 'Activating Stand...' : 'Activate Tabletop Station 🚀'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-zinc-500">
        <p>Tap-Bro • 1-Click NFC &amp; QR Tabletop Review Engine</p>
      </div>
    </div>
  );
}

export default StoreSetupView;
