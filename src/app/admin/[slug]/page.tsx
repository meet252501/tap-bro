'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Store,
  Radio,
  Utensils,
  Sparkles,
  Link as LinkIcon,
  Save,
  Copy,
  Check,
  ExternalLink,
  Plus,
  Trash2,
  Phone,
  Mail,
  ShieldCheck,
  ArrowLeft,
  Eye,
  KeyRound,
  Lock,
  BookOpen,
  MessageSquare,
  Flame,
  ChevronRight,
  Sliders,
  QrCode,
} from 'lucide-react';
import { Restaurant, AIProviderType } from '@/types/restaurant';
import { DishCategory, ReviewLanguage, ReviewTone } from '@/types/review';

function RestaurantAdminDashboardContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = typeof params?.slug === 'string' ? params.slug : '';
  const isNew = searchParams?.get('new') === '1';

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [tableCount, setTableCount] = useState(10);
  const [googleReviewUrl, setGoogleReviewUrl] = useState('');
  const [menuCategories, setMenuCategories] = useState<DishCategory[]>([]);
  const [aiProvider, setAiProvider] = useState<AIProviderType>('nvidia');
  const [adminPin, setAdminPin] = useState('');

  // NFC & Station Links
  const [destinationUrl, setDestinationUrl] = useState<string>('');
  const [copiedNfc, setCopiedNfc] = useState(false);
  const [activeTab, setActiveTab] = useState<'nfc' | 'details' | 'menu' | 'simulator' | 'staff'>('nfc');

  // Review Simulator State
  const [simDish, setSimDish] = useState('');
  const [simLang, setSimLang] = useState<ReviewLanguage>('hinglish');
  const [simTone, setSimTone] = useState<ReviewTone>('flavorful');
  const [simDraft, setSimDraft] = useState('');
  const [simulating, setSimulating] = useState(false);

  // Auth & Access Gate State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authPinInput, setAuthPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [isVerifyingAuth, setIsVerifyingAuth] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const storedPin = localStorage.getItem(`admin_${slug}`) || '';
    const urlPass = searchParams?.get('pass') || '';
    if (storedPin) {
      setAdminPin(storedPin);
      setIsAuthenticated(true);
    } else if (urlPass) {
      setAdminPin(urlPass);
      localStorage.setItem(`admin_${slug}`, urlPass);
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    // Fetch Restaurant Details
    fetch(`/api/restaurants/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.restaurant) {
          const r = data.restaurant;
          setRestaurant(r);
          setName(r.name);
          setTagline(r.tagline || '');
          setCuisine(r.cuisine || '');
          setTableCount(r.tableCount || 10);
          setGoogleReviewUrl(r.googleReviewUrl || '');
          setMenuCategories(r.menuCategories || []);
          setAiProvider(r.aiProvider || 'nvidia');
          if (r.menuCategories?.[0]?.items?.[0]) {
            setSimDish(r.menuCategories[0].items[0]);
          }
        } else {
          setError(data.error || 'Restaurant not found');
        }
      })
      .catch(() => setError('Error loading restaurant details'))
      .finally(() => setLoading(false));

    // Determine diner link (strictly avoid localhost for NFC hardware programming)
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const publicOrigin = isLocal ? 'https://tapbro.vercel.app' : window.location.origin;
    setDestinationUrl(`${publicOrigin}/r/${slug}`);
  }, [slug, searchParams]);

  const handleUnlockWithPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPinInput.trim()) return;
    setIsVerifyingAuth(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: restaurant?.phone || restaurant?.email || slug, pinOrId: authPinInput.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(`admin_${slug}`, authPinInput.trim());
        setAdminPin(authPinInput.trim());
        setIsAuthenticated(true);
      } else {
        setAuthError(data.error || 'Access Denied: Invalid PIN or Temporary Pass.');
      }
    } catch {
      setAuthError('Connection error during verification.');
    } finally {
      setIsVerifyingAuth(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!adminPin) {
      const pinPrompt = prompt('Please enter your Admin PIN to save changes:');
      if (!pinPrompt) return;
      setAdminPin(pinPrompt);
      localStorage.setItem(`admin_${slug}`, pinPrompt);
    }

    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/restaurants/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPin: adminPin || localStorage.getItem(`admin_${slug}`),
          name,
          tagline,
          cuisine,
          tableCount: Number(tableCount) || 10,
          googleReviewUrl,
          menuCategories,
          aiProvider,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert(data.error || 'Failed to save changes. Verify your Admin PIN.');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyNfcUrl = () => {
    if (!destinationUrl) return;
    navigator.clipboard.writeText(destinationUrl);
    setCopiedNfc(true);
    setTimeout(() => setCopiedNfc(false), 3000);
  };

  const handleShareWhatsApp = () => {
    const text = `🍽️ Tap-Bro Tabletop Review Stand for *${name}*:\nTap your phone on the stand or open:\n${destinationUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownloadQr = () => {
    const a = document.createElement('a');
    a.href = `/api/restaurants/${slug}/qr`;
    a.download = `${slug}-tabletop-qr.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRunSimulator = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/review-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: simLang,
          tone: simTone,
          ratings: { food: 5, service: 5, ambiance: 4, overall: 5 },
          selectedDishes: simDish ? [simDish] : ['Special Thali'],
          customerNotes: 'Great food and taste',
          restaurantName: name,
          restaurantSlug: slug,
        }),
      });
      const data = await res.json();
      if (data.draft) {
        setSimDraft(data.draft);
      }
    } catch {
      setSimDraft('Simulated AI draft generated.');
    } finally {
      setSimulating(false);
    }
  };

  const handleAddCategory = () => {
    const categoryName = prompt('Enter new menu category name:');
    if (!categoryName) return;
    setMenuCategories([
      ...menuCategories,
      { name: categoryName.trim(), icon: '🍽️', items: [] },
    ]);
  };

  const handleRemoveCategory = (catIndex: number) => {
    if (confirm('Delete this entire category and its dishes?')) {
      setMenuCategories(menuCategories.filter((_, i) => i !== catIndex));
    }
  };

  const handleAddDish = (catIndex: number) => {
    const dishName = prompt('Enter dish name:');
    if (!dishName) return;
    const updated = [...menuCategories];
    updated[catIndex].items.push(dishName.trim());
    setMenuCategories(updated);
  };

  const handleRemoveDish = (catIndex: number, dishIndex: number) => {
    const updated = [...menuCategories];
    updated[catIndex].items.splice(dishIndex, 1);
    setMenuCategories(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          <p className="text-xs font-medium text-zinc-400">Loading Tap-Bro...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-4">
        <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-6 text-center space-y-4 max-w-sm w-full">
          <p className="text-sm text-red-400">{error || 'Restaurant not found'}</p>
          <button
            onClick={() => router.push('/admin')}
            className="w-full rounded-xl btn-gold py-2.5 text-xs font-semibold"
          >
            Return to Admin Login
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-4 selection:bg-zinc-700 selection:text-white relative">
        <div className="ambient-bg pointer-events-none fixed inset-0 z-0" />
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-zinc-800 bg-[#121216] p-6 space-y-4 animate-fade-in text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Partner Authentication Required</h2>
            <p className="text-xs text-zinc-400 mt-1">
              This manager portal for <span className="text-white font-semibold">{name || slug}</span> is strictly invite-only. Enter your PIN or sign in via your email link.
            </p>
          </div>

          {authError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5 text-xs text-red-300">
              {authError}
            </div>
          )}

          <form onSubmit={handleUnlockWithPin} className="space-y-3 text-left">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-300 mb-1">
                Manager PIN or Temporary Pass
              </label>
              <div className="relative">
                <KeyRound className="h-4 w-4 text-zinc-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={authPinInput}
                  onChange={(e) => setAuthPinInput(e.target.value)}
                  placeholder="Enter 4-digit PIN or TAP-XXXX"
                  className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] pl-9 pr-3 py-2.5 text-sm text-white focus:border-zinc-500 focus:outline-none placeholder-zinc-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifyingAuth || !authPinInput.trim()}
              className="w-full btn-gold rounded-xl py-2.5 text-xs font-semibold transition disabled:opacity-50"
            >
              {isVerifyingAuth ? 'Verifying...' : 'Unlock Dashboard'}
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] py-2 text-xs font-medium text-zinc-400 hover:text-white transition"
            >
              Sign In via Email Link (Partner Portal)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-white selection:bg-zinc-700 selection:text-white relative flex flex-col justify-between">
      <div className="ambient-bg pointer-events-none fixed inset-0 z-0" />

      {/* Phone-Optimized Top App Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800 bg-[#0A0A0C]/95 backdrop-blur-2xl px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => router.push('/admin')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-[#121216] text-zinc-400 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">Tap-Bro</span>
                <span className="text-zinc-600">•</span>
                <h1 className="text-sm font-bold text-white truncate">{name}</h1>
              </div>
              <p className="text-[10px] text-zinc-400 truncate">
                ID: <span className="font-mono text-zinc-300">{restaurant.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.open(`/r/${slug}`, '_blank')}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-800 bg-[#121216] text-zinc-400 hover:text-white transition"
              title="Preview Diner View"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                savedSuccess
                  ? 'bg-zinc-800 text-white border border-zinc-600'
                  : 'btn-gold'
              }`}
            >
              {savedSuccess ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
              <span>{savedSuccess ? 'Saved' : saving ? 'Saving' : 'Save'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Screen Content (Max Width 460px) */}
      <main className="mx-auto w-full max-w-md px-4 pt-3 pb-24 relative z-10 space-y-4">
        {/* Onboarding Alert for New Businesses */}
        {isNew && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-200 flex items-start gap-2.5 animate-fade-in">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-emerald-300 font-semibold mb-0.5">
                Setup Complete! Station is Live.
              </strong>
              Your tabletop review station is active. Test your Google review link and add dishes below.
            </div>
          </div>
        )}

        {/* Quick Phone Stats Widget */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="glass-card rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Total Reviews
              </span>
              <p className="text-xl font-bold text-white mt-0.5">
                {restaurant.totalReviewsGenerated || 0}
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          <div className="glass-card rounded-2xl p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Dining Tables
              </span>
              <p className="text-xl font-bold text-white mt-0.5">
                {tableCount} Stands
              </p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300">
              <Radio className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Tab 1: Tabletop NFC & QR Stand Hub */}
        {activeTab === 'nfc' && (
          <div className="space-y-4 animate-fade-in">
            {/* Tabletop Acrylic Stand Preview Card */}
            <div className="glass-card rounded-2xl p-5 space-y-4 shadow-xl border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="h-4 w-4" />
                  <span>Tabletop NFC &amp; QR Stand</span>
                </span>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                  Ready to Tap
                </span>
              </div>

              <div>
                <h2 className="text-base sm:text-lg font-bold text-white">{name} Table Stands</h2>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Guests tap their phone on the NFC stand or scan the QR code to write authentic reviews with AI.
                </p>
              </div>

              {/* QR Stand Preview */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#0B1326] border border-slate-800 space-y-3 shadow-inner">
                <div className="p-3.5 bg-white rounded-2xl shadow-2xl border-2 border-indigo-400/40">
                  <img
                    src={`/api/restaurants/${slug}/qr`}
                    alt={`${name} QR Code`}
                    className="w-36 h-36 object-contain"
                  />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-xs font-bold text-white flex items-center justify-center gap-1">
                    <QrCode className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Tabletop Review Stand QR</span>
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono break-all max-w-xs">
                    {destinationUrl}
                  </p>
                </div>
              </div>

              {/* Fast Action Buttons: WhatsApp Share & Download */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-3 text-xs font-semibold shadow-md active:scale-95 transition"
                >
                  <span>Share on WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 py-2.5 px-3 text-xs font-semibold active:scale-95 transition"
                >
                  <span>Download Stand QR</span>
                </button>
              </div>

              {/* URL Copy Bar */}
              <div className="rounded-xl bg-[#0B1326] p-3 border border-slate-800 space-y-1.5">
                <span className="text-[11px] text-slate-400 font-medium block">
                  Direct Station URL:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={destinationUrl}
                    className="flex-1 rounded-lg border border-slate-700 bg-[#0F172A] px-2.5 py-2 text-xs text-white font-mono truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyNfcUrl}
                    className="btn-gold rounded-lg px-3 py-2 text-xs font-bold flex items-center gap-1 shrink-0"
                  >
                    {copiedNfc ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedNfc ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Table Count Setting */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Active Table Stands</span>
                  <p className="text-[11px] text-slate-400">Number of dining tables</p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={tableCount}
                  onChange={(e) => setTableCount(Number(e.target.value))}
                  className="w-16 rounded-xl border border-slate-700 bg-[#0B1326] px-2.5 py-2 text-sm text-white text-center font-bold focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400/30 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => window.open(`/r/${slug}`, '_blank')}
                className="btn-gold w-full flex items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-xs sm:text-sm transition"
              >
                <Eye className="h-4 w-4" />
                <span>Test Live Diner Flow on Phone</span>
              </button>
            </div>

            {/* Quick NFC Programming Guide for Mobile */}
            <div className="glass-card rounded-2xl p-4 space-y-3 shadow-lg">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                <Radio className="h-3.5 w-3.5 text-indigo-400" />
                <span>Program NFC Tag from Phone</span>
              </h3>
              <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside leading-relaxed">
                <li>Download free <strong className="text-white">NFC Tools</strong> app on your iPhone or Android.</li>
                <li>Tap <strong className="text-white">Write</strong> ➔ <strong className="text-white">Add a record</strong> ➔ <strong className="text-white">URL</strong>.</li>
                <li>Paste the copied tabletop URL above.</li>
                <li>Hold phone against your tabletop NFC puck/card to write!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Tab 2: Restaurant Profile & Google Link */}
        {activeTab === 'details' && (
          <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-in shadow-xl border border-slate-800">
            <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
              Restaurant Profile & Link
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Restaurant Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-[#0B1326] px-3.5 py-2.5 text-base sm:text-xs text-white focus:border-indigo-400 focus:outline-none transition-all placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cuisine / Category
                </label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-[#0B1326] px-3.5 py-2.5 text-base sm:text-xs text-white focus:border-indigo-400 focus:outline-none transition-all placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admin PIN (4-digit)
                </label>
                <input
                  type="password"
                  maxLength={8}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-[#0B1326] px-3.5 py-2.5 text-base sm:text-xs text-white focus:border-indigo-400 focus:outline-none font-mono transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tagline / Catchphrase
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-[#0B1326] px-3.5 py-2.5 text-base sm:text-xs text-white focus:border-indigo-400 focus:outline-none transition-all placeholder-slate-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <LinkIcon className="h-3 w-3 text-cyan-400" />
                    <span>Google Review URL</span>
                  </label>
                  {googleReviewUrl && (
                    <a
                      href={googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-cyan-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>Test</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
                <input
                  type="url"
                  value={googleReviewUrl}
                  onChange={(e) => setGoogleReviewUrl(e.target.value)}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  className="w-full rounded-xl border border-slate-700 bg-[#0B1326] px-3.5 py-2.5 text-base sm:text-xs text-white focus:border-indigo-400 focus:outline-none font-mono transition-all placeholder-slate-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="btn-gold w-full rounded-xl py-3 text-xs font-bold transition"
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Menu & Dishes */}
        {activeTab === 'menu' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                  Menu & Dishes
                </h2>
                <p className="text-[11px] text-slate-400">
                  Diners pick these dishes in their review.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCategory}
                className="btn-gold flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Category</span>
              </button>
            </div>

            <div className="space-y-3">
              {menuCategories.map((cat, catIndex) => (
                <div
                  key={catIndex}
                  className="glass-card rounded-2xl p-4 space-y-2.5 shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{cat.icon || '🍽️'}</span>
                      <h3 className="text-xs font-bold text-white">{cat.name}</h3>
                      <span className="text-[10px] text-slate-500 font-mono">({cat.items.length})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAddDish(catIndex)}
                        className="rounded-lg border border-indigo-400/30 bg-indigo-400/10 px-2.5 py-1 text-[11px] text-indigo-300 hover:text-white flex items-center gap-0.5 transition"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(catIndex)}
                        className="text-slate-500 hover:text-red-400 p-1 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cat.items.map((dish, dishIndex) => (
                      <span
                        key={dishIndex}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-700 px-3 py-1 text-[11px] text-slate-200"
                      >
                        <span>{dish}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDish(catIndex, dishIndex)}
                          className="text-slate-400 hover:text-red-400 text-[10px] ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {cat.items.length === 0 && (
                      <span className="text-[11px] text-slate-500 italic">
                        Empty category. Tap &quot;Add&quot; to insert items.
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className="btn-gold w-full rounded-xl py-3 text-xs font-bold transition"
            >
              {saving ? 'Saving...' : 'Save Menu Changes'}
            </button>
          </div>
        )}

        {/* Tab 4: AI Review Simulator (On Phone) */}
        {activeTab === 'simulator' && (
          <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-in shadow-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                AI Review Simulator
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Test how Tap-Bro AI crafts reviews for your restaurant in English or Hinglish right on your phone.
            </p>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Sample Dish
                </label>
                <input
                  type="text"
                  value={simDish}
                  onChange={(e) => setSimDish(e.target.value)}
                  placeholder="e.g. Banarasi Tamatar Chaat"
                  className="w-full rounded-xl border border-slate-700 bg-[#0B1326] px-3.5 py-2 text-xs text-white focus:border-indigo-400 focus:outline-none transition-all placeholder-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Language</label>
                  <select
                    value={simLang}
                    onChange={(e) => setSimLang(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-[#0B1326] px-2.5 py-2 text-xs text-white focus:border-indigo-400 focus:outline-none transition-all"
                  >
                    <option value="hinglish">🇮🇳 Hinglish</option>
                    <option value="en">🇬🇧 English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Tone</label>
                  <select
                    value={simTone}
                    onChange={(e) => setSimTone(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-700 bg-[#0B1326] px-2.5 py-2 text-xs text-white focus:border-indigo-400 focus:outline-none transition-all"
                  >
                    <option value="flavorful">Flavorful</option>
                    <option value="concise">Quick/Crisp</option>
                    <option value="hospitality">Warm</option>
                    <option value="constructive">Balanced</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunSimulator}
                disabled={simulating}
                className="btn-gold w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold transition text-xs shadow-md"
              >
                <Sparkles className="h-4 w-4" />
                <span>{simulating ? 'Crafting Draft...' : 'Generate Sample Review'}</span>
              </button>

              {simDraft && (
                <div className="rounded-2xl border border-indigo-500/30 bg-[#0B1326] p-4 space-y-1.5 animate-fade-in shadow-inner">
                  <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wider block">
                    AI Review Draft:
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed italic">
                    &quot;{simDraft}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Staff Tabletop Script */}
        {activeTab === 'staff' && (
          <div className="glass-card rounded-2xl p-5 space-y-4 animate-fade-in shadow-xl border border-slate-800">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
                Staff Cheat Sheet & Script
              </h2>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Show this to your service staff and captains on their phones:
            </p>

            <div className="space-y-3">
              <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-4 space-y-1.5 shadow-sm">
                <span className="text-[11px] font-bold text-indigo-300 uppercase block">
                  ⭐ 10-Second Waiter Script:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed italic bg-[#0B1326] p-3 rounded-xl border border-slate-800">
                  &quot;Sir / Ma&apos;am, if you enjoyed our {simDish || 'food'}, please tap your phone on this tabletop stand! Tap-Bro AI will craft your review in 10 seconds without typing.&quot;
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-300 leading-relaxed">
                <h4 className="font-semibold text-white">Guidelines:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-400">
                  <li>Present when handing over the bill or after desserts.</li>
                  <li>Tap phone on top of the NFC card (top rear on iPhone, middle rear on Android).</li>
                  <li>Reassure diners that AI drafts the review for them in 1 tap!</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Phone Bottom Tab Bar (Thumb Navigation) */}
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#0B1326]/95 backdrop-blur-2xl border-t border-slate-800 pb-safe shadow-2xl">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {[
            { id: 'nfc', label: 'NFC Hub', icon: Radio },
            { id: 'details', label: 'Profile', icon: Store },
            { id: 'menu', label: 'Menu', icon: Utensils },
            { id: 'simulator', label: 'Simulator', icon: Sparkles },
            { id: 'staff', label: 'Staff Guide', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                  isActive
                    ? 'text-indigo-400 bg-indigo-500/10 ring-1 ring-indigo-500/30 font-bold scale-105 shadow-sm'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 mb-0.5 ${isActive ? 'stroke-[2.5] text-indigo-400' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function RestaurantAdminDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B1326] flex items-center justify-center p-4 text-indigo-400 text-xs">Loading Tap-Bro Portal...</div>}>
      <RestaurantAdminDashboardContent />
    </Suspense>
  );
}
