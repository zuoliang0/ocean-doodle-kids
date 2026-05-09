import type { PointerEvent } from 'react';
import type { DoodleStroke, Template } from '../types';

interface ArtworkAnimalProps {
  template: Template;
  colors: Record<string, string>;
  doodleStrokes?: DoodleStroke[];
  className?: string;
  interactive?: boolean;
  lineArtOnly?: boolean;
  onRegionClick?: (regionId: string) => void;
  onCanvasPointerDown?: (event: PointerEvent<SVGSVGElement>) => void;
  onCanvasPointerMove?: (event: PointerEvent<SVGSVGElement>) => void;
  onCanvasPointerUp?: (event: PointerEvent<SVGSVGElement>) => void;
}

function pointsToPath(stroke: DoodleStroke) {
  const [first, ...rest] = stroke.points;
  if (!first) return '';
  return `M ${first.x} ${first.y} ${rest.map((point) => `L ${point.x} ${point.y}`).join(' ')}`;
}

export function ArtworkAnimal({
  template,
  colors,
  doodleStrokes = [],
  className,
  interactive = false,
  lineArtOnly = false,
  onRegionClick,
  onCanvasPointerDown,
  onCanvasPointerMove,
  onCanvasPointerUp,
}: ArtworkAnimalProps) {
  const brushStrokes = doodleStrokes.filter((stroke) => stroke.tool === 'brush' && stroke.points.length > 1);
  const eraserStrokes = doodleStrokes.filter((stroke) => stroke.tool === 'eraser' && stroke.points.length > 1);

  return (
    <svg
      className={className}
      viewBox={template.viewBox}
      role="img"
      aria-label={template.name}
      onPointerDown={onCanvasPointerDown}
      onPointerMove={onCanvasPointerMove}
      onPointerUp={onCanvasPointerUp}
      onPointerCancel={onCanvasPointerUp}
    >
      <defs>
        <mask id={`${template.id}-doodle-mask`}>
          <rect x="-20%" y="-20%" width="140%" height="140%" fill="white" />
          {eraserStrokes.map((stroke) => (
            <path
              key={stroke.id}
              d={pointsToPath(stroke)}
              fill="none"
              stroke="black"
              strokeWidth={stroke.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </mask>
      </defs>
      {template.regions.map((region) => (
        <path
          key={region.id}
          d={region.path}
          fill={lineArtOnly ? '#ffffff' : colors[region.id] ?? region.defaultColor}
          stroke="#205766"
          strokeWidth="4"
          strokeLinejoin="round"
          strokeLinecap="round"
          className={interactive ? 'paint-region' : undefined}
          onClick={interactive ? () => onRegionClick?.(region.id) : undefined}
        />
      ))}
      <g mask={`url(#${template.id}-doodle-mask)`} pointerEvents="none">
        {brushStrokes.map((stroke) => (
          <path
            key={stroke.id}
            d={pointsToPath(stroke)}
            fill="none"
            stroke={stroke.color}
            strokeWidth={stroke.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </g>
      <circle cx="218" cy="103" r="5" fill="#183b45" />
    </svg>
  );
}
