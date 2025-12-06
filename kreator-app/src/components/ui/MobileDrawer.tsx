// src/components/ui/MobileDrawer.tsx v0.002 Wysuwany panel dla mobile
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import WallConfig from './WallConfig';
import ColorPicker from './ColorPicker';
import PriceSummary from './PriceSummary';

type Tab = 'wall' | 'colors' | 'price';

export default function MobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('colors');

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50 lg:hidden',
          'bg-slate-900 border-t border-slate-700 rounded-t-2xl',
          'transition-transform duration-300 ease-out',
          isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'
        )}
        style={{ maxHeight: '70vh' }}
      >
        {/* Handle + Tabs */}
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Handle */}
          <div className="w-12 h-1 bg-slate-600 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />

          {/* Tabs */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('wall');
                setIsOpen(true);
              }}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === 'wall'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300'
              )}
            >
              Sciana
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('colors');
                setIsOpen(true);
              }}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === 'colors'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700 text-slate-300'
              )}
            >
              Kolory
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab('price');
                setIsOpen(true);
              }}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                activeTab === 'price'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-300'
              )}
            >
              Wycena
            </button>
          </div>

          {/* Chevron */}
          <svg
            className={cn(
              'w-6 h-6 text-slate-400 transition-transform',
              isOpen ? 'rotate-180' : ''
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </div>

        {/* Content */}
        <div className="px-4 pb-6 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 60px)' }}>
          {activeTab === 'wall' && <WallConfig />}
          {activeTab === 'colors' && <ColorPicker />}
          {activeTab === 'price' && <PriceSummary />}
        </div>
      </div>
    </>
  );
}
