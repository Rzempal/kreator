// src/components/pdf/ExportPdfButton.tsx v0.001 Przycisk eksportu do PDF
'use client';

import { useState } from 'react';
import { pdf } from '@react-pdf/renderer';
import { usePriceSummary, useAddons } from '@/store/useKreatorStore';
import QuoteTemplate from './QuoteTemplate';
import { cn } from '@/lib/utils';

export default function ExportPdfButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const priceSummary = usePriceSummary();
  const addons = useAddons();

  const handleExport = async () => {
    if (!priceSummary || priceSummary.panelsCount === 0) {
      alert('Dodaj panele aby wygenerowac wycene PDF');
      return;
    }

    setIsGenerating(true);

    try {
      // Generuj PDF
      const blob = await pdf(
        <QuoteTemplate priceSummary={priceSummary} addons={addons} />
      ).toBlob();

      // Utworz link do pobrania
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wycena-paneli-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('[PDF] Wygenerowano i pobrano PDF');
    } catch (error) {
      console.error('[PDF] Blad generowania:', error);
      alert('Wystapil blad podczas generowania PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const isDisabled = !priceSummary || priceSummary.panelsCount === 0;

  return (
    <button
      onClick={handleExport}
      disabled={isDisabled || isGenerating}
      className={cn(
        'flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
        'font-medium text-sm transition-all w-full',
        'border',
        isDisabled
          ? 'bg-slate-700/50 border-slate-600 text-slate-500 cursor-not-allowed'
          : isGenerating
          ? 'bg-purple-600/50 border-purple-500 text-purple-200 cursor-wait'
          : 'bg-gradient-to-r from-purple-600 to-pink-600 border-purple-500 text-white hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:shadow-purple-500/25'
      )}
    >
      {isGenerating ? (
        <>
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Generowanie...
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Pobierz wycene PDF
        </>
      )}
    </button>
  );
}
