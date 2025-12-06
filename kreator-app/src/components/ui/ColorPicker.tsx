// src/components/ui/ColorPicker.tsx v0.001 Paleta kolorow
'use client';

import { useKreatorStore, useActiveColor, useToolMode } from '@/store/useKreatorStore';
import { cn } from '@/lib/utils';
import fabricsData from '@/data/fabrics.json';

export default function ColorPicker() {
  const activeColorId = useActiveColor();
  const toolMode = useToolMode();
  const { setActiveColor, setToolMode } = useKreatorStore();

  const handleColorClick = (colorId: string) => {
    setActiveColor(colorId);
    setToolMode('paint');
  };

  const handleEraserClick = () => {
    setToolMode(toolMode === 'erase' ? 'select' : 'erase');
  };

  return (
    <div className="flex flex-col gap-3 p-3 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700">
      {/* Naglowek */}
      <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        Kolory
      </div>

      {/* Paleta */}
      <div className="grid grid-cols-5 gap-2">
        {fabricsData.defaultPalette.map((color) => (
          <button
            key={color.id}
            onClick={() => handleColorClick(color.id)}
            className={cn(
              'w-8 h-8 rounded-lg border-2 transition-all hover:scale-110',
              activeColorId === color.id && toolMode === 'paint'
                ? 'border-cyan-400 ring-2 ring-cyan-400/50'
                : 'border-slate-600 hover:border-slate-400'
            )}
            style={{ backgroundColor: color.hex }}
            title={color.name}
          />
        ))}
      </div>

      {/* Separator */}
      <div className="h-px bg-slate-700" />

      {/* Narzedzia */}
      <div className="flex gap-2">
        {/* Gumka */}
        <button
          onClick={handleEraserClick}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all',
            'border text-sm font-medium',
            toolMode === 'erase'
              ? 'bg-red-600 border-red-500 text-white'
              : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
          )}
          title="Tryb gumki - kliknij panel aby go usunac"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Gumka
        </button>
      </div>

      {/* Info o aktywnym narzedziu */}
      {toolMode === 'paint' && (
        <div className="text-xs text-cyan-400">
          Kliknij panel aby zmienic kolor
        </div>
      )}
      {toolMode === 'erase' && (
        <div className="text-xs text-red-400">
          Kliknij panel aby go usunac
        </div>
      )}
    </div>
  );
}
