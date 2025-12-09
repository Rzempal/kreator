// src/components/ui/ColorPicker.tsx v0.005 Dodano wybor koloru sciany
'use client';

import { useState, useMemo } from 'react';
import { useKreatorStore, useActiveColor, useToolMode, useCanvasColor } from '@/store/useKreatorStore';
import { cn } from '@/lib/utils';
import fabricsData from '@/data/fabrics.json';
import type { PriceCategory } from '@/types';

// Typy dla danych tkanin
interface FabricColor {
  id: string;
  name: string;
  image: string | null;
}

interface FabricCollection {
  category: PriceCategory;
  colors: FabricColor[];
}

type CollectionsData = Record<string, FabricCollection>;

const collections = fabricsData.collections as CollectionsData;
const categories = fabricsData.categories as Record<PriceCategory, string[]>;

// Etykiety kategorii
const CATEGORY_LABELS: Record<PriceCategory, string> = {
  standard: 'Standard',
  premium: 'Premium',
  exclusive: 'Exclusive',
};

const CATEGORY_COLORS: Record<PriceCategory, string> = {
  standard: 'text-green-400',
  premium: 'text-yellow-400',
  exclusive: 'text-purple-400',
};

// Predefiniowane kolory sciany - szersza paleta
const CANVAS_COLORS = [
  // Ciemne
  { id: 'slate-900', hex: '#0f172a', name: 'Antracyt' },
  { id: 'slate-800', hex: '#1e293b', name: 'Ciemny grafitowy' },
  { id: 'slate-700', hex: '#334155', name: 'Grafitowy' },
  { id: 'gray-600', hex: '#4b5563', name: 'Szary ciemny' },
  // Srednie
  { id: 'gray-400', hex: '#9ca3af', name: 'Szary' },
  { id: 'stone-400', hex: '#a8a29e', name: 'Kamienny' },
  { id: 'zinc-300', hex: '#d4d4d8', name: 'Cynkowy' },
  // Jasne neutralne
  { id: 'neutral-200', hex: '#e5e5e5', name: 'Jasny szary' },
  { id: 'stone-200', hex: '#e7e5e4', name: 'Piaskowy' },
  { id: 'neutral-100', hex: '#f5f5f5', name: 'Platynowy' },
  // Ciepłe
  { id: 'amber-100', hex: '#fef3c7', name: 'Waniliowy' },
  { id: 'amber-50', hex: '#fffbeb', name: 'Kremowy' },
  { id: 'orange-50', hex: '#fff7ed', name: 'Brzoskwiniowy' },
  // Chłodne
  { id: 'blue-50', hex: '#eff6ff', name: 'Lodowy błękit' },
  { id: 'sky-100', hex: '#e0f2fe', name: 'Błękitny' },
  { id: 'green-50', hex: '#f0fdf4', name: 'Miętowy' },
  // Biel
  { id: 'white', hex: '#ffffff', name: 'Biały' },
];

export default function ColorPicker() {
  const activeColorId = useActiveColor();
  const toolMode = useToolMode();
  const canvasColor = useCanvasColor();
  const { setActiveColor, setToolMode, setCanvasColor } = useKreatorStore();

  // Stan wyboru kolekcji
  const [selectedCategory, setSelectedCategory] = useState<PriceCategory>('standard');
  const [selectedCollection, setSelectedCollection] = useState<string>(
    categories.standard[0] || 'DIANA'
  );
  const [isCollectionOpen, setIsCollectionOpen] = useState(false);

  // Pobierz kolekcje dla wybranej kategorii
  const collectionsInCategory = useMemo(() => {
    return categories[selectedCategory] || [];
  }, [selectedCategory]);

  // Pobierz kolory dla wybranej kolekcji
  const colorsInCollection = useMemo(() => {
    const collection = collections[selectedCollection];
    return collection?.colors || [];
  }, [selectedCollection]);

  const handleColorClick = (colorId: string) => {
    setActiveColor(colorId);
    setToolMode('paint');
  };

  const handleCategoryChange = (category: PriceCategory) => {
    setSelectedCategory(category);
    // Wybierz pierwszą kolekcję z nowej kategorii
    const firstCollection = categories[category]?.[0];
    if (firstCollection) {
      setSelectedCollection(firstCollection);
    }
  };

  const handleCollectionSelect = (collectionName: string) => {
    setSelectedCollection(collectionName);
    setIsCollectionOpen(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Sekcja: Kolor sciany */}
      <div className="pb-3 border-b border-slate-700">
        <div className="text-xs text-slate-400 mb-2 font-medium">Kolor ściany</div>
        <div className="flex gap-1.5 flex-wrap">
          {CANVAS_COLORS.map((color) => (
            <button
              key={color.id}
              onClick={() => setCanvasColor(color.hex)}
              className={cn(
                'w-7 h-7 rounded-md border-2 transition-all hover:scale-110',
                canvasColor === color.hex
                  ? 'border-cyan-400 ring-2 ring-cyan-400/50'
                  : 'border-slate-600 hover:border-slate-400'
              )}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>

      {/* Kategorie - tabs */}
      <div className="flex gap-1">
        {(Object.keys(categories) as PriceCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={cn(
              'flex-1 px-2 py-1 text-xs font-medium rounded transition-all',
              selectedCategory === cat
                ? 'bg-slate-600 text-white'
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
            )}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Dropdown kolekcji */}
      <div className="relative">
        <button
          onClick={() => setIsCollectionOpen(!isCollectionOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-slate-700 rounded-lg border border-slate-600 text-sm text-left hover:bg-slate-600 transition-colors"
        >
          <span className="font-medium">{selectedCollection}</span>
          <span className={cn('text-xs', CATEGORY_COLORS[selectedCategory])}>
            {CATEGORY_LABELS[selectedCategory]}
          </span>
          <svg
            className={cn('w-4 h-4 transition-transform', isCollectionOpen && 'rotate-180')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Lista kolekcji */}
        {isCollectionOpen && (
          <div className="absolute z-50 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-xl max-h-48 overflow-y-auto">
            {collectionsInCategory.map((collName) => (
              <button
                key={collName}
                onClick={() => handleCollectionSelect(collName)}
                className={cn(
                  'w-full px-3 py-2 text-sm text-left hover:bg-slate-600 transition-colors',
                  selectedCollection === collName && 'bg-slate-600 text-cyan-400'
                )}
              >
                {collName}
                <span className="text-xs text-slate-400 ml-2">
                  ({collections[collName]?.colors.length || 0})
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Siatka kolorow z miniaturkami */}
      <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-[300px] pr-1">
        {colorsInCollection.map((color) => (
          <button
            key={color.id}
            onClick={() => handleColorClick(color.id)}
            className={cn(
              'relative aspect-square rounded-lg border-2 transition-all hover:scale-105 overflow-hidden group',
              activeColorId === color.id && toolMode === 'paint'
                ? 'border-cyan-400 ring-2 ring-cyan-400/50'
                : 'border-slate-600 hover:border-slate-400'
            )}
            title={color.name}
          >
            {color.image ? (
              <img
                src={color.image}
                alt={color.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-slate-600 flex items-center justify-center">
                <span className="text-xs text-slate-400">?</span>
              </div>
            )}
            {/* Tooltip on hover */}
            <div className="absolute inset-x-0 bottom-0 bg-black/70 text-[10px] text-white p-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
              {color.name.split(' - ')[1] || color.name}
            </div>
          </button>
        ))}
      </div>

      {/* Info o wybranym kolorze */}
      {activeColorId && toolMode === 'paint' && (
        <div className="text-xs text-cyan-400">
          Kliknij panel aby zmienic tkanine
        </div>
      )}
    </div>
  );
}
