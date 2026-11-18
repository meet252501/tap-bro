'use client';

import React, { useState, useEffect } from 'react';
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
  BookOpen,
  MessageSquare,
  Flame,
  ChevronRight,
  Sliders,
} from 'lucide-react';
import { Restaurant, AIProviderType } from '@/types/restaurant';
import { DishCategory, ReviewLanguage, ReviewTone } from '@/types/review';

export default function RestaurantAdminDashboard() {
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

  useEffect(() => {
    if (!slug) return;

    const storedPin = localStorage.getItem(`admin_${slug}`) || '';
    setAdminPin(storedPin);

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

    // Determine diner link
    const host = window.location.host;
    const proto = window.location.protocol;
    setDestinationUrl(`${proto}//${host}/r/${slug}`);
  }, [slug]);

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
      <div className="min-h-screen bg-page flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400/20 border-t-amber-400" />
          <p className="text-xs font-medium text-amber-300">Loading Tap-Bro...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center p-4">
        <div className="rounded-2xl border border-border bg-surface-card p-6 text-center space-y-4 max-w-sm w-full">
          <p className="text-sm text-red-400">{error || 'Restaurant not found'}</p>
          <button
            onClick={() => router.push('/admin')}
            className="w-full rounded-xl bg-amber-400 py-2.5 text-xs font-semibold text-page"
          >
            Return to Admin Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page text-text-primary selection:bg-amber-400 selection:text-page relative flex flex-col justify-between">
      <div className="ambient-bg pointer-events-none fixed inset-0 z-0" />

      {/* Phone-Optimized Top App Bar */}
      <header className="sticky top-0 z-30 border-b border-border/80 bg-surface/95 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              onClick={() => router.push('/admin')}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-raised text-text-secondary hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Tap-Bro</span>
                <span className="text-zinc-600">•</span>
                <h1 className="text-sm font-bold text-white truncate">{name}</h1>
              </div>
              <p className="text-[10px] text-text-secondary truncate">
                ID: <span className="font-mono text-zinc-300">{restaurant.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => window.open(`/r/${slug}`, '_blank')}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-surface-raised text-amber-400 hover:text-white hover:bg-surface-highlight transition"
              title="Preview Diner View"
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleSave()}
              disabled={saving}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition shadow-md ${
                savedSuccess
                  ? 'bg-emerald-500 text-white'
                  : 'bg-amber-400 text-page hover:bg-amber-300 shadow-amber-400/20'
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
          <div className="rounded-2xl border border-amber-500/20 bg-surface-card p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">
                Total Reviews
              </span>
              <p className="text-xl font-bold text-white mt-0.5">
                {restaurant.totalReviewsGenerated || 0}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/20 text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface-card p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wider block">
                Dining Tables
              </span>
              <p className="text-xl font-bold text-amber-400 mt-0.5">
                {tableCount} Stands
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-surface-raised text-amber-400">
              <Radio className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Tab 1: Tabletop NFC Hub (QR Code Removed) */}
        {activeTab === 'nfc' && (
          <div className="space-y-4 animate-fade-in">
            {/* NFC Hardware Station Card */}
            <div className="rounded-2xl border border-border bg-surface-card p-4 space-y-3.5 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="h-4 w-4" />
                  <span>Tabletop NFC Station</span>
                </span>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  Ready to Tap
                </span>
              </div>

              <div>
                <h2 className="text-base font-bold text-white">{name} Table Stands</h2>
                <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                  Diners tap their phone on your table puck or card. No camera QR scanning required.
                </p>
              </div>

              <div className="rounded-xl bg-surface p-3 border border-border/80 space-y-2">
                <span className="text-[11px] text-zinc-400 font-medium block">
                  NFC Tabletop URL Link:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={destinationUrl}
                    className="flex-1 rounded-lg border border-border/60 bg-surface-raised px-2.5 py-2 text-xs text-white font-mono truncate"
                  />
                  <button
                    type="button"
                    onClick={handleCopyNfcUrl}
                    className="rounded-lg bg-amber-400 text-page px-3 py-2 text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    {copiedNfc ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copiedNfc ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Table Count Setting */}
              <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Active Table Stands</span>
                  <p className="text-[11px] text-text-secondary">Number of dining tables</p>
                </div>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={tableCount}
                  onChange={(e) => setTableCount(Number(e.target.value))}
                  className="w-16 rounded-xl border border-border bg-surface px-2.5 py-1.5 text-xs text-white text-center font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>

              <button
                type="button"
                onClick={() => window.open(`/r/${slug}`, '_blank')}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 font-semibold text-page shadow-md shadow-amber-500/20 text-xs active:scale-[0.99] transition"
              >
                <Eye className="h-4 w-4" />
                <span>Test Live Diner Flow on Phone</span>
              </button>
            </div>

            {/* Quick NFC Programming Guide for Mobile */}
            <div className="rounded-2xl border border-border bg-surface-card p-4 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wide">
                <Radio className="h-3.5 w-3.5 text-amber-400" />
                <span>Program NFC Tag from Phone</span>
              </h3>
              <ol className="text-xs text-zinc-300 space-y-2 list-decimal list-inside leading-relaxed">
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
          <div className="rounded-2xl border border-border bg-surface-card p-4 space-y-4 animate-fade-in shadow-xl">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
              Restaurant Profile & Link
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Restaurant Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
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
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
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
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
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
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <LinkIcon className="h-3 w-3 text-amber-400" />
                    <span>Google Review URL</span>
                  </label>
                  {googleReviewUrl && (
                    <a
                      href={googleReviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-0.5"
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
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="w-full rounded-xl bg-amber-400 py-3 text-xs font-semibold text-page hover:bg-amber-300 transition"
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
                <h2 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
                  Menu & Dishes
                </h2>
                <p className="text-[11px] text-text-secondary">
                  Diners pick these dishes in their review.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCategory}
                className="flex items-center gap-1 rounded-xl bg-amber-400 px-3 py-1.5 text-xs font-semibold text-page hover:bg-amber-300 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Category</span>
              </button>
            </div>

            <div className="space-y-3">
              {menuCategories.map((cat, catIndex) => (
                <div
                  key={catIndex}
                  className="rounded-2xl border border-border bg-surface-card p-3.5 space-y-2.5 shadow-sm"
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
                        className="rounded-lg border border-border bg-surface-raised px-2 py-1 text-[11px] text-amber-300 hover:text-white flex items-center gap-0.5"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(catIndex)}
                        className="text-zinc-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cat.items.map((dish, dishIndex) => (
                      <span
                        key={dishIndex}
                        className="inline-flex items-center gap-1 rounded-full bg-surface-raised border border-border/80 px-2.5 py-1 text-[11px] text-zinc-200"
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
              className="w-full rounded-xl bg-amber-400 py-3 text-xs font-semibold text-page hover:bg-amber-300 transition"
            >
              {saving ? 'Saving...' : 'Save Menu Changes'}
            </button>
          </div>
        )}

        {/* Tab 4: AI Review Simulator (On Phone) */}
        {activeTab === 'simulator' && (
          <div className="rounded-2xl border border-border bg-surface-card p-4 space-y-4 animate-fade-in shadow-xl">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
                AI Review Simulator
              </h2>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Test how Tap-Bro AI crafts reviews for your restaurant in English or Hinglish right on your phone.
            </p>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Sample Dish
                </label>
                <input
                  type="text"
                  value={simDish}
                  onChange={(e) => setSimDish(e.target.value)}
                  placeholder="e.g. Banarasi Tamatar Chaat"
                  className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Language</label>
                  <select
                    value={simLang}
                    onChange={(e) => setSimLang(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-surface px-2.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="hinglish">🇮🇳 Hinglish</option>
                    <option value="en">🇬🇧 English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 mb-1">Tone</label>
                  <select
                    value={simTone}
                    onChange={(e) => setSimTone(e.target.value as any)}
                    className="w-full rounded-xl border border-border bg-surface px-2.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none"
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
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-400 py-3 font-semibold text-page hover:bg-amber-300 transition text-xs shadow-md"
              >
                <Sparkles className="h-4 w-4" />
                <span>{simulating ? 'Crafting Draft...' : 'Generate Sample Review'}</span>
              </button>

              {simDraft && (
                <div className="rounded-xl border border-amber-500/30 bg-surface p-3.5 space-y-1.5 animate-fade-in">
                  <span className="text-[10px] font-semibold text-amber-300 uppercase tracking-wider block">
                    AI Review Draft:
                  </span>
                  <p className="text-xs text-zinc-200 leading-relaxed italic">
                    &quot;{simDraft}&quot;
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Staff Tabletop Script */}
        {activeTab === 'staff' && (
          <div className="rounded-2xl border border-border bg-surface-card p-4 space-y-4 animate-fade-in shadow-xl">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider text-amber-400">
                Staff Cheat Sheet & Script
              </h2>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Show this to your service staff and captains on their phones:
            </p>

            <div className="space-y-3">
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-300 uppercase block">
                  ⭐ 10-Second Waiter Script:
                </span>
                <p className="text-xs text-zinc-200 leading-relaxed italic bg-surface p-3 rounded-lg border border-border">
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
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border/80 pb-safe">
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
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-amber-400 font-bold scale-105'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className={`h-5 w-5 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span className="text-[10px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
