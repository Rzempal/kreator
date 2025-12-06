// src/components/ui/Toolbar.tsx v0.001 Pasek narzedzi z rozmiarami paneli
'use client';

import { useKreatorStore } from '@/store/useKreatorStore';
import { cn } from '@/lib/utils';

// Popularne rozmiary paneli
const PANEL_SIZES = [
  { width: 30, height: 100, label: '30x100' },
  { width: 20, height: 100, label: '20x100' },
  { width: 30, height: 60, label: '30x60' },
  { width: 40, height: 60, label: '40x60' },
  { width: 20, height: 140, label: '20x140' },
  { width: 15, height: 100, label: '15x100' },
];

export default function Toolbar() {
  const { activePanelSize, setActivePanelSize, undoLastPanel, clearPanels, panels } =
    useKreatorStore();

  const handleSizeClick = (width: number, height: number) => {
    // Toggle - jesli ten sam rozmiar, wylacz
    if (activePanelSize?.width === width && activePanelSize?.height === height) {
      setActivePanelSize(null);
    } else {
      setActivePanelSize({ width, height });
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700">
      {/* Rozmiary paneli */}
      <div className="flex flex-wrap gap-2">
        {PANEL_SIZES.map((size) => {
          const isActive =
            activePanelSize?.width === size.width &&
            activePanelSize?.height === size.height;

          return (
            <button
              key={size.label}
              onClick={() => handleSizeClick(size.width, size.height)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                'border border-slate-600 hover:border-cyan-500',
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-transparent'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              )}
            >
              {size.label}
            </button>
          );
        })}
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-slate-600 mx-2 hidden sm:block" />

      {/* Akcje */}
      <div className="flex gap-2">
        <button
          onClick={undoLastPanel}
          disabled={panels.length === 0}
          className={cn(
            'p-2 rounded-lg transition-all',
            'border border-slate-600 hover:border-amber-500',
            panels.length === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          )}
          title="Cofnij ostatni panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        <button
          onClick={() => {
            if (panels.length > 0 && confirm('Czy na pewno chcesz usunac wszystkie panele?')) {
              clearPanels();
            }
          }}
          disabled={panels.length === 0}
          className={cn(
            'p-2 rounded-lg transition-all',
            'border border-slate-600 hover:border-red-500',
            panels.length === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-slate-700 text-slate-200 hover:bg-red-900/50'
          )}
          title="Wyczysc wszystkie panele"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Licznik paneli */}
      {panels.length > 0 && (
        <div className="ml-auto px-3 py-1 bg-slate-700 rounded-full text-sm text-slate-300">
          {panels.length} {panels.length === 1 ? 'panel' : 'paneli'}
        </div>
      )}
    </div>
  );
}
