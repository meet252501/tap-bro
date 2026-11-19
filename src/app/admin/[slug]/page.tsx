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
} from 'lucide-react';
import { Restaurant, AIProviderType, DinerReviewRecord } from '@/types/restaurant';
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

        {/* Tab 1: Reviews & Real Data Chat Feed (Primary) */}
        {activeTab === 'reviews' && (
          <div className="space-y-4 animate-fade-in">
            {/* Live Feed Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-zinc-400" />
                  <span>Diner Review Activity</span>
                </h2>
                <p className="text-[11px] text-zinc-400">
                  Real reviews drafted at your tabletop stands
                </p>
              </div>
              <button
                type="button"
                onClick={handleRunSimulator}
                disabled={simulating}
                className="rounded-xl border border-zinc-700 bg-zinc-800/80 px-2.5 py-1 text-[11px] font-semibold text-zinc-300 hover:text-white flex items-center gap-1 transition"
              >
                <Sparkles className="h-3 w-3" />
                <span>{simulating ? 'Generating...' : 'Simulate Review'}</span>
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
                      <div className="flex items-center gap-1">
                        {[...Array(rev.overallRating || 5)].map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                        ))}
                        <span className="text-[11px] font-bold text-white ml-1">5.0</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400">
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
              <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-6 text-center space-y-3">
                <div className="h-10 w-10 mx-auto rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-400">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Live Review Stream Ready</h3>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed max-w-xs mx-auto">
                    When diners tap the tabletop stand at your tables and draft reviews, they will appear here in real time.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunSimulator}
                  disabled={simulating}
                  className="btn-gold rounded-xl px-4 py-2 text-xs font-semibold"
                >
                  {simulating ? 'Generating...' : 'Simulate a Diner Review'}
                </button>
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
                    <span>How to find this?</span>
                  </button>
                </div>

                {showGoogleHelp && (
                  <div className="rounded-xl border border-zinc-700 bg-[#0A0A0C] p-3 text-xs space-y-2 animate-fade-in">
                    <p className="font-semibold text-white">How to connect your Google Reviews in 15 seconds:</p>
                    <ol className="list-decimal list-inside space-y-1 text-zinc-400 text-[11px] leading-relaxed">
                      <li>Search your restaurant name on <strong>Google Maps</strong> or Google.</li>
                      <li>On your business card, tap <strong>&quot;Ask for reviews&quot;</strong> (or &quot;Get more reviews&quot;).</li>
                      <li>Copy the short link (looks like <span className="font-mono text-zinc-200">https://g.page/r/.../review</span>) and paste below!</li>
                    </ol>
                    <p className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-800">
                      When diners finish drafting their review, 1 tap opens Google with 5 stars selected so they paste and publish!
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={googleReviewUrl}
                    onChange={(e) => setGoogleReviewUrl(e.target.value)}
                    placeholder="https://g.page/r/your-restaurant/review"
                    className="flex-1 rounded-xl border border-zinc-800 bg-[#0A0A0C] px-3.5 py-2.5 text-base sm:text-xs text-white focus:border-zinc-500 focus:outline-none font-mono transition-all placeholder-zinc-500"
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
                  Stand Diner Link:
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
