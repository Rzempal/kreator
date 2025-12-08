// src/components/ui/Sidebar.tsx v0.003 Dodano sekcje Projekty do accordion
'use client';

import { useState, useRef, ReactNode, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useKreatorStore, useSavedProjects, useCurrentProjectId } from '@/store/useKreatorStore';
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
  projects: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
};

type SectionId = 'wall' | 'fabric' | 'size' | 'price' | 'projects';

// Komponent zarzadzania projektami wewnatrz accordion
function ProjectsSection() {
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
          <div className="max-h-40 overflow-y-auto space-y-1">
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
          Eksport JSON
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 px-2 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded border border-slate-600 transition-colors"
        >
          Import JSON
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

export default function Sidebar() {
  // Domyslnie otwarta sekcja tkanin
  const [openSection, setOpenSection] = useState<SectionId | null>('fabric');

  const toggleSection = (id: SectionId) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const savedProjects = useSavedProjects();
  const currentProjectId = useCurrentProjectId();
  const currentProject = savedProjects.find(p => p.id === currentProjectId);

  return (
    <div className="flex flex-col gap-3 w-72 flex-shrink-0">
      {/* Projekty */}
      <AccordionSection
        id="projects"
        title={currentProject ? currentProject.name : 'Projekty'}
        icon={icons.projects}
        isOpen={openSection === 'projects'}
        onToggle={() => toggleSection('projects')}
        badge={savedProjects.length > 0 ? savedProjects.length : undefined}
      >
        <ProjectsSection />
      </AccordionSection>

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

      {/* Wycena */}
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
