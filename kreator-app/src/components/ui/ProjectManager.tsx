// src/components/ui/ProjectManager.tsx v0.001 Komponent zarzadzania projektami
'use client';

import { useState, useRef, useCallback } from 'react';
import { useKreatorStore, useSavedProjects, useCurrentProjectId } from '@/store/useKreatorStore';
import { cn } from '@/lib/utils';

interface ProjectManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectManager({ isOpen, onClose }: ProjectManagerProps) {
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

  // Zapisz jako nowy projekt
  const handleSaveAs = useCallback(() => {
    const name = newProjectName.trim() || `Projekt ${savedProjects.length + 1}`;
    saveProjectAs(name);
    setNewProjectName('');
  }, [newProjectName, savedProjects.length, saveProjectAs]);

  // Zapisz biezacy projekt
  const handleSaveCurrent = useCallback(() => {
    if (currentProjectId) {
      saveCurrentProject();
    } else {
      handleSaveAs();
    }
  }, [currentProjectId, saveCurrentProject, handleSaveAs]);

  // Wczytaj projekt
  const handleLoad = useCallback((projectId: string) => {
    if (panels.length > 0 && currentProjectId !== projectId) {
      if (!confirm('Masz niezapisane zmiany. Czy na pewno chcesz wczytac inny projekt?')) {
        return;
      }
    }
    loadProject(projectId);
    onClose();
  }, [panels.length, currentProjectId, loadProject, onClose]);

  // Usun projekt
  const handleDelete = useCallback((projectId: string, name: string) => {
    if (confirm(`Czy na pewno chcesz usunac projekt "${name}"?`)) {
      deleteProject(projectId);
    }
  }, [deleteProject]);

  // Rozpocznij edycje nazwy
  const handleStartRename = useCallback((projectId: string, name: string) => {
    setEditingId(projectId);
    setEditingName(name);
  }, []);

  // Zapisz nowa nazwe
  const handleSaveRename = useCallback(() => {
    if (editingId && editingName.trim()) {
      renameProject(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  }, [editingId, editingName, renameProject]);

  // Nowy projekt
  const handleNewProject = useCallback(() => {
    if (panels.length > 0) {
      if (!confirm('Masz niezapisane zmiany. Czy na pewno chcesz utworzyc nowy projekt?')) {
        return;
      }
    }
    newProject();
    onClose();
  }, [panels.length, newProject, onClose]);

  // Eksport do JSON
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

  // Import z JSON
  const handleImport = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importProjectFromJSON(content);
      if (success) {
        setImportError(null);
        onClose();
      } else {
        setImportError('Nieprawidlowy format pliku JSON');
      }
    };
    reader.onerror = () => {
      setImportError('Blad odczytu pliku');
    };
    reader.readAsText(file);

    // Reset input
    e.target.value = '';
  }, [importProjectFromJSON, onClose]);

  // Formatuj date
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg mx-4 max-h-[80vh] flex flex-col shadow-2xl">
        {/* Naglowek */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Projekty</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tresc */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Zapisz biezacy projekt */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nazwa nowego projektu..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveAs()}
                className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleSaveAs}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors whitespace-nowrap"
              >
                Zapisz jako
              </button>
            </div>

            {currentProjectId && (
              <button
                onClick={handleSaveCurrent}
                className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
              >
                Zapisz zmiany w biezacym projekcie
              </button>
            )}
          </div>

          {/* Separator */}
          <div className="border-t border-slate-700" />

          {/* Lista zapisanych projektow */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-400">Zapisane projekty ({savedProjects.length})</h3>

            {savedProjects.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">
                Brak zapisanych projektow
              </p>
            ) : (
              <div className="space-y-2">
                {savedProjects.map((project) => (
                  <div
                    key={project.id}
                    className={cn(
                      'p-3 rounded-lg border transition-colors',
                      currentProjectId === project.id
                        ? 'bg-cyan-900/30 border-cyan-600'
                        : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      {/* Nazwa projektu */}
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
                          className="flex-1 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-sm focus:outline-none focus:border-cyan-500"
                        />
                      ) : (
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">
                            {project.name}
                            {currentProjectId === project.id && (
                              <span className="ml-2 text-xs text-cyan-400">(aktywny)</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">
                            {project.panels.length} paneli | {formatDate(project.updatedAt)}
                          </div>
                        </div>
                      )}

                      {/* Przyciski akcji */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleLoad(project.id)}
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                          title="Wczytaj"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleStartRename(project.id, project.name)}
                          className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-600 transition-colors"
                          title="Zmien nazwe"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(project.id, project.name)}
                          className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-600 transition-colors"
                          title="Usun"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Separator */}
          <div className="border-t border-slate-700" />

          {/* Import/Export */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-slate-400">Import / Export</h3>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600"
              >
                Eksportuj do JSON
              </button>
              <button
                onClick={handleImport}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600"
              >
                Importuj z JSON
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            {importError && (
              <p className="text-sm text-red-400">{importError}</p>
            )}
          </div>
        </div>

        {/* Stopka */}
        <div className="p-4 border-t border-slate-700 flex justify-between">
          <button
            onClick={handleNewProject}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600"
          >
            Nowy projekt
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
          >
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
}
