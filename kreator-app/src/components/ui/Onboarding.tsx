// src/components/ui/Onboarding.tsx v0.001 Onboarding z dymkami
'use client';

import { useEffect, useState } from 'react';
import { useKreatorStore } from '@/store/useKreatorStore';
import { cn } from '@/lib/utils';

// Kroki onboardingu
type StepPosition = 'right' | 'left' | 'top' | 'bottom';

interface OnboardingStep {
    id: string;
    title: string;
    description: string;
    targetSelector: string;
    position: StepPosition;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
    {
        id: 'wall',
        title: 'Ściana',
        description: 'Tutaj konfigurujesz wymiary ściany i dodajesz segmenty. Możesz tworzyć skosy i łuki.',
        targetSelector: '[data-onboarding="wall"]',
        position: 'right',
    },
    {
        id: 'fabric',
        title: 'Tkaniny',
        description: 'Wybierz kolor i wzór tkaniny z bogatej palety kolorów. Możesz też zmienić kolor tła ściany.',
        targetSelector: '[data-onboarding="fabric"]',
        position: 'right',
    },
    {
        id: 'panels',
        title: 'Panele',
        description: 'Wybierz rozmiar panelu do umieszczenia na ścianie. Możesz też dodać własny rozmiar.',
        targetSelector: '[data-onboarding="panels"]',
        position: 'right',
    },
    {
        id: 'canvas',
        title: 'Obszar roboczy',
        description: 'Kliknij na ścianę aby umieścić panel. Przeciągaj panele aby je przesuwać.',
        targetSelector: '[data-onboarding="canvas"]',
        position: 'left',
    },
    {
        id: 'toolbar',
        title: 'Pasek narzędzi',
        description: 'Tutaj pojawiają się ostatnio używane rozmiary paneli. Kliknij aby szybko wybrać.',
        targetSelector: '[data-onboarding="toolbar"]',
        position: 'left',
    },
    {
        id: 'price',
        title: 'Wycena',
        description: 'Sprawdź podsumowanie kosztów i wygeneruj ofertę PDF dla klienta.',
        targetSelector: '[data-onboarding="price"]',
        position: 'right',
    },
];

interface TooltipPosition {
    top: number;
    left: number;
}

export default function Onboarding() {
    const { showOnboarding, onboardingStep, nextOnboardingStep, skipOnboarding } = useKreatorStore();
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [tooltipPos, setTooltipPos] = useState<TooltipPosition>({ top: 0, left: 0 });
    const [isMobile, setIsMobile] = useState(false);

    const currentStep = ONBOARDING_STEPS[onboardingStep];
    const isLastStep = onboardingStep === ONBOARDING_STEPS.length - 1;

    // Wykryj mobile
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Zablokuj scroll gdy onboarding jest aktywny
    useEffect(() => {
        if (showOnboarding) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showOnboarding]);

    // Znajdz element docelowy i oblicz pozycje dymka
    useEffect(() => {
        if (!showOnboarding || !currentStep) return;

        const findTarget = () => {
            const target = document.querySelector(currentStep.targetSelector);
            if (target) {
                const rect = target.getBoundingClientRect();
                setTargetRect(rect);

                // Oblicz pozycje dymka
                const tooltip = { width: 300, height: 150 };
                let top = 0;
                let left = 0;

                switch (currentStep.position) {
                    case 'right':
                        top = rect.top + rect.height / 2 - tooltip.height / 2;
                        left = rect.right + 20;
                        break;
                    case 'bottom':
                        top = rect.bottom + 20;
                        left = rect.left + rect.width / 2 - tooltip.width / 2;
                        break;
                    case 'left':
                        top = rect.top + rect.height / 2 - tooltip.height / 2;
                        left = rect.left - tooltip.width - 20;
                        break;
                    case 'top':
                        top = rect.top - tooltip.height - 20;
                        left = rect.left + rect.width / 2 - tooltip.width / 2;
                        break;
                }

                // Upewnij sie ze dymek jest widoczny
                top = Math.max(20, Math.min(top, window.innerHeight - tooltip.height - 20));
                left = Math.max(20, Math.min(left, window.innerWidth - tooltip.width - 20));

                setTooltipPos({ top, left });
            }
        };

        findTarget();
        // Ponow probe po krotkim czasie (dla elementow ktore jeszcze sie nie wyrenderowaly)
        const timeout = setTimeout(findTarget, 100);

        window.addEventListener('resize', findTarget);
        return () => {
            clearTimeout(timeout);
            window.removeEventListener('resize', findTarget);
        };
    }, [showOnboarding, onboardingStep, currentStep]);

    if (!showOnboarding || !currentStep) return null;

    // Fallback: modal gdy element nie zostal znaleziony
    if (!targetRect) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/70" onClick={skipOnboarding} />

                {/* Modal */}
                <div className="relative w-full max-w-sm bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-5">
                    {/* Naglowek */}
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-cyan-400">{currentStep.title}</h3>
                        <span className="text-xs text-slate-400">
                            {onboardingStep + 1} / {ONBOARDING_STEPS.length}
                        </span>
                    </div>

                    {/* Opis */}
                    <p className="text-sm text-slate-300 mb-5">{currentStep.description}</p>

                    {/* Przyciski */}
                    <div className="flex gap-2">
                        <button
                            onClick={skipOnboarding}
                            className="px-3 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                        >
                            Pomiń
                        </button>
                        <button
                            onClick={nextOnboardingStep}
                            className={cn(
                                'flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                                'bg-cyan-600 text-white hover:bg-cyan-500'
                            )}
                        >
                            {isLastStep ? 'Zakończ' : 'Dalej'}
                        </button>
                    </div>

                    {/* Kropki postępu */}
                    <div className="flex justify-center gap-1.5 mt-4">
                        {ONBOARDING_STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'w-2 h-2 rounded-full transition-colors',
                                    i === onboardingStep ? 'bg-cyan-400' : 'bg-slate-600'
                                )}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Desktop: overlay z podswietlaniem
    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Overlay z wyciętym otworem */}
            <div className="absolute inset-0 pointer-events-auto">
                <svg className="w-full h-full">
                    <defs>
                        <mask id="onboarding-mask">
                            <rect x="0" y="0" width="100%" height="100%" fill="white" />
                            {targetRect && (
                                <rect
                                    x={targetRect.left - 8}
                                    y={targetRect.top - 8}
                                    width={targetRect.width + 16}
                                    height={targetRect.height + 16}
                                    rx={12}
                                    fill="black"
                                />
                            )}
                        </mask>
                    </defs>
                    <rect
                        x="0"
                        y="0"
                        width="100%"
                        height="100%"
                        fill="rgba(0, 0, 0, 0.7)"
                        mask="url(#onboarding-mask)"
                    />
                </svg>
            </div>

            {/* Ramka wokol elementu */}
            {targetRect && (
                <div
                    className="absolute border-2 border-cyan-400 rounded-xl pointer-events-none animate-pulse"
                    style={{
                        top: targetRect.top - 8,
                        left: targetRect.left - 8,
                        width: targetRect.width + 16,
                        height: targetRect.height + 16,
                    }}
                />
            )}

            {/* Dymek */}
            <div
                className="absolute w-[300px] bg-slate-800 border border-slate-600 rounded-xl shadow-2xl p-4 pointer-events-auto"
                style={{
                    top: tooltipPos.top,
                    left: tooltipPos.left,
                }}
            >
                {/* Naglowek */}
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-cyan-400">{currentStep.title}</h3>
                    <span className="text-xs text-slate-400">
                        {onboardingStep + 1} / {ONBOARDING_STEPS.length}
                    </span>
                </div>

                {/* Opis */}
                <p className="text-sm text-slate-300 mb-4">{currentStep.description}</p>

                {/* Przyciski */}
                <div className="flex gap-2">
                    <button
                        onClick={skipOnboarding}
                        className="px-3 py-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
                    >
                        Pomiń
                    </button>
                    <button
                        onClick={nextOnboardingStep}
                        className={cn(
                            'flex-1 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors',
                            'bg-cyan-600 text-white hover:bg-cyan-500'
                        )}
                    >
                        {isLastStep ? 'Zakończ' : 'Dalej'}
                    </button>
                </div>

                {/* Kropki postępu */}
                <div className="flex justify-center gap-1.5 mt-3">
                    {ONBOARDING_STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                'w-2 h-2 rounded-full transition-colors',
                                i === onboardingStep ? 'bg-cyan-400' : 'bg-slate-600'
                            )}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

