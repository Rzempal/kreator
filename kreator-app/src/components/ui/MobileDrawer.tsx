// src/components/ui/MobileDrawer.tsx v0.004 Naprawiono scrollowanie content
'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useKreatorStore, useSavedProjects, useCurrentProjectId } from '@/store/useKreatorStore';
import WallConfig from './WallConfig';
import ColorPicker from './ColorPicker';
import SizePicker from './SizePicker';
import PriceSummary from './PriceSummary';

type Tab = 'projects' | 'wall' | 'colors' | 'sizes' | 'price';

// Komponent zarzadzania projektami dla mobile
function MobileProjectsSection() {
  const [newProjectName, setNewProjectName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const savedProjects = useSavedProjects();
  const currentProjectId = useCurrentProjectId();

  const {
    saveProjectAs,
    saveCurrentProject,
    loadProject,
    deleteProject,
    renameProject,
    newProject,
    exportProjectToJSON,
    importProjectFromJSON,
    panels,
  } = useKreatorStore();

  const handleSaveAs = useCallback(() => {
    const name = newProjectName.trim() || `Projekt ${savedProjects.length + 1}`;
    saveProjectAs(name);
    setNewProjectName('');
  }, [newProjectName, savedProjects.length, saveProjectAs]);

  const handleSaveCurrent = useCallback(() => {
    if (currentProjectId) {
      saveCurrentProject();
    } else {
      handleSaveAs();
    }
  }, [currentProjectId, saveCurrentProject, handleSaveAs]);

  const handleLoad = useCallback((projectId: string) => {
    if (panels.length > 0 && currentProjectId !== projectId) {
      if (!confirm('Masz niezapisane zmiany. Wczytac inny projekt?')) return;
    }
    loadProject(projectId);
  }, [panels.length, currentProjectId, loadProject]);

  const handleDelete = useCallback((projectId: string, name: string) => {
    if (confirm(`Usunac projekt "${name}"?`)) {
      deleteProject(projectId);
    }
  }, [deleteProject]);

  const handleStartRename = useCallback((projectId: string, name: string) => {
    setEditingId(projectId);
    setEditingName(name);
  }, []);

  const handleSaveRename = useCallback(() => {
    if (editingId && editingName.trim()) {
      renameProject(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  }, [editingId, editingName, renameProject]);

  const handleNewProject = useCallback(() => {
    if (panels.length > 0) {
      if (!confirm('Masz niezapisane zmiany. Utworzyc nowy projekt?')) return;
    }
    newProject();
  }, [panels.length, newProject]);

  const handleExport = useCallback(() => {
    const json = exportProjectToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kreator-projekt-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [exportProjectToJSON]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importProjectFromJSON(content);
      setImportError(success ? null : 'Nieprawidlowy format JSON');
    };
    reader.onerror = () => setImportError('Blad odczytu pliku');
    reader.readAsText(file);
    e.target.value = '';
  }, [importProjectFromJSON]);

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('pl-PL', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const currentProject = savedProjects.find(p => p.id === currentProjectId);

  return (
    <div className="space-y-3">
      {/* Aktywny projekt */}
      {currentProject && (
        <div className="p-2 bg-cyan-900/30 border border-cyan-700 rounded-lg">
          <div className="text-xs text-cyan-400 mb-1">Aktywny projekt:</div>
          <div className="font-medium text-white text-sm truncate">{currentProject.name}</div>
        </div>
      )}

      {/* Zapisz */}
      <div className="space-y-2">
        <div className="flex gap-1">
          <input
            type="text"
            placeholder="Nazwa projektu..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveAs()}
            className="flex-1 px-2 py-1.5 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={handleSaveAs}
            className="px-2 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs rounded transition-colors"
            title="Zapisz jako nowy"
          >
            Nowy
          </button>
        </div>

        {currentProjectId && (
          <button
            onClick={handleSaveCurrent}
            className="w-full px-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded transition-colors"
          >
            Zapisz zmiany
          </button>
        )}

        <button
          onClick={handleNewProject}
          className="w-full px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded border border-slate-600 transition-colors"
        >
          Wyczysc (nowy projekt)
        </button>
      </div>

      {/* Lista projektow */}
      {savedProjects.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-slate-400">Zapisane ({savedProjects.length}):</div>
          <div className="max-h-[40vh] overflow-y-auto space-y-1">
            {savedProjects.map((project) => (
              <div
                key={project.id}
                className={cn(
                  'p-2 rounded border text-xs transition-colors',
                  currentProjectId === project.id
                    ? 'bg-cyan-900/30 border-cyan-600'
                    : 'bg-slate-700/50 border-slate-600'
                )}
              >
                {editingId === project.id ? (
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onBlur={handleSaveRename}
                    autoFocus
                    className="w-full px-1 py-0.5 bg-slate-600 border border-slate-500 rounded text-white text-xs focus:outline-none"
                  />
                ) : (
                  <>
                    <div className="font-medium text-white truncate">{project.name}</div>
                    <div className="text-slate-400 mt-0.5">
                      {project.panels.length} paneli | {formatDate(project.updatedAt)}
                    </div>
                    <div className="flex gap-1 mt-1">
                      <button
                        onClick={() => handleLoad(project.id)}
                        className="px-1.5 py-0.5 bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
                      >
                        Wczytaj
                      </button>
                      <button
                        onClick={() => handleStartRename(project.id, project.name)}
                        className="px-1.5 py-0.5 bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
                      >
                        Zmien
                      </button>
                      <button
                        onClick={() => handleDelete(project.id, project.name)}
                        className="px-1.5 py-0.5 bg-red-600/50 hover:bg-red-600 text-white rounded transition-colors"
                      >
                        Usun
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Import/Export */}
      <div className="flex gap-1 pt-2 border-t border-slate-700">
        <button
          onClick={handleExport}
          className="flex-1 px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded border border-slate-600 transition-colors"
        >
          Eksport
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded border border-slate-600 transition-colors"
        >
          Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
      {importError && <p className="text-xs text-red-400">{importError}</p>}
    </div>
  );
}

export default function MobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('colors');

  const savedProjects = useSavedProjects();
  const currentProjectId = useCurrentProjectId();
  const currentProject = savedProjects.find(p => p.id === currentProjectId);

  const tabs: { id: Tab; label: string; color: string }[] = [
    { id: 'projects', label: currentProject ? 'Projekt' : 'Projekty', color: 'bg-amber-600' },
    { id: 'wall', label: 'Sciana', color: 'bg-purple-600' },
    { id: 'colors', label: 'Kolory', color: 'bg-cyan-600' },
    { id: 'sizes', label: 'Rozmiary', color: 'bg-indigo-600' },
    { id: 'price', label: 'Wycena', color: 'bg-emerald-600' },
  ];

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
          'transition-transform duration-300 ease-out flex flex-col',
          isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'
        )}
        style={{ maxHeight: '80vh' }}
      >
        {/* Handle + Tabs */}
        <div
          className="flex items-center justify-between px-2 py-3 cursor-pointer flex-shrink-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          {/* Handle */}
          <div className="w-12 h-1 bg-slate-600 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />

          {/* Tabs - scrollowalne */}
          <div className="flex gap-1 mt-2 overflow-x-auto pb-1 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTab(tab.id);
                  setIsOpen(true);
                }}
                className={cn(
                  'px-2 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex-shrink-0',
                  activeTab === tab.id
                    ? `${tab.color} text-white`
                    : 'bg-slate-700 text-slate-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chevron */}
          <svg
            className={cn(
              'w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ml-1',
              isOpen ? 'rotate-180' : ''
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </div>

        {/* Content - scrollowalne */}
        <div className="px-4 pb-6 overflow-y-auto flex-1 min-h-0">
          {activeTab === 'projects' && <MobileProjectsSection />}
          {activeTab === 'wall' && <WallConfig />}
          {activeTab === 'colors' && <ColorPicker />}
          {activeTab === 'sizes' && <SizePicker />}
          {activeTab === 'price' && <PriceSummary />}
        </div>
      </div>
    </>
  );
}
