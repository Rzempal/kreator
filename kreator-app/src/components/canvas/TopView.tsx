// src/components/canvas/TopView.tsx v0.002 Wyrownianie Main segmentu z widokiem frontalnym
'use client';

import { useMemo } from 'react';
import type { Wall as WallType } from '@/types';
import { useCanvasColor, useAddons } from '@/store/useKreatorStore';

interface TopViewProps {
    wall: WallType;
    scale: number;
    totalWidth: number;      // szerokosc sciany z widoku frontalnego (cm)
    alignToFrontal: boolean; // czy wyrownac Main segment z widokiem frontalnym
}

// Funkcja do obliczania jasnosci koloru
function isLightColor(hex: string): boolean {
    const color = hex.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
}

export default function TopView({ wall, scale, totalWidth, alignToFrontal }: TopViewProps) {
    const canvasColor = useCanvasColor();
    const addons = useAddons();
    const isLight = useMemo(() => isLightColor(canvasColor), [canvasColor]);

    // Grubosc paneli: 3mm lub 5mm (podwojna pianka)
    const panelThickness = addons.doubleFoam ? 5 : 3; // mm
    const thicknessScale = panelThickness * scale / 10; // konwersja mm na px

    // Kolory adaptacyjne
    const strokeColor = isLight ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
    const fillColor = isLight ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)';
    const textColor = isLight ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)';
    const mainColor = '#a855f7'; // purple-500

    // Znajdz index Main segmentu
    const masterIndex = useMemo(() => {
        return wall.segments.findIndex(seg => seg.id === wall.masterSegmentId);
    }, [wall.segments, wall.masterSegmentId]);

    // Oblicz pozycje segmentow w widoku z gory
    // Main segment jest wyrownany poziomo (kat = 0) i zaczyna sie na odpowiedniej pozycji X
    const segmentPositions = useMemo(() => {
        const positions: Array<{
            id: string;
            x1: number;
            y1: number;
            x2: number;
            y2: number;
            width: number;
            angle: number;
            isMaster: boolean;
        }> = [];

        // Najpierw oblicz skumulowane pozycje X w widoku frontalnym dla kazdego segmentu
        const frontalPositions: number[] = [];
        let cumX = 0;
        for (const seg of wall.segments) {
            frontalPositions.push(cumX);
            cumX += seg.width;
        }

        // Pozycja startowa Main segmentu (wyrownana z widokiem frontalnym)
        const masterFrontalX = masterIndex >= 0 ? frontalPositions[masterIndex] * scale : 0;

        // Srodek Y dla widoku z gory
        const centerY = 50;

        // Buduj pozycje od Main segmentu w obie strony
        // Main segment jest poziomy (kat 0)

        // Segmenty przed Main (od Main do poczatku)
        let prevPositions: typeof positions = [];
        if (masterIndex > 0) {
            let x = masterFrontalX;
            let y = centerY;
            let angle = 180; // Kierunek w lewo

            for (let i = masterIndex - 1; i >= 0; i--) {
                const segment = wall.segments[i];
                const angleRad = (angle * Math.PI) / 180;
                const startX = x - segment.width * scale * Math.cos(angleRad);
                const startY = y - segment.width * scale * Math.sin(angleRad);

                prevPositions.unshift({
                    id: segment.id,
                    x1: startX,
                    y1: startY,
                    x2: x,
                    y2: y,
                    width: segment.width,
                    angle,
                    isMaster: false,
                });

                x = startX;
                y = startY;

                // Kat dla nastepnego segmentu (idziemy wstecz)
                if (i > 0) {
                    const prevSegment = wall.segments[i - 1];
                    const turnAngle = prevSegment.angle === 90 ? -90 : prevSegment.angle === 270 ? 90 : 0;
                    angle += turnAngle;
                }
            }
        }

        // Main segment (poziomy)
        const masterSegment = wall.segments[masterIndex] || wall.segments[0];
        if (masterSegment) {
            const masterPos = {
                id: masterSegment.id,
                x1: masterFrontalX,
                y1: centerY,
                x2: masterFrontalX + masterSegment.width * scale,
                y2: centerY,
                width: masterSegment.width,
                angle: 0,
                isMaster: true,
            };

            // Segmenty po Main (od Main do konca)
            let postPositions: typeof positions = [];
            let x = masterPos.x2;
            let y = centerY;
            let angle = 0; // Kierunek w prawo

            for (let i = masterIndex + 1; i < wall.segments.length; i++) {
                // Kat polaczenia z poprzedniego segmentu
                const prevSegment = wall.segments[i - 1];
                const turnAngle = prevSegment.angle === 90 ? 90 : prevSegment.angle === 270 ? -90 : 0;
                angle += turnAngle;

                const segment = wall.segments[i];
                const angleRad = (angle * Math.PI) / 180;
                const endX = x + segment.width * scale * Math.cos(angleRad);
                const endY = y + segment.width * scale * Math.sin(angleRad);

                postPositions.push({
                    id: segment.id,
                    x1: x,
                    y1: y,
                    x2: endX,
                    y2: endY,
                    width: segment.width,
                    angle,
                    isMaster: false,
                });

                x = endX;
                y = endY;
            }

            return [...prevPositions, masterPos, ...postPositions];
        }

        return prevPositions;
    }, [wall.segments, wall.masterSegmentId, scale, masterIndex]);


    // Oblicz bounding box
    const bounds = useMemo(() => {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        for (const pos of segmentPositions) {
            minX = Math.min(minX, pos.x1, pos.x2);
            minY = Math.min(minY, pos.y1, pos.y2);
            maxX = Math.max(maxX, pos.x1, pos.x2);
            maxY = Math.max(maxY, pos.y1, pos.y2);
        }
        return {
            minX: minX - 30,
            minY: minY - 50,
            maxX: maxX + 30,
            maxY: maxY + 50,
            width: maxX - minX + 60,
            height: maxY - minY + 100,
        };
    }, [segmentPositions]);

    return (
        <g>
            {/* Tytul */}
            <text
                x={bounds.minX + bounds.width / 2}
                y={bounds.minY + 20}
                textAnchor="middle"
                fill={textColor}
                fontSize={14}
                fontWeight="bold"
                fontFamily="sans-serif"
            >
                Widok z góry
            </text>

            {/* Segmenty */}
            {segmentPositions.map((pos, index) => (
                <g key={pos.id}>
                    {/* Linia segmentu */}
                    <line
                        x1={pos.x1}
                        y1={pos.y1}
                        x2={pos.x2}
                        y2={pos.y2}
                        stroke={pos.isMaster ? mainColor : strokeColor}
                        strokeWidth={thicknessScale}
                        strokeLinecap="round"
                    />

                    {/* Oznaczenie Main */}
                    {pos.isMaster && (
                        <circle
                            cx={(pos.x1 + pos.x2) / 2}
                            cy={(pos.y1 + pos.y2) / 2}
                            r={8}
                            fill={mainColor}
                            stroke="white"
                            strokeWidth={1}
                        />
                    )}

                    {/* Wymiar szerokosci */}
                    <text
                        x={(pos.x1 + pos.x2) / 2}
                        y={(pos.y1 + pos.y2) / 2 + (pos.isMaster ? 25 : 15)}
                        textAnchor="middle"
                        fill={textColor}
                        fontSize={10}
                        fontFamily="sans-serif"
                    >
                        {pos.width} cm
                    </text>

                    {/* Numer segmentu */}
                    <text
                        x={(pos.x1 + pos.x2) / 2}
                        y={(pos.y1 + pos.y2) / 2 - 15}
                        textAnchor="middle"
                        fill={pos.isMaster ? mainColor : textColor}
                        fontSize={11}
                        fontWeight={pos.isMaster ? 'bold' : 'normal'}
                        fontFamily="sans-serif"
                    >
                        Seg. {index + 1}
                    </text>

                    {/* Punkt laczenia z katem */}
                    {index < segmentPositions.length - 1 && (
                        <>
                            <circle
                                cx={pos.x2}
                                cy={pos.y2}
                                r={4}
                                fill={fillColor}
                                stroke={strokeColor}
                                strokeWidth={1}
                            />
                            <text
                                x={pos.x2}
                                y={pos.y2 + 20}
                                textAnchor="middle"
                                fill={textColor}
                                fontSize={9}
                                fontFamily="sans-serif"
                            >
                                {wall.segments[index].angle}°
                            </text>
                        </>
                    )}
                </g>
            ))}

            {/* Info o grubosci paneli */}
            <text
                x={bounds.minX + bounds.width / 2}
                y={bounds.maxY - 10}
                textAnchor="middle"
                fill={textColor}
                fontSize={10}
                fontFamily="sans-serif"
                opacity={0.7}
            >
                Grubość paneli: {panelThickness}mm {addons.doubleFoam ? '(podwójna pianka)' : ''}
            </text>
        </g>
    );
}
