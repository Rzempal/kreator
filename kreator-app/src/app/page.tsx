// src/app/page.tsx v0.002 Glowna strona Kreatora Paneli Tapicerowanych
'use client';

import dynamic from 'next/dynamic';
import Toolbar from '@/components/ui/Toolbar';
import ColorPicker from '@/components/ui/ColorPicker';
import PriceSummary from '@/components/ui/PriceSummary';
import WallConfig from '@/components/ui/WallConfig';
import MobileDrawer from '@/components/ui/MobileDrawer';

// Dynamic import dla Canvas (wymaga window)
const Canvas = dynamic(() => import('@/components/canvas/Canvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-96 bg-slate-900 rounded-xl">
      <div className="animate-pulse text-slate-400">Ladowanie...</div>
    </div>
  ),
});

export default function KreatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-6 lg:py-8">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Kreator Paneli Tapicerowanych
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Zaprojektuj swoj uklad paneli i otrzymaj natychmiastowa wycene
          </p>
        </header>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - desktop only */}
          <aside className="hidden lg:flex flex-col gap-4 w-72 flex-shrink-0 max-h-[calc(100vh-120px)] overflow-y-auto">
            <WallConfig />
            <ColorPicker />
            <PriceSummary />
          </aside>

          {/* Main workspace */}
          <main className="flex-1 flex flex-col gap-4">
            {/* Toolbar */}
            <Toolbar />

            {/* Canvas */}
            <div className="flex-1 min-h-[500px] lg:min-h-[600px]">
              <Canvas />
            </div>
          </main>
        </div>
      </div>

      {/* Mobile drawer */}
      <MobileDrawer />
    </div>
  );
}
