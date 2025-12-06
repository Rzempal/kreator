// src/components/ui/WallConfig.tsx v0.003 Konfiguracja sciany - tryb edycji z zapisem
'use client';

import { useState } from 'react';
import { useWall, useKreatorStore } from '@/store/useKreatorStore';
import { cn } from '@/lib/utils';
import type { WallSegment, WallAlignment } from '@/types';

// Limity
const LIMITS = {
  width: { min: 30, max: 500 },
  height: { min: 50, max: 350 },
};

// Typ dla danych formularza segmentu
interface SegmentFormData {
  width: number;
  startHeight: number;
  endHeight: number;
  alignment: WallAlignment;
}

// Wartosci domyslne dla nowego segmentu
const DEFAULT_SEGMENT: SegmentFormData = {
  width: 100,
  startHeight: 250,
  endHeight: 250,
  alignment: 'bottom',
};

export default function WallConfig() {
  const wall = useWall();
  const { addSegment, removeSegment, updateSegment, clearPanels } = useKreatorStore();

  const [newSegment, setNewSegment] = useState<SegmentFormData>(DEFAULT_SEGMENT);
  const [isAdding, setIsAdding] = useState(false);

  // Oblicz calkowita szerokosc
  const totalWidth = wall.segments.reduce((sum, seg) => sum + seg.width, 0);

  // Dodaj nowy segment
  const handleAddSegment = () => {
    addSegment({
      width: newSegment.width,
      startHeight: newSegment.startHeight,
      endHeight: newSegment.endHeight,
      angle: 180,
      alignment: newSegment.alignment,
    });
    setNewSegment(DEFAULT_SEGMENT);
    setIsAdding(false);
    clearPanels();
  };

  // Usun segment
  const handleRemoveSegment = (id: string) => {
    if (wall.segments.length <= 1) {
      alert('Musisz miec przynajmniej jeden segment sciany');
      return;
    }
    removeSegment(id);
    clearPanels();
  };

  // Zapisz zmiany segmentu (wszystkie naraz)
  const handleSaveSegment = (id: string, data: SegmentFormData) => {
    updateSegment(id, {
      width: data.width,
      startHeight: data.startHeight,
      endHeight: data.endHeight,
      alignment: data.alignment,
    });
    clearPanels();
  };

  // Czy nowy segment ma skos
  const newSegmentIsSloped = newSegment.startHeight !== newSegment.endHeight;

  return (
    <div className="p-4 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700 space-y-4">
      {/* Naglowek */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Konfiguracja sciany
        </h3>
        <span className="text-xs text-slate-400">
          Szerokosc: {totalWidth} cm
        </span>
      </div>

      {/* Lista segmentow */}
      <div className="space-y-3">
        {wall.segments.map((segment, index) => (
          <SegmentRow
            key={segment.id}
            segment={segment}
            index={index}
            canDelete={wall.segments.length > 1}
            onSave={(data) => handleSaveSegment(segment.id, data)}
            onDelete={() => handleRemoveSegment(segment.id)}
          />
        ))}
      </div>

      {/* Dodawanie nowego segmentu */}
      {isAdding ? (
        <div className="p-3 bg-slate-700/50 rounded-lg space-y-3 border border-cyan-500/30">
          <div className="text-sm font-medium text-cyan-400">Nowy segment</div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-slate-400">Szerokosc</label>
              <input
                type="number"
                min={LIMITS.width.min}
                max={LIMITS.width.max}
                value={newSegment.width}
                onChange={(e) => setNewSegment({ ...newSegment, width: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm rounded bg-slate-700 border border-slate-600 text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Wys. lewa</label>
              <input
                type="number"
                min={LIMITS.height.min}
                max={LIMITS.height.max}
                value={newSegment.startHeight}
                onChange={(e) => setNewSegment({ ...newSegment, startHeight: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm rounded bg-slate-700 border border-slate-600 text-slate-200"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400">Wys. prawa</label>
              <input
                type="number"
                min={LIMITS.height.min}
                max={LIMITS.height.max}
                value={newSegment.endHeight}
                onChange={(e) => setNewSegment({ ...newSegment, endHeight: parseInt(e.target.value) || 0 })}
                className="w-full px-2 py-1 text-sm rounded bg-slate-700 border border-slate-600 text-slate-200"
              />
            </div>
          </div>

          {/* Wyrownanie dla nowego segmentu - tylko gdy skos */}
          {newSegmentIsSloped && (
            <AlignmentToggle
              value={newSegment.alignment}
              onChange={(alignment) => setNewSegment({ ...newSegment, alignment })}
            />
          )}

          <div className="flex gap-2">
            <button
              onClick={handleAddSegment}
              className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 transition-colors"
            >
              Dodaj segment
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setNewSegment(DEFAULT_SEGMENT);
              }}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-slate-600 text-slate-300 hover:bg-slate-500 transition-colors"
            >
              Anuluj
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="w-full px-3 py-2 text-sm font-medium rounded-lg border border-dashed border-slate-600 text-slate-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors"
        >
          + Dodaj segment sciany
        </button>
      )}

      {/* Info o skosach */}
      <div className="text-xs text-slate-500">
        Rozne wysokosci lewa/prawa tworza skos.
      </div>
    </div>
  );
}

// Komponent przelacznika wyrownania
interface AlignmentToggleProps {
  value: WallAlignment;
  onChange: (value: WallAlignment) => void;
}

function AlignmentToggle({ value, onChange }: AlignmentToggleProps) {
  return (
    <div className="pt-2">
      <label className="text-xs text-slate-400 block mb-2">Wyrownanie sciany (skos)</label>
      <div className="flex gap-1">
        <button
          type="button"
          onClick={() => onChange('bottom')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded transition-colors',
            value === 'bottom'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
          )}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 20h16" />
            <path d="M4 20V8l8-4v16" />
            <path d="M12 20V4l8 4v12" />
          </svg>
          Dol
        </button>
        <button
          type="button"
          onClick={() => onChange('top')}
          className={cn(
            'flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-xs font-medium rounded transition-colors',
            value === 'top'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
          )}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16" />
            <path d="M4 4v12l8 4V4" />
            <path d="M12 4v16l8-4V4" />
          </svg>
          Gora
        </button>
      </div>
    </div>
  );
}

// Komponent pojedynczego segmentu
interface SegmentRowProps {
  segment: WallSegment;
  index: number;
  canDelete: boolean;
  onSave: (data: SegmentFormData) => void;
  onDelete: () => void;
}

function SegmentRow({ segment, index, canDelete, onSave, onDelete }: SegmentRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<SegmentFormData>({
    width: segment.width,
    startHeight: segment.startHeight,
    endHeight: segment.endHeight,
    alignment: segment.alignment ?? 'bottom',
  });

  const isSloped = segment.startHeight !== segment.endHeight;
  const editIsSloped = editData.startHeight !== editData.endHeight;

  // Rozpocznij edycje
  const handleStartEdit = () => {
    setEditData({
      width: segment.width,
      startHeight: segment.startHeight,
      endHeight: segment.endHeight,
      alignment: segment.alignment ?? 'bottom',
    });
    setIsEditing(true);
  };

  // Zapisz zmiany
  const handleSave = () => {
    onSave(editData);
    setIsEditing(false);
  };

  // Anuluj edycje
  const handleCancel = () => {
    setIsEditing(false);
  };

  // Tryb podgladu (nie edycji)
  if (!isEditing) {
    return (
      <div className={cn(
        'p-3 rounded-lg border transition-colors',
        isSloped
          ? 'bg-amber-900/20 border-amber-500/30'
          : 'bg-slate-700/50 border-slate-600'
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300">
            Segment {index + 1}
            {isSloped && <span className="ml-2 text-xs text-amber-400">(skos)</span>}
          </span>
          <div className="flex gap-1">
            <button
              onClick={handleStartEdit}
              className="p-1 text-slate-400 hover:text-cyan-400 transition-colors"
              title="Edytuj segment"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            {canDelete && (
              <button
                onClick={onDelete}
                className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                title="Usun segment"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Podglad wartosci */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div>
            <span className="text-xs text-slate-500">Szer.</span>
            <div className="text-slate-300">{segment.width} cm</div>
          </div>
          <div>
            <span className="text-xs text-slate-500">Wys. L</span>
            <div className="text-slate-300">{segment.startHeight} cm</div>
          </div>
          <div>
            <span className="text-xs text-slate-500">Wys. P</span>
            <div className="text-slate-300">{segment.endHeight} cm</div>
          </div>
        </div>

        {/* Info o wyrownaniu dla skosow */}
        {isSloped && (
          <div className="mt-2 pt-2 border-t border-slate-600/50 text-xs text-slate-400">
            Wyrownanie: {(segment.alignment ?? 'bottom') === 'bottom' ? 'do dołu' : 'do góry'}
          </div>
        )}
      </div>
    );
  }

  // Tryb edycji
  return (
    <div className="p-3 rounded-lg border border-cyan-500/50 bg-cyan-900/20 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-cyan-400">
          Edycja segmentu {index + 1}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="text-xs text-slate-400">Szer. (cm)</label>
          <input
            type="number"
            min={LIMITS.width.min}
            max={LIMITS.width.max}
            value={editData.width}
            onChange={(e) => setEditData({ ...editData, width: parseInt(e.target.value) || 0 })}
            className="w-full px-2 py-1 text-sm rounded bg-slate-700 border border-slate-600 text-slate-200"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Wys. L (cm)</label>
          <input
            type="number"
            min={LIMITS.height.min}
            max={LIMITS.height.max}
            value={editData.startHeight}
            onChange={(e) => setEditData({ ...editData, startHeight: parseInt(e.target.value) || 0 })}
            className="w-full px-2 py-1 text-sm rounded bg-slate-700 border border-slate-600 text-slate-200"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Wys. P (cm)</label>
          <input
            type="number"
            min={LIMITS.height.min}
            max={LIMITS.height.max}
            value={editData.endHeight}
            onChange={(e) => setEditData({ ...editData, endHeight: parseInt(e.target.value) || 0 })}
            className="w-full px-2 py-1 text-sm rounded bg-slate-700 border border-slate-600 text-slate-200"
          />
        </div>
      </div>

      {/* Wyrownanie - tylko dla skosow */}
      {editIsSloped && (
        <AlignmentToggle
          value={editData.alignment}
          onChange={(alignment) => setEditData({ ...editData, alignment })}
        />
      )}

      {/* Przyciski akcji */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={handleSave}
          className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
        >
          Zapisz
        </button>
        <button
          onClick={handleCancel}
          className="px-3 py-2 text-sm font-medium rounded-lg bg-slate-600 text-slate-300 hover:bg-slate-500 transition-colors"
        >
          Anuluj
        </button>
      </div>
    </div>
  );
}
