// src/components/canvas/TopView.tsx v0.001 Widok z gory - rzut segmentow z katami
'use client';

import { useMemo } from 'react';
import type { Wall as WallType } from '@/types';
import { useCanvasColor, useAddons } from '@/store/useKreatorStore';

interface TopViewProps {
    wall: WallType;
    scale: number;
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

export default function TopView({ wall, scale }: TopViewProps) {
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

    // Oblicz pozycje segmentow w widoku z gory
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

        let currentX = 50; // Start z paddingiem
        let currentY = 100; // Srodek canvy
        let currentAngle = 0; // Kat w stopniach (0 = w prawo)

        for (let i = 0; i < wall.segments.length; i++) {
            const segment = wall.segments[i];
            const isMaster = wall.masterSegmentId === segment.id;

            // Oblicz punkt koncowy segmentu
            const angleRad = (currentAngle * Math.PI) / 180;
            const endX = currentX + segment.width * scale * Math.cos(angleRad);
            const endY = currentY + segment.width * scale * Math.sin(angleRad);

            positions.push({
                id: segment.id,
                x1: currentX,
                y1: currentY,
                x2: endX,
                y2: endY,
                width: segment.width,
                angle: currentAngle,
                isMaster,
            });

            // Aktualizuj pozycje dla nastepnego segmentu
            currentX = endX;
            currentY = endY;

            // Zmien kat dla nastepnego segmentu
            if (i < wall.segments.length - 1) {
                // 90 = skret w prawo (+90), 180 = prosto (0), 270 = skret w lewo (-90)
                const turnAngle = segment.angle === 90 ? 90 : segment.angle === 270 ? -90 : 0;
                currentAngle += turnAngle;
            }
        }

        return positions;
    }, [wall.segments, wall.masterSegmentId, scale]);

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
