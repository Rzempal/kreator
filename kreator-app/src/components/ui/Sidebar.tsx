// src/components/ui/Sidebar.tsx v0.002 Accordion sidebar z sekcjami
'use client';

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import WallConfig from './WallConfig';
import ColorPicker from './ColorPicker';
import SizePicker from './SizePicker';
import PriceSummary from './PriceSummary';

interface AccordionSectionProps {
  id: string;
  title: string;
  icon: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
  badge?: string | number;
}

function AccordionSection({
  title,
  icon,
  isOpen,
  onToggle,
  children,
  badge,
}: AccordionSectionProps) {
  return (
    <div className="border border-slate-700 rounded-xl overflow-hidden bg-slate-800/50">
      {/* Header - zawsze widoczny */}
      <button
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors',
          'hover:bg-slate-700/50',
          isOpen && 'bg-slate-700/30'
        )}
      >
        {/* Ikona */}
        <span className="text-slate-400">{icon}</span>

        {/* Tytul */}
        <span className="flex-1 font-medium text-slate-200">{title}</span>

        {/* Badge (opcjonalny) */}
        {badge !== undefined && (
          <span className="px-2 py-0.5 text-xs bg-cyan-500/20 text-cyan-400 rounded-full">
            {badge}
          </span>
        )}

        {/* Strzalka */}
        <svg
          className={cn(
            'w-5 h-5 text-slate-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Content - zwijana */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="p-3 pt-0">{children}</div>
      </div>
    </div>
  );
}

// Ikony SVG
const icons = {
  wall: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  ),
  fabric: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  ),
  size: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  ),
  price: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

type SectionId = 'wall' | 'fabric' | 'size' | 'price';

export default function Sidebar() {
  // Domyslnie otwarta sekcja tkanin
  const [openSection, setOpenSection] = useState<SectionId | null>('fabric');

  const toggleSection = (id: SectionId) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  return (
    <div className="flex flex-col gap-3 w-72 flex-shrink-0">
      {/* Sciana */}
      <AccordionSection
        id="wall"
        title="Sciana"
        icon={icons.wall}
        isOpen={openSection === 'wall'}
        onToggle={() => toggleSection('wall')}
      >
        <WallConfig />
      </AccordionSection>

      {/* Tkaniny */}
      <AccordionSection
        id="fabric"
        title="Tkaniny"
        icon={icons.fabric}
        isOpen={openSection === 'fabric'}
        onToggle={() => toggleSection('fabric')}
      >
        <ColorPicker />
      </AccordionSection>

      {/* Rozmiary */}
      <AccordionSection
        id="size"
        title="Rozmiary"
        icon={icons.size}
        isOpen={openSection === 'size'}
        onToggle={() => toggleSection('size')}
      >
        <SizePicker />
      </AccordionSection>

      {/* Wycena - zawsze widoczna podsumowanie */}
      <AccordionSection
        id="price"
        title="Wycena"
        icon={icons.price}
        isOpen={openSection === 'price'}
        onToggle={() => toggleSection('price')}
      >
        <PriceSummary />
      </AccordionSection>
    </div>
  );
}
