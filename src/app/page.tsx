'use client';

import React from 'react';
import Link from 'next/link';
import {
  Store,
  QrCode,
  Radio,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  UtensilsCrossed,
  HeartHandshake,
  Star,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-page flex flex-col justify-between text-text-primary selection:bg-amber-400 selection:text-page relative overflow-hidden">
      <div className="ambient-bg pointer-events-none fixed inset-0 z-0" />

      {/* Header */}
      <header className="relative z-10 border-b border-border/60 bg-surface/80 backdrop-blur-md px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20">
              <UtensilsCrossed className="h-5 w-5 text-page" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-white">Tap-Bro</span>
                <span className="rounded-full bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                  NFC & QR Tabletop
                </span>
              </div>
              <p className="text-[11px] text-text-secondary">
                Turn dining visits into polished Google Reviews with AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-raised px-3.5 py-2 text-xs font-semibold text-white hover:border-amber-400/50 hover:bg-surface-highlight transition"
            >
              <Store className="h-3.5 w-3.5 text-amber-400" />
              <span>Partner Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:py-16 text-center space-y-8 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-surface-raised border border-amber-400/30 px-3.5 py-1 text-xs text-amber-300 shadow-sm mx-auto">
          <Sparkles className="h-3.5 w-3.5 text-amber-400" />
          <span>Multi-Business Tabletop Review Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
          We Stand Between Your Diner <br className="hidden sm:inline" />
          and <span className="text-amber-400">Google Reviews</span>
        </h1>

        <p className="mx-auto max-w-2xl text-xs sm:text-base text-zinc-300 leading-relaxed">
          Diners love your food but don&apos;t want the hassle of typing reviews. With our tabletop <strong>NFC cards & QR stands</strong>, diners tap their phone, rate their visit, pick dishes they tried, and <strong>AI writes a natural review draft in 30 seconds</strong>. They copy and post with one click!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/r/saffron-spice"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 py-4 px-6 font-extrabold text-page shadow-xl shadow-amber-500/25 hover:from-amber-300 hover:to-amber-400 transition active:scale-[0.98] text-sm sm:text-base"
          >
            <span>Try Live Diner Experience</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/admin"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface-raised py-4 px-6 font-bold text-white hover:border-amber-400/50 hover:bg-surface-highlight transition active:scale-[0.98] text-sm sm:text-base"
          >
            <Store className="h-4 w-4 text-amber-400" />
            <span>Partner Manager Hub</span>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left">
          <div className="rounded-2xl border border-border bg-surface-card p-5 space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Radio className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-bold text-white">NFC Tap & QR Stand</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Every restaurant gets a unique tabletop QR & NFC link. Diners just tap or scan—no app download required.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface-card p-5 space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-bold text-white">Free & Unlimited AI</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Built-in Zero-Cost Smart Engine plus generous free tiers from Google Gemini & Groq. No heavy token fees.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface-card p-5 space-y-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <h2 className="text-sm font-bold text-white">Multi-Business Admin</h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Give each restaurant owner their own dashboard to update dishes, menu categories, and print table stands.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-6 px-4 text-center text-xs text-zinc-500">
        <p>Review AI • Tabletop Stand SaaS Platform • English & Hinglish Supported</p>
      </footer>
    </div>
  );
}
