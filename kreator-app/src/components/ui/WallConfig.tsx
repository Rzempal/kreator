// src/components/ui/WallConfig.tsx v0.005 Toggle widoku z gory
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
  const { addSegment, removeSegment, updateSegment, setMasterSegment, clearPanels, showTopView, setShowTopView } = useKreatorStore();

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
    console.log('[WallConfig] handleSaveSegment:', id, data);
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
            isMaster={wall.masterSegmentId === segment.id}
            isLast={index === wall.segments.length - 1}
            onSave={(data) => handleSaveSegment(segment.id, data)}
            onDelete={() => handleRemoveSegment(segment.id)}
            onSetMaster={() => setMasterSegment(segment.id)}
            onAngleChange={(angle) => {
              updateSegment(segment.id, { angle });
              clearPanels();
            }}
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

      {/* Toggle widoku z gory */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={showTopView}
            onChange={(e) => setShowTopView(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-10 h-5 bg-slate-700 rounded-full peer peer-checked:bg-cyan-600 transition-colors" />
          <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-slate-400 rounded-full peer-checked:translate-x-5 peer-checked:bg-white transition-all" />
        </div>
        <span className="text-sm text-slate-300 group-hover:text-slate-200">
          Widok z gory (uklad katowy)
        </span>
      </label>
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
  isMaster: boolean;
  isLast: boolean;
  onSave: (data: SegmentFormData) => void;
  onDelete: () => void;
  onSetMaster: () => void;
  onAngleChange: (angle: 90 | 180 | 270) => void;
}

function SegmentRow({ segment, index, canDelete, isMaster, isLast, onSave, onDelete, onSetMaster, onAngleChange }: SegmentRowProps) {
  const showTopView = useKreatorStore((state) => state.showTopView);
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
        isMaster
          ? 'bg-purple-900/30 border-purple-500/50'
          : isSloped
            ? 'bg-amber-900/20 border-amber-500/30'
            : 'bg-slate-700/50 border-slate-600'
      )}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-300 flex items-center gap-2">
            Segment {index + 1}
            {isMaster && <span className="text-xs bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded">Main</span>}
            {isSloped && <span className="text-xs text-amber-400">(skos)</span>}
          </span>
          <div className="flex gap-1">
            {/* Przycisk Main */}
            <button
              onClick={onSetMaster}
              className={cn(
                'p-1 transition-colors',
                isMaster
                  ? 'text-purple-400'
                  : 'text-slate-400 hover:text-purple-400'
              )}
              title={isMaster ? 'Segment główny' : 'Ustaw jako główny'}
            >
              <svg className="w-4 h-4" fill={isMaster ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </button>
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

        {/* Selektor kata - tylko gdy widok z gory aktywny i nie ostatni segment */}
        {showTopView && !isLast && (
          <div className="mt-2 pt-2 border-t border-slate-600/50">
            <label className="text-xs text-slate-500 block mb-1">Kąt z następnym segmentem</label>
            <div className="flex gap-1">
              {([90, 180, 270] as const).map((angle) => (
                <button
                  key={angle}
                  onClick={() => onAngleChange(angle)}
                  className={cn(
                    'flex-1 px-2 py-1 text-xs font-medium rounded transition-colors',
                    segment.angle === angle
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                  )}
                >
                  {angle}°
                </button>
              ))}
            </div>
          </div>
        )}

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
