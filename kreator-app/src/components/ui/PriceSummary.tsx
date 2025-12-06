// src/components/ui/PriceSummary.tsx v0.001 Podsumowanie wyceny
'use client';

import { usePriceSummary, useAddons, useKreatorStore } from '@/store/useKreatorStore';
import { formatPrice } from '@/lib/utils';

export default function PriceSummary() {
  const summary = usePriceSummary();
  const addons = useAddons();
  const { setAddons } = useKreatorStore();

  if (!summary || summary.panelsCount === 0) {
    return (
      <div className="p-4 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700">
        <div className="text-slate-400 text-sm text-center py-4">
          Dodaj panele aby zobaczyc wycene
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700 space-y-4">
      {/* Naglowek */}
      <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
        Wycena
      </h3>

      {/* Panele */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Panele ({summary.panelsCount} szt, {summary.totalArea} m²)
        </div>
        {summary.panels.map((item, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-slate-300">
              {item.dimension} ({item.category}) x{item.quantity}
            </span>
            <span className="text-slate-200">{formatPrice(item.totalPrice)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm font-medium border-t border-slate-700 pt-2">
          <span className="text-slate-200">Suma paneli</span>
          <span className="text-slate-100">{formatPrice(summary.panelsTotal)}</span>
        </div>
      </div>

      {/* Dodatki */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          Dodatki
        </div>

        {/* Podwojna pianka */}
        <label className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={addons.doubleFoam}
              onChange={(e) => setAddons({ doubleFoam: e.target.checked })}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-sm text-slate-300">Podwojna pianka</span>
          </div>
          <span className="text-sm text-slate-400">
            {summary.addons.doubleFoam > 0 ? formatPrice(summary.addons.doubleFoam) : '-'}
          </span>
        </label>

        {/* Rzep montazowy */}
        <label className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={addons.velcro}
              onChange={(e) => setAddons({ velcro: e.target.checked })}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-sm text-slate-300">Rzep montazowy</span>
          </div>
          <span className="text-sm text-slate-400">
            {summary.addons.velcro > 0 ? formatPrice(summary.addons.velcro) : '-'}
          </span>
        </label>

        {/* Otwory na kontakt */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">Otwory na kontakt</label>
            <input
              type="number"
              min={0}
              max={10}
              value={addons.socketHoles}
              onChange={(e) => setAddons({ socketHoles: parseInt(e.target.value) || 0 })}
              className="w-16 px-2 py-1 text-sm rounded bg-slate-700 border border-slate-600 text-slate-200"
            />
          </div>
          <span className="text-sm text-slate-400">
            {summary.addons.socketHoles > 0 ? formatPrice(summary.addons.socketHoles) : '-'}
          </span>
        </div>

        {/* Klej */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-300">Klej montazowy</label>
            <input
              type="number"
              min={0}
              max={10}
              value={addons.glueCount}
              onChange={(e) => setAddons({ glueCount: parseInt(e.target.value) || 0 })}
              className="w-16 px-2 py-1 text-sm rounded bg-slate-700 border border-slate-600 text-slate-200"
            />
          </div>
          <span className="text-sm text-slate-400">
            {summary.addons.glue > 0 ? formatPrice(summary.addons.glue) : '-'}
          </span>
        </div>

        {summary.addonsTotal > 0 && (
          <div className="flex justify-between text-sm font-medium border-t border-slate-700 pt-2">
            <span className="text-slate-200">Suma dodatkow</span>
            <span className="text-slate-100">{formatPrice(summary.addonsTotal)}</span>
          </div>
        )}
      </div>

      {/* Wysylka */}
      <div className="flex justify-between text-sm">
        <span className="text-slate-300">Wysylka</span>
        <span className="text-slate-200">{formatPrice(summary.shipping)}</span>
      </div>

      {/* Suma calkowita */}
      <div className="flex justify-between items-center pt-3 border-t-2 border-slate-600">
        <span className="text-lg font-bold text-slate-100">RAZEM</span>
        <span className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          {formatPrice(summary.grandTotal)}
        </span>
      </div>
    </div>
  );
}
