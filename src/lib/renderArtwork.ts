import type { DoodleStroke, Template } from '../types';

function pointsToPath(stroke: DoodleStroke) {
  const [first, ...rest] = stroke.points;
  if (!first) return '';
  return `M ${first.x.toFixed(1)} ${first.y.toFixed(1)} ${rest.map((point) => `L ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')}`;
}

interface RenderArtworkOptions {
  lineArtOnly?: boolean;
}

export function buildArtworkSvg(
  template: Template,
  colors: Record<string, string>,
  doodleStrokes: DoodleStroke[] = [],
  options: RenderArtworkOptions = {},
) {
  const paths = template.regions
    .map((region) => {
      const fill = options.lineArtOnly ? '#ffffff' : colors[region.id] ?? region.defaultColor;
      return `<path d="${region.path}" fill="${fill}" stroke="#205766" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>`;
    })
    .join('');

  const brushStrokes = doodleStrokes
    .filter((stroke) => stroke.tool === 'brush' && stroke.points.length > 1)
    .map(
      (stroke) =>
        `<path d="${pointsToPath(stroke)}" fill="none" stroke="${stroke.color}" stroke-width="${stroke.width}" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join('');
  const eraserStrokes = doodleStrokes
    .filter((stroke) => stroke.tool === 'eraser' && stroke.points.length > 1)
    .map(
      (stroke) =>
        `<path d="${pointsToPath(stroke)}" fill="none" stroke="black" stroke-width="${stroke.width}" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join('');
  const doodles = brushStrokes
    ? `<defs><mask id="doodleMask"><rect x="-20%" y="-20%" width="140%" height="140%" fill="white"/>${eraserStrokes}</mask></defs><g mask="url(#doodleMask)">${brushStrokes}</g>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${template.viewBox}">${paths}${doodles}<circle cx="218" cy="103" r="5" fill="#183b45"/></svg>`;
}

export function svgToDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function createArtworkImage(
  template: Template,
  colors: Record<string, string>,
  doodleStrokes: DoodleStroke[] = [],
  options: RenderArtworkOptions = {},
) {
  return svgToDataUrl(buildArtworkSvg(template, colors, doodleStrokes, options));
}
