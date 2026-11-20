'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Smartphone,
  Star,
  QrCode,
  ShieldCheck,
  ArrowRight,
  UtensilsCrossed,
  BarChart3,
  Calendar,
  Layers,
  Lock,
  ExternalLink,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-[#0A0A0C] text-white selection:bg-zinc-700 selection:text-white relative flex flex-col justify-between overflow-x-hidden">
      {/* Subtle Ambient Background */}
      <div className="ambient-bg pointer-events-none fixed inset-0 z-0" />

      {/* Sticky Mobile App Top Bar */}
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#0A0A0C]/90 backdrop-blur-xl px-4 py-3">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-700 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="h-4 w-4 fill-white text-white" />
            </div>
            <div>
              <span className="text-sm font-extrabold tracking-tight text-white block leading-none">
                Tap-Bro
              </span>
              <span className="text-[10px] text-zinc-400 font-medium">
                1-Tap NFC Review Station
              </span>
            </div>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-zinc-700 bg-zinc-800/90 px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-700 transition"
          >
            Manager Hub
          </Link>
        </div>
      </header>

      {/* Main Mobile App Content (Max 448px) */}
      <main className="mx-auto w-full max-w-md px-4 pt-5 pb-20 relative z-10 space-y-6">
        {/* Hero Section */}
        <div className="space-y-3.5 text-center pt-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/80 px-3 py-1 text-[11px] font-semibold text-zinc-300">
            <Sparkles className="h-3 w-3 text-white fill-white" />
            <span>Tabletop NFC Dining Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Turn Happy Diners into 5-Star Google Reviews.
          </h1>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm mx-auto">
            A single tabletop NFC stand on your dining counter. Guests tap with their phone, AI writes a genuine personalized review in seconds, and posts straight to Google Maps.
          </p>

          {/* Quick Action Links */}
          <div className="pt-2 space-y-2">
            <Link
              href="/r/eat-punjab-gandhinagar-gujarat"
              className="flex w-full items-center justify-center gap-2 rounded-xl btn-gold py-3.5 px-5 font-semibold text-sm transition-all duration-150 active:scale-[0.98] shadow-lg"
            >
              <Smartphone className="h-4 w-4" />
              <span>Try Live Diner Experience ➔</span>
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/admin"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-[#121216] py-2.5 px-3 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition"
              >
                <Lock className="h-3.5 w-3.5 text-zinc-400" />
                <span>Manager Hub</span>
              </Link>

              <Link
                href="/setup"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-800 bg-[#121216] py-2.5 px-3 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition"
              >
                <QrCode className="h-3.5 w-3.5 text-zinc-400" />
                <span>Activate Stand</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 3-Step Flow Cards */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              How the 1-Tap Stand Works
            </h2>
            <span className="text-[10px] text-zinc-500 font-mono">0 App Download</span>
          </div>

          {/* Step 1 */}
          <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-extrabold text-white font-mono">
                1
              </div>
              <h3 className="text-xs font-bold text-white">Diner Taps the Table Stand</h3>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed pl-9">
              Guest holds any smartphone over the tabletop NFC chip (or scans the QR code). Browser launches instantly without downloading any app.
            </p>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-extrabold text-white font-mono">
                2
              </div>
              <h3 className="text-xs font-bold text-white">AI Crafts a Genuine Review</h3>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed pl-9">
              Diner selects the dishes they enjoyed and their dining vibe. TapBro AI drafts a personalized, natural review in English or Hinglish with zero repetition.
            </p>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-extrabold text-white font-mono">
                3
              </div>
              <h3 className="text-xs font-bold text-white">1 Tap to Post on Google Maps</h3>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed pl-9">
              With 1 tap, the review is copied and Google Maps automatically opens to your restaurant with 5 stars selected. Diner pastes and publishes in 2 seconds.
            </p>
          </div>
        </div>

        {/* Hardware Highlight */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-zinc-400" />
              <h3 className="text-xs font-bold text-white">1 NFC Stand Per Restaurant</h3>
            </div>
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              Zero Power Required
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed">
            High-grade tabletop hardware with dual NTAG213 NFC chip and laser-engraved QR fallback. Requires no batteries, no cables, and no WiFi pairing. Works forever.
          </p>
        </div>

        {/* Manager Dashboard Features */}
        <div className="rounded-2xl border border-zinc-800 bg-[#121216] p-4 space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-zinc-400" />
            <h3 className="text-xs font-bold text-white">Store Manager Intelligence</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-xl bg-[#0A0A0C] border border-zinc-800/80 p-2.5 space-y-1">
              <span className="font-semibold text-white block">Day / Week / Month Trends</span>
              <p className="text-zinc-500 text-[10px] leading-tight">Visual charts tracking customer volume over time.</p>
            </div>
            <div className="rounded-xl bg-[#0A0A0C] border border-zinc-800/80 p-2.5 space-y-1">
              <span className="font-semibold text-white block">30-Day Auto Recaps</span>
              <p className="text-zinc-500 text-[10px] leading-tight">Monthly performance summaries emailed to store owner.</p>
            </div>
            <div className="rounded-xl bg-[#0A0A0C] border border-zinc-800/80 p-2.5 space-y-1">
              <span className="font-semibold text-white block">Menu &amp; Dish Editor</span>
              <p className="text-zinc-500 text-[10px] leading-tight">Add or remove signature dishes in 10 seconds.</p>
            </div>
            <div className="rounded-xl bg-[#0A0A0C] border border-zinc-800/80 p-2.5 space-y-1">
              <span className="font-semibold text-white block">Direct Google Redirect</span>
              <p className="text-zinc-500 text-[10px] leading-tight">Direct link to your verified Google Business Profile.</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="rounded-xl bg-zinc-900/40 border border-zinc-800/60 p-3 text-center text-[10px] text-zinc-500 space-y-1">
          <p className="text-zinc-400 font-medium">
            Tap-Bro • Tabletop Dining Intelligence
          </p>
          <p>
            Private &amp; Non-custodial. Compliant with Google Business Profile &amp; Consumer Review Transparency Guidelines.
          </p>
        </div>
      </main>

      {/* Bottom Legal Bar */}
      <footer className="w-full border-t border-zinc-900 bg-[#0A0A0C] py-3 text-center text-[10px] text-zinc-600">
        Tap-Bro Tabletop NFC Review Assistant
      </footer>
    </div>
  );
}
