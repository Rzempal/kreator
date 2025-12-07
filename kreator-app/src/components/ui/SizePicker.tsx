// src/components/ui/SizePicker.tsx v0.001 Wybór rozmiaru paneli
'use client';

import { useState, useMemo } from 'react';
import { useKreatorStore } from '@/store/useKreatorStore';
import { cn } from '@/lib/utils';
import { getStandardDimensions, isStandardDimension } from '@/lib/pricing';

// Popularne rozmiary pogrupowane
const SIZE_GROUPS = {
  'Małe (do 40cm)': ['20x20', '20x30', '20x40', '30x30', '30x40', '40x40'],
  'Średnie': ['30x50', '30x60', '40x50', '40x60', '50x50', '50x60', '60x60'],
  'Wąskie pionowe': ['10x100', '15x100', '20x100', '10x120', '15x120', '20x120', '10x150', '15x150', '20x150'],
  'Duże': ['30x100', '40x100', '30x120', '40x120'],
};

function parseDimension(dim: string): { width: number; height: number } | null {
  const match = dim.match(/^(\d+)x(\d+)$/);
  if (!match) return null;
  return { width: parseInt(match[1]), height: parseInt(match[2]) };
}

export default function SizePicker() {
  const { setActivePanelSize, setToolMode } = useKreatorStore();
  const activePanelSize = useKreatorStore((s) => s.activePanelSize);

  // Stan dla własnych wymiarów
  const [customWidth, setCustomWidth] = useState('30');
  const [customHeight, setCustomHeight] = useState('30');
  const [showAllSizes, setShowAllSizes] = useState(false);

  // Wszystkie standardowe wymiary
  const allStandardSizes = useMemo(() => getStandardDimensions(), []);

  const handleSizeSelect = (dim: string) => {
    const parsed = parseDimension(dim);
    if (parsed) {
      setActivePanelSize(parsed);
      setToolMode('select'); // Aktywuj tryb dodawania
    }
  };

  const handleCustomSize = () => {
    const w = parseInt(customWidth);
    const h = parseInt(customHeight);
    if (w >= 10 && w <= 300 && h >= 10 && h <= 300) {
      setActivePanelSize({ width: w, height: h });
      setToolMode('select');
    }
  };

  const isCustom = !isStandardDimension(
    parseInt(customWidth) || 0,
    parseInt(customHeight) || 0
  );

  const activeSizeKey = activePanelSize
    ? `${activePanelSize.width}x${activePanelSize.height}`
    : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Własny wymiar */}
      <div className="space-y-2">
        <div className="text-xs text-slate-400 font-medium">Własny wymiar (cm)</div>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min="10"
            max="300"
            value={customWidth}
            onChange={(e) => setCustomWidth(e.target.value)}
            className="w-16 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-center"
            placeholder="Szer"
          />
          <span className="text-slate-500">×</span>
          <input
            type="number"
            min="10"
            max="300"
            value={customHeight}
            onChange={(e) => setCustomHeight(e.target.value)}
            className="w-16 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-center"
            placeholder="Wys"
          />
          <button
            onClick={handleCustomSize}
            className="flex-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium rounded transition-colors"
          >
            Ustaw
          </button>
        </div>
        {isCustom && customWidth && customHeight && (
          <div className="text-xs text-amber-400">
            Wymiar nietypowy - cena wg. m²
          </div>
        )}
      </div>

      {/* Separator */}
      <div className="h-px bg-slate-700" />

      {/* Popularne rozmiary */}
      <div className="space-y-3">
        <div className="text-xs text-slate-400 font-medium">Popularne rozmiary</div>

        {Object.entries(SIZE_GROUPS).map(([groupName, sizes]) => (
          <div key={groupName} className="space-y-1.5">
            <div className="text-xs text-slate-500">{groupName}</div>
            <div className="flex flex-wrap gap-1.5">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  className={cn(
                    'px-2 py-1 text-xs rounded transition-all',
                    activeSizeKey === size
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pokaż wszystkie */}
      <button
        onClick={() => setShowAllSizes(!showAllSizes)}
        className="text-xs text-cyan-400 hover:text-cyan-300 text-left"
      >
        {showAllSizes ? '▲ Ukryj wszystkie' : '▼ Pokaż wszystkie standardowe'}
      </button>

      {showAllSizes && (
        <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
          {allStandardSizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeSelect(size)}
              className={cn(
                'px-1.5 py-0.5 text-[10px] rounded transition-all',
                activeSizeKey === size
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600'
              )}
            >
              {size}
            </button>
          ))}
        </div>
      )}

      {/* Aktywny rozmiar */}
      {activePanelSize && (
        <div className="p-2 bg-slate-700/50 rounded-lg">
          <div className="text-xs text-slate-400">Aktywny rozmiar:</div>
          <div className="text-lg font-bold text-cyan-400">
            {activePanelSize.width} × {activePanelSize.height} cm
          </div>
          <div className="text-xs text-slate-500">
            Kliknij na ścianę aby dodać panel
          </div>
        </div>
      )}
    </div>
  );
}
