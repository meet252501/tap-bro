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
    <div className="min-h-screen bg-[#08090D] flex flex-col justify-between text-text-primary selection:bg-amber-400 selection:text-[#120D02] relative overflow-hidden">
      <div className="ambient-bg pointer-events-none fixed inset-0 z-0" />

      {/* Luxury Frosted Header */}
      <header className="relative z-10 border-b border-white/[0.08] bg-[#0A0C12]/90 backdrop-blur-2xl px-4 py-3.5 sm:px-8 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FFE082] via-[#FFB300] to-[#D97706] shadow-[0_0_20px_rgba(255,179,0,0.4)] border border-amber-200/60 p-2">
              <UtensilsCrossed className="h-5 w-5 text-[#140E02] stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black text-white tracking-tight">Tap-Bro</span>
                <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 text-[10px] font-black text-amber-300 shadow-[0_0_10px_rgba(245,186,66,0.2)]">
                  NFC &amp; QR Tabletop
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Turn dining visits into polished Google Reviews with AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/setup"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-zinc-300 hover:text-white hover:border-amber-400/40 transition"
            >
              <span>Onboard Restaurant</span>
            </Link>
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition shadow-sm"
            >
              <Store className="h-3.5 w-3.5 text-amber-400" />
              <span>Partner Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:py-16 text-center space-y-8 flex-1 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/15 to-amber-500/10 border border-amber-400/35 px-4 py-1.5 text-xs font-black text-amber-300 shadow-[0_0_24px_rgba(245,186,66,0.3)] mx-auto backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
          <span className="tracking-wide">Multi-Business Tabletop Review Platform</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
          We Bridge Your Dining Table &amp; <br className="hidden sm:inline" />
          <span className="text-gold-gradient drop-shadow-[0_4px_24px_rgba(245,186,66,0.3)]">5-Star Google Reviews</span>
        </h1>

        <p className="mx-auto max-w-2xl text-xs sm:text-base text-zinc-300 leading-relaxed font-normal">
          Diners love your food but don&apos;t want the hassle of typing reviews. With our tabletop <strong>NFC acrylic stands &amp; QR cards</strong>, guests tap their phone, rate their meal, pick dishes they tried, and <strong>AI writes an authentic review draft in 30 seconds</strong>. They copy and post with one tap!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Link
            href="/r/saffron-spice"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl btn-gold py-4 px-8 font-black text-sm sm:text-base shadow-2xl active:scale-[0.98]"
          >
            <span>Try Live Diner Experience</span>
            <ArrowRight className="h-4 w-4 stroke-[3]" />
          </Link>

          <Link
            href="/admin"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.04] backdrop-blur-xl py-4 px-8 font-bold text-white hover:border-amber-400/50 hover:bg-white/[0.08] transition active:scale-[0.98] text-sm sm:text-base shadow-md"
          >
            <Store className="h-4 w-4 text-amber-400" />
            <span>Partner Manager Hub</span>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 text-left">
          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#161822]/80 to-[#0F1118]/90 p-5 space-y-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 border border-amber-400/30 text-amber-300 shadow-[0_0_14px_rgba(245,186,66,0.2)]">
              <Radio className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-black text-white">NFC Tap &amp; QR Stand</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Every restaurant receives custom tabletop QR &amp; NFC stand links. Diners just tap or scan—zero app installation required.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#161822]/80 to-[#0F1118]/90 p-5 space-y-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 border border-amber-400/30 text-amber-300 shadow-[0_0_14px_rgba(245,186,66,0.2)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-black text-white">Zero-Cost AI Engine</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Built-in intelligent culinary synthesis engine plus free tier integration with Google Gemini &amp; Groq. Zero expensive token bills.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#161822]/80 to-[#0F1118]/90 p-5 space-y-3 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-400/30 text-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h2 className="text-sm font-black text-white">Multi-Business Admin</h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Give each restaurant owner their own private dashboard to update menu dishes, simulate reviews, and print table stands.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-6 px-4 text-center text-xs text-zinc-500">
        <p>Tap-Bro • Tabletop Stand SaaS Platform • English &amp; Hinglish Supported</p>
      </footer>
    </div>
  );
}
