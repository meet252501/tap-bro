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
  QrCode,
  HelpCircle,
  Star,
  Clock,
  Send,
  Search,
  BarChart3,
  Calendar,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { Restaurant, AIProviderType, DinerReviewRecord } from '@/types/restaurant';
import { DishCategory, ReviewLanguage, ReviewTone } from '@/types/review';
import { computeReviewAnalytics } from '@/lib/analytics';

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
  const [showGoogleHelp, setShowGoogleHelp] = useState(false);

  // NFC & Station Links
  const [destinationUrl, setDestinationUrl] = useState<string>('');
  const [copiedNfc, setCopiedNfc] = useState(false);
  const [activeTab, setActiveTab] = useState<'reviews' | 'menu' | 'profile' | 'stands' | 'staff'>('reviews');

  // Review Simulator State
  const [simDish, setSimDish] = useState('');
  const [simLang, setSimLang] = useState<ReviewLanguage>('hinglish');
  const [simTone, setSimTone] = useState<ReviewTone>('flavorful');
  const [simDraft, setSimDraft] = useState('');
  const [simulating, setSimulating] = useState(false);

  // Review Analytics & 30-Day Retention Cycle State
  const [reviewViewMode, setReviewViewMode] = useState<'feed' | 'trends' | 'cycle'>('feed');
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [isResettingCycle, setIsResettingCycle] = useState(false);
  const [cycleResetMessage, setCycleResetMessage] = useState<string | null>(null);

  const handleTriggerMonthlyReset = async () => {
    if (!window.confirm('This will email the 30-day performance report to your registered email, archive review counts, and reset the cycle to Day 1 with clean storage. Continue?')) {
      return;
    }
    setIsResettingCycle(true);
    setCycleResetMessage(null);
    try {
      const res = await fetch(`/api/restaurants/${slug}/monthly-report`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setCycleResetMessage(data.message || 'Report sent and cycle reset!');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setCycleResetMessage(data.error || 'Failed to trigger monthly report');
      }
    } catch {
      setCycleResetMessage('Network error triggering report');
    } finally {
      setIsResettingCycle(false);
    }
  };

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
          const r: Restaurant = data.restaurant;
          setRestaurant(r);
          setName(r.name);
          setTagline(r.tagline || '');
          setCuisine(r.cuisine || '');
          setTableCount(r.tableCount || 10);
          setGoogleReviewUrl(r.googleReviewUrl || '');
          setMenuCategories(r.menuCategories || []);
          setAiProvider(r.aiProvider || 'nvidia');
          if (r.adminPin) setAdminPin(r.adminPin);

          // Default sample dish for simulator
          if (r.menuCategories?.length > 0 && r.menuCategories[0].items?.length > 0) {
            setSimDish(r.menuCategories[0].items[0]);
          }
        } else {
          setError(data.error || 'Restaurant not found');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));

    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      setDestinationUrl(`${origin}/r/${slug}`);
    }
  }, [slug, searchParams]);

  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsVerifyingAuth(true);

    fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: slug, pinOrId: authPinInput.trim() }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.restaurant) {
          setAdminPin(authPinInput.trim());
          localStorage.setItem(`admin_${slug}`, authPinInput.trim());
          setIsAuthenticated(true);
        } else {
          setAuthError(data.error || 'Incorrect PIN or Temporary Pass.');
        }
      })
      .catch(() => setAuthError('Network error verifying credentials.'))
      .finally(() => setIsVerifyingAuth(false));
  };

  const handleSave = async (customCategories?: DishCategory[]) => {
    if (!slug) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/restaurants/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPin,
          name,
          tagline,
          cuisine,
          tableCount,
          googleReviewUrl,
          menuCategories: customCategories || menuCategories,
          aiProvider,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSavedSuccess(true);
        if (data.restaurant) {
          setRestaurant(data.restaurant);
        }
        setTimeout(() => setSavedSuccess(false), 2500);
      } else {
        alert(data.error || 'Failed to save changes');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = () => {
    const catName = prompt('Enter new category name (e.g. Starters, Main Course, Desserts):');
    if (!catName || !catName.trim()) return;

    const newCat: DishCategory = {
      name: catName.trim(),
      icon: '🍽️',
      items: [],
    };
    const updated = [...menuCategories, newCat];
    setMenuCategories(updated);
    handleSave(updated);
  };

  const handleRemoveCategory = (index: number) => {
    if (!confirm(`Delete category "${menuCategories[index].name}"?`)) return;
    const updated = menuCategories.filter((_, i) => i !== index);
    setMenuCategories(updated);
    handleSave(updated);
  };

  const handleAddDish = (catIndex: number) => {
    const dish = prompt(`Add dish to "${menuCategories[catIndex].name}":`);
    if (!dish || !dish.trim()) return;

    const updated = [...menuCategories];
    updated[catIndex] = {
      ...updated[catIndex],
      items: [...updated[catIndex].items, dish.trim()],
    };
    setMenuCategories(updated);
    handleSave(updated);
  };

  const handleRemoveDish = (catIndex: number, dishIndex: number) => {
    const updated = [...menuCategories];
    updated[catIndex] = {
      ...updated[catIndex],
      items: updated[catIndex].items.filter((_, i) => i !== dishIndex),
    };
    setMenuCategories(updated);
    handleSave(updated);
  };

  const handleCopyNfcUrl = () => {
    if (destinationUrl) {
      navigator.clipboard.writeText(destinationUrl);
      setCopiedNfc(true);
      setTimeout(() => setCopiedNfc(false), 2000);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🍽️ Tap-Bro Tabletop Stand Link for ${name}:\n${destinationUrl}\n\nDiners tap their phone or scan to draft 5-star Google Reviews with AI!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleDownloadQr = () => {
    const link = document.createElement('a');
    link.href = `/api/restaurants/${slug}/qr`;
    link.download = `${slug}-tabletop-qr.png`;
    link.click();
  };

  const handleRunSimulator = async () => {
    setSimulating(true);
    setSimDraft('');

    try {
      const res = await fetch('/api/review-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locale: simLang,
          tone: simTone,
          ratings: { food: 5, service: 5, ambiance: 5, overall: 5 },
          selectedDishes: simDish ? [simDish] : ['Signature Dishes'],
          restaurantName: name,
          slug,
        }),
      });

      const data = await res.json();
      const generated = data.draft || data.reviewDraft;
      if (res.ok && generated) {
        setSimDraft(generated);
      } else {
        setSimDraft('Unable to generate simulation. Please check AI settings.');
      }
    } catch {
      setSimDraft('Connection error during simulation.');
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-4 text-zinc-400 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          <span>Loading Partner Hub...</span>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex flex-col justify-center items-center p-4 text-center">
        <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-6 max-w-sm space-y-3">
          <div className="h-10 w-10 mx-auto rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
            <Store className="h-5 w-5" />
          </div>
          <h2 className="text-sm font-bold text-white">Restaurant Not Found</h2>
          <p className="text-xs text-zinc-400">{error || 'This restaurant link does not exist.'}</p>
          <button
            onClick={() => router.push('/admin')}
            className="w-full btn-gold rounded-xl py-2.5 text-xs font-semibold"
          >
            Go to Partner Login
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A0A0C] flex flex-col justify-center items-center p-4 relative selection:bg-zinc-700 selection:text-white">
        <div className="ambient-bg pointer-events-none fixed inset-0 z-0" />
        <div className="relative z-10 rounded-2xl border border-zinc-800 bg-[#121216] p-6 sm:p-7 max-w-sm w-full space-y-4 text-center">
          <div className="h-12 w-12 mx-auto rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Partner Authentication Required</h2>
            <p className="text-xs text-zinc-400 mt-1">
              This manager portal for <span className="text-white font-semibold">{name || slug}</span> is invite-only. Enter your PIN or temporary pass.
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

  const reviewsList = restaurant.reviewsLog || [];

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
                <h1 className="text-sm font-bold text-white truncate max-w-[220px]">{name}</h1>
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
              title="Preview Diner Flow"
            >
              <Eye className="h-4 w-4" />
            </button>
            {(activeTab === 'menu' || activeTab === 'profile') && (
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
                  savedSuccess
                    ? 'bg-zinc-800 text-white border border-zinc-600'
                    : 'btn-gold'
                }`}
              >
                {savedSuccess ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                <span>{savedSuccess ? 'Saved' : saving ? 'Saving' : `Save ${activeTab === 'menu' ? 'Menu' : 'Profile'}`}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Screen Content (Max Width 460px with pb-36 for thumb clearance) */}
      <main className="mx-auto w-full max-w-md px-4 pt-3 pb-36 relative z-10 space-y-4">
        {/* Onboarding Alert for New Businesses */}
        {isNew && (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-200 flex items-start gap-2.5 animate-fade-in">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-emerald-300 font-semibold mb-0.5">
                Setup Complete! Station is Live.
              </strong>
              Your tabletop review station is active. Test your Google review link and manage your dishes below.
            </div>
          </div>
        )}

        {/* Quick Phone Stats Widget */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-3 text-center">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Total Reviews
            </span>
            <p className="text-lg font-bold text-white mt-0.5">
              {restaurant.totalReviewsGenerated || 0}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-3 text-center">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Hardware
            </span>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">
              1 NFC Stand
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-3 text-center">
            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Avg Rating
            </span>
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-white mt-0.5">
              <span>5.0</span>
              <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            </div>
          </div>
        </div>

        {/* Tab 1: Reviews, Analytics Trends & 30-Day Retention Hub */}
        {activeTab === 'reviews' && (
          <div className="space-y-3 animate-fade-in">
            {/* Mobile View Switcher: Reviews Feed | Trends Chart | 30-Day Cycle */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#121216] border border-zinc-800">
              <button
                type="button"
                onClick={() => setReviewViewMode('feed')}
                className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  reviewViewMode === 'feed'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Reviews ({reviewsList.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setReviewViewMode('trends')}
                className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  reviewViewMode === 'trends'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>Trends</span>
              </button>
              <button
                type="button"
                onClick={() => setReviewViewMode('cycle')}
                className={`py-2 px-1 text-center rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  reviewViewMode === 'cycle'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>30-Day Cycle</span>
              </button>
            </div>

            {/* View 1: 30-Day Retention Cycle & Monthly Email Report */}
            {reviewViewMode === 'cycle' && (() => {
              const analytics = computeReviewAnalytics(reviewsList, restaurant.cycleStartDate);
              const cyclePercent = Math.min(100, Math.round((analytics.currentCycleDay / 30) * 100));

              return (
                <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-zinc-400" />
                      <span className="text-xs font-bold text-white">30-Day Retention Cycle</span>
                    </div>
                    <span className="rounded-full bg-zinc-800 border border-zinc-700 px-2.5 py-0.5 text-[10px] font-bold text-white font-mono">
                      Day {analytics.currentCycleDay} of 30
                    </span>
                  </div>

                  {/* Cycle Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300 rounded-full"
                      style={{ width: `${cyclePercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Month Progress</span>
                    <span className="font-mono text-zinc-300">{cyclePercent}% complete</span>
                  </div>

                  {cycleResetMessage && (
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-[11px] text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                      <span>{cycleResetMessage}</span>
                    </div>
                  )}

                  <p className="text-[10px] text-zinc-400 leading-relaxed border-t border-zinc-800/80 pt-2">
                    💡 <strong>Data Retention Policy:</strong> When the 30-day month completes, your performance report is automatically emailed to <strong>{restaurant.email || 'your registered email'}</strong> and the counter restarts from Day 1 to ensure lean, scalable database storage.
                  </p>

                  <button
                    type="button"
                    onClick={handleTriggerMonthlyReset}
                    disabled={isResettingCycle}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-850 py-2 px-3 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800 transition active:scale-95 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isResettingCycle ? 'Dispatching Report...' : 'Email Monthly Report & Reset to Day 1'}</span>
                  </button>
                </div>
              );
            })()}

            {/* View 2: Interactive Review Analytics Chart (Day, Week, Month) */}
            {reviewViewMode === 'trends' && (() => {
              const analytics = computeReviewAnalytics(reviewsList, restaurant.cycleStartDate);
              const activeBars =
                chartPeriod === 'day'
                  ? analytics.dayWise
                  : chartPeriod === 'week'
                  ? analytics.weekWise
                  : analytics.monthWise;
              const maxCount = Math.max(1, ...activeBars.map((b) => b.count));

              return (
                <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-4 space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <BarChart3 className="h-4 w-4 text-zinc-400" />
                      <h3 className="text-xs font-bold text-white">Review Volume Trends</h3>
                    </div>

                    {/* Chart Period Switcher */}
                    <div className="flex rounded-lg bg-[#0A0A0C] border border-zinc-800 p-0.5">
                      {(['day', 'week', 'month'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setChartPeriod(p)}
                          className={`rounded-md px-2.5 py-1 text-[10px] font-bold capitalize transition ${
                            chartPeriod === p
                              ? 'bg-white text-black'
                              : 'text-zinc-400 hover:text-white'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Visual Bar Chart */}
                  <div className="pt-2">
                    <div className="flex items-end justify-between gap-1.5 h-28 px-1 pb-1 border-b border-zinc-800">
                      {activeBars.map((bar, idx) => {
                        const barHeightPercent = Math.max(12, Math.round((bar.count / maxCount) * 100));
                        return (
                          <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                            <span className="text-[9px] font-mono text-zinc-400">
                              {bar.count}
                            </span>
                            <div className="w-full flex items-end justify-center h-20">
                              <div
                                style={{ height: `${barHeightPercent}%` }}
                                className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                                  bar.isCurrent
                                    ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                                    : 'bg-zinc-700 hover:bg-zinc-600'
                                }`}
                              />
                            </div>
                            <span className={`text-[9px] font-medium tracking-tight truncate ${
                              bar.isCurrent ? 'text-white font-bold' : 'text-zinc-500'
                            }`}>
                              {bar.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                      <span>{reviewsList.length} verified reviews posted</span>
                    </span>
                    <span className="font-mono text-zinc-300">Filtered: {chartPeriod.toUpperCase()}</span>
                  </div>
                </div>
              );
            })()}

            {/* View 3: Live Feed (Primary / Default view - appears immediately at top of screen) */}
            {reviewViewMode === 'feed' && (
              <div className="space-y-3 animate-fade-in">
                {/* Live Feed Header */}
                <div className="flex items-center justify-between pt-0.5">
                  <div>
                    <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5 text-zinc-400" />
                      <span>Live Verified Reviews</span>
                    </h2>
                    <p className="text-[10px] text-zinc-400">
                      Only reviews confirmed &amp; posted to Google appear here
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRunSimulator}
                    disabled={simulating}
                    className="rounded-xl border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:text-white flex items-center gap-1 transition shrink-0"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>{simulating ? 'Generating...' : 'Simulate'}</span>
                  </button>
                </div>

                {/* Simulated Preview Box (if generated) */}
                {simDraft && (
                  <div className="rounded-2xl border border-zinc-700 bg-zinc-900/90 p-4 space-y-2 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        <span>AI Review Simulation Draft</span>
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">Just Now</span>
                    </div>
                    <p className="text-xs text-zinc-200 leading-relaxed italic bg-[#0A0A0C] p-3 rounded-xl border border-zinc-800">
                      &quot;{simDraft}&quot;
                    </p>
                  </div>
                )}

                {/* Real Review Feed List */}
                {reviewsList.length > 0 ? (
                  <div className="space-y-3">
                    {reviewsList.map((rev) => (
                      <div
                        key={rev.id}
                        className="rounded-2xl border border-zinc-800 bg-[#121216] p-4 space-y-2.5 shadow-sm"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-0.5">
                              {[...Array(rev.overallRating || 5)].map((_, i) => (
                                <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />
                              ))}
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              <span>Posted to Google</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-mono">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(rev.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-200 leading-relaxed bg-[#0A0A0C] p-3 rounded-xl border border-zinc-800/80">
                          &quot;{rev.reviewDraft}&quot;
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 text-[10px]">
                          <div className="flex flex-wrap gap-1">
                            {rev.selectedDishes?.map((d, idx) => (
                              <span key={idx} className="rounded-md bg-zinc-800 px-2 py-0.5 text-zinc-300">
                                {d}
                              </span>
                            ))}
                          </div>
                          <span className="text-zinc-500 uppercase tracking-wider font-mono">
                            {rev.locale === 'hinglish' ? 'Hinglish' : 'English'} • {rev.tone}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Clean Empty State */
                  <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-6 text-center space-y-3.5 shadow-sm">
                    <div className="h-12 w-12 mx-auto rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Live Review Stream Ready</h3>
                      <p className="text-xs text-zinc-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
                        When diners tap your table stand and complete a review, it will show up here instantly.
                      </p>
                    </div>
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleRunSimulator}
                        disabled={simulating}
                        className="btn-gold rounded-xl px-5 py-2.5 text-xs font-semibold shadow-md active:scale-95"
                      >
                        {simulating ? 'Generating...' : 'Simulate a Diner Review'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Menu & Dishes */}
        {activeTab === 'menu' && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Utensils className="h-4 w-4 text-zinc-400" />
                  <span>Menu &amp; Signature Dishes</span>
                </h2>
                <p className="text-[11px] text-zinc-400">
                  Guests pick from these dishes when rating their meal.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCategory}
                className="btn-gold flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="space-y-3">
              {menuCategories.map((cat, catIndex) => (
                <div
                  key={catIndex}
                  className="rounded-2xl border border-zinc-800 bg-[#121216] p-4 space-y-2.5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{cat.icon || '🍽️'}</span>
                      <h3 className="text-xs font-bold text-white">{cat.name}</h3>
                      <span className="text-[10px] text-zinc-500 font-mono">({cat.items.length})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAddDish(catIndex)}
                        className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-[11px] text-zinc-300 hover:text-white flex items-center gap-0.5 transition"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Dish</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(catIndex)}
                        className="text-zinc-500 hover:text-red-400 p-1 transition"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cat.items.map((dish, dishIndex) => (
                      <span
                        key={dishIndex}
                        className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800 border border-zinc-700 px-3 py-1 text-[11px] text-zinc-200"
                      >
                        <span>{dish}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveDish(catIndex, dishIndex)}
                          className="text-zinc-400 hover:text-red-400 text-[10px] ml-0.5"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {cat.items.length === 0 && (
                      <span className="text-[11px] text-zinc-500 italic">
                        No dishes yet. Tap &quot;Add Dish&quot; to insert items.
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="btn-gold w-full rounded-xl py-3 text-xs font-bold transition shadow-lg active:scale-95"
              >
                {saving ? 'Saving...' : 'Save Menu Changes'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: Restaurant Profile & Google Link */}
        {activeTab === 'profile' && (
          <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-5 space-y-4 animate-fade-in shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Store className="h-4 w-4 text-zinc-400" />
                <span>Restaurant Profile &amp; Google Link</span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Configure your public info and Google Business review target.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Restaurant Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] px-3.5 py-2.5 text-base sm:text-xs text-white focus:border-zinc-500 focus:outline-none transition-all placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Cuisine / Category
                </label>
                <input
                  type="text"
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] px-3.5 py-2.5 text-base sm:text-xs text-white focus:border-zinc-500 focus:outline-none transition-all placeholder-zinc-500"
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
                  className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] px-3.5 py-2.5 text-base sm:text-xs text-white focus:border-zinc-500 focus:outline-none transition-all placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Admin PIN (4-digit)
                </label>
                <input
                  type="password"
                  maxLength={8}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#0A0A0C] px-3.5 py-2.5 text-base sm:text-xs text-white focus:border-zinc-500 focus:outline-none font-mono transition-all"
                />
              </div>

              {/* Google Business Review URL with Clear 3-Step Guide */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <LinkIcon className="h-3 w-3 text-zinc-400" />
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
                      const businessName = (name || restaurant?.name || '').trim();
                      const query = encodeURIComponent(businessName ? `${businessName} restaurant` : 'my restaurant');
                      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition active:scale-95"
                  >
                    <Search className="h-3.5 w-3.5 text-zinc-400" />
                    <span>
                      1-Tap: Find &quot;{(name || restaurant?.name || 'My Business').trim()}&quot; on Maps
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text) {
                          const clean = text.trim();
                          if (/^ChIJ[a-zA-Z0-9_-]{20,}$/.test(clean)) {
                            setGoogleReviewUrl(`https://search.google.com/local/writereview?placeid=${clean}`);
                          } else if (clean.startsWith('http://') || clean.startsWith('https://')) {
                            setGoogleReviewUrl(clean);
                          }
                        }
                      } catch {}
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 transition active:scale-95"
                  >
                    <Copy className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Paste Place ID / Link</span>
                  </button>

                  <a
                    href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-amber-400 hover:text-white hover:bg-zinc-800 transition active:scale-95 ml-auto"
                  >
                    <Search className="h-3 w-3 text-amber-400" />
                    <span>🔍 Official Place ID Finder Tool ↗</span>
                  </a>
                </div>

                {showGoogleHelp && (
                  <div className="rounded-xl border border-zinc-700 bg-[#0A0A0C] p-3 text-xs space-y-2 animate-fade-in">
                    <p className="font-semibold text-white">How to connect your direct Google 5-Star Review Form:</p>
                    <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
                      <li>Tap <strong>&quot;Official Place ID Finder Tool&quot;</strong> above to open Google&apos;s free Place ID search.</li>
                      <li>Type your business name in Gandhinagar or Ahmedabad and copy the <code>ChIJ...</code> Place ID.</li>
                      <li>Paste it below. TapBro will instantly generate the direct 5-star write-review form!</li>
                    </ol>
                    <p className="text-[10px] text-zinc-400 pt-1 border-t border-zinc-800 leading-relaxed">
                      💡 <strong>Guaranteed 5-Star Dialog:</strong> Using a genuine Google Place ID guarantees customers directly see the 5 empty stars and review text field with 0% risk of a 404!
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={googleReviewUrl}
                    onChange={(e) => {
                      const val = e.target.value.trim();
                      if (/^ChIJ[a-zA-Z0-9_-]{20,}$/.test(val)) {
                        setGoogleReviewUrl(`https://search.google.com/local/writereview?placeid=${val}`);
                      } else {
                        setGoogleReviewUrl(e.target.value);
                      }
                    }}
                    placeholder="Paste Place ID (ChIJ...) or Google Review Link"
                    className="flex-1 rounded-xl border border-zinc-800 bg-[#0A0A0C] px-3.5 py-2.5 text-xs sm:text-xs text-white focus:border-zinc-500 focus:outline-none font-mono transition-all placeholder-zinc-500"
                  />
                  {googleReviewUrl && (
                    <button
                      type="button"
                      onClick={() => window.open(googleReviewUrl, '_blank')}
                      className="flex items-center gap-1 rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs font-semibold text-white hover:bg-zinc-700 transition shrink-0"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Test</span>
                    </button>
                  )}
                </div>

                {googleReviewUrl && (
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" />
                    <span>
                      {googleReviewUrl.includes('writereview') || googleReviewUrl.includes('/review')
                        ? '✓ Direct 5-Star Write Review Dialog Connected!'
                        : 'Google Link Connected!'} Tap &quot;Test&quot; to verify.
                    </span>
                  </p>
                )}
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="btn-gold w-full rounded-xl py-3 text-xs font-bold transition shadow-lg active:scale-95"
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Official NFC Stand & QR Station */}
        {activeTab === 'stands' && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="h-4 w-4" />
                  <span>Official NFC Review Stand</span>
                </span>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                  Pre-Programmed
                </span>
              </div>

              <div>
                <h2 className="text-sm font-bold text-white">{name} Counter Stand</h2>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Your physical Tap-Bro NFC acrylic stand is pre-configured for your business. Place it on your billing counter or main table for customers to tap!
                </p>
              </div>

              {/* Station URL Bar */}
              <div className="rounded-xl bg-[#0A0A0C] p-3 border border-zinc-800 space-y-1.5">
                <span className="text-[11px] text-zinc-400 font-medium block">
                  Stand Diner Link (Written into NFC Stand):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={destinationUrl}
                    className="flex-1 rounded-lg border border-zinc-800 bg-[#121216] px-2.5 py-2 text-xs text-white font-mono truncate"
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

              {/* Target Google Review URL (Direct 5-Star Review Form) */}
              <div className="rounded-xl bg-[#0A0A0C] p-3.5 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-200 font-semibold flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                    <span>Connected Google Review URL</span>
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
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  When diners tap the stand and generate their review, they are redirected here to submit:
                </p>
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
                    onClick={() => handleSave()}
                    disabled={saving}
                    className="btn-gold rounded-lg px-3 py-2 text-xs font-bold shrink-0"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (googleReviewUrl) window.open(googleReviewUrl, '_blank');
                    }}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Test Review Form (Opens Google)</span>
                  </button>
                  <span className="text-[10px] text-zinc-500">Must open 5-star rating popup</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 px-3 text-xs font-semibold transition"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>WhatsApp Share</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 px-3 text-xs font-semibold transition"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Download Stand QR</span>
                </button>
              </div>

              {/* Hardware Status */}
              <div className="pt-2 border-t border-zinc-800 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Hardware Stand</span>
                  <p className="text-[11px] text-zinc-400">1 Official NFC Stand Issued</p>
                </div>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-400">
                  Active &amp; Ready
                </span>
              </div>

              <button
                type="button"
                onClick={() => window.open(`/r/${slug}`, '_blank')}
                className="btn-gold w-full flex items-center justify-center gap-2 rounded-xl py-3 font-bold text-xs transition"
              >
                <Eye className="h-4 w-4" />
                <span>Test Live Diner Flow on Phone</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 5: Staff Script */}
        {activeTab === 'staff' && (
          <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-5 space-y-4 animate-fade-in shadow-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-zinc-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Staff Cheat Sheet &amp; Script
              </h2>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Show this to your service staff and captains on their phones:
            </p>

            <div className="space-y-3">
              <div className="rounded-2xl border border-zinc-800 bg-[#0A0A0C] p-4 space-y-2">
                <span className="text-[11px] font-bold text-zinc-300 uppercase block">
                  ⭐ 10-Second Waiter Script:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed italic bg-[#121216] p-3 rounded-xl border border-zinc-800">
                  &quot;Sir / Ma&apos;am, if you enjoyed our {simDish || 'food'}, please tap your phone on this tabletop stand! Tap-Bro AI will craft your review in 10 seconds without typing.&quot;
                </p>
              </div>

              <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
                <h4 className="font-semibold text-white">Guidelines:</h4>
                <ul className="list-disc list-inside space-y-1 text-zinc-400">
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
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#0A0A0C]/95 backdrop-blur-2xl border-t border-zinc-800 pb-safe shadow-2xl">
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
          {[
            { id: 'reviews', label: 'Reviews', icon: MessageSquare },
            { id: 'menu', label: 'Menu', icon: Utensils },
            { id: 'profile', label: 'Profile', icon: Store },
            { id: 'stands', label: 'Stand', icon: Radio },
            { id: 'staff', label: 'Staff Script', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                  isActive
                    ? 'text-white bg-zinc-800 border border-zinc-700 font-bold shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 mb-0.5 ${isActive ? 'stroke-[2.5] text-white' : 'stroke-[1.8]'}`} />
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
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-4 text-zinc-400 text-xs">Loading Tap-Bro Portal...</div>}>
      <RestaurantAdminDashboardContent />
    </Suspense>
  );
}
