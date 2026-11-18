'use client';

import React from 'react';
import { ShieldCheck, QrCode } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border/40 py-6 px-4 text-center text-xs text-zinc-500">
      <div className="mx-auto max-w-xl space-y-2">
        <div className="flex items-center justify-center gap-2 text-zinc-400">
          <QrCode className="h-4 w-4 text-amber-400/80" />
          <span className="font-medium text-xs">Tap-Bro Tabletop NFC & QR Review Station</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Powered by Tap-Bro • Private & Non-custodial. We never store personal customer identity or automatically post reviews.
        </p>
        <div className="flex items-center justify-center gap-1 text-[11px] text-zinc-400">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Compliant with Google Review & Consumer Transparency Guidelines</span>
        </div>
      </div>
    </footer>
  );
};
