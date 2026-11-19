'use client';

import React, { Suspense } from 'react';
import { StoreSetupView } from '@/components/StoreSetupView';

export const dynamic = 'force-dynamic';

export default function BusinessSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-4 text-zinc-400 text-xs">
          Loading Setup Portal...
        </div>
      }
    >
      <StoreSetupView />
    </Suspense>
  );
}
