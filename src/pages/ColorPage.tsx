import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, Eraser, Redo2, Save, Trash2, Undo2 } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { Artwork, DoodlePoint, DoodleStroke } from '../types';
import { ArtworkAnimal } from '../components/ArtworkAnimal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { getTemplate, palette } from '../data/templates';
import { createArtworkImage } from '../lib/renderArtwork';
import { useAppStore } from '../store/useAppStore';

type ActiveTool = 'brush' | 'eraser';

type PaintCommand = {
  type: 'stroke';
  stroke: DoodleStroke;
};

const brushSizes = [
  { label: '细', value: 5 },
  { label: '中', value: 10 },
  { label: '粗', value: 16 },
];

const editorTitles: Record<string, string> = {
  dolphin: '小海豚涂色',
  turtle: '小海龟涂色',
  octopus: '小章鱼涂色',
  whale: '小鲸鱼涂色',
};

function createArtworkId() {
  return `artwork_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function createStrokeId() {
  return `stroke_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function ColorPage() {
  const { templateId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const template = getTemplate(templateId);
  const artworkIdParam = searchParams.get('artworkId');
  const existing = useAppStore((state) => state.artworks.find((item) => item.id === artworkIdParam));
  const upsertArtwork = useAppStore((state) => state.upsertArtwork);

  const artworkIdRef = useRef(existing?.id ?? createArtworkId());
  const [doodleStrokes, setDoodleStrokes] = useState<DoodleStroke[]>(existing?.doodleStrokes ?? []);
  const [selectedColor, setSelectedColor] = useState(palette[4]);
  const [activeTool, setActiveTool] = useState<ActiveTool>('brush');
  const [brushWidth, setBrushWidth] = useState(10);
  const [undoStack, setUndoStack] = useState<PaintCommand[]>([]);
  const [redoStack, setRedoStack] = useState<PaintCommand[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const strokeRef = useRef<DoodleStroke | null>(null);

  const saveDraft = useCallback(async (status: Artwork['status'] = existing?.status ?? 'draft') => {
    setSaving(true);
    const now = new Date().toISOString();
    const image = createArtworkImage(template, {}, doodleStrokes, { lineArtOnly: true });
    await upsertArtwork({
      id: artworkIdRef.current,
      templateId: template.id,
      title: existing?.title ?? template.name,
      status,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      regionColorMap: {},
      doodleStrokes,
      thumbnailDataUrl: image,
      textureDataUrl: image,
      textureVersion: 1,
    });
    setDirty(false);
    setSaving(false);
  }, [doodleStrokes, existing?.createdAt, existing?.status, existing?.title, template, upsertArtwork]);

  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => {
      void saveDraft();
    }, 500);
    return () => window.clearTimeout(timer);
  }, [dirty, saveDraft]);

  function undo() {
    const command = undoStack.at(-1);
    if (!command) return;
    setDoodleStrokes((current) => current.filter((stroke) => stroke.id !== command.stroke.id));
    setUndoStack((current) => current.slice(0, -1));
    setRedoStack((current) => [...current, command]);
    setDirty(true);
  }

  function redo() {
    const command = redoStack.at(-1);
    if (!command) return;
    setDoodleStrokes((current) => [...current, command.stroke]);
    setRedoStack((current) => current.slice(0, -1));
    setUndoStack((current) => [...current, command]);
    setDirty(true);
  }

  function getSvgPoint(event: React.PointerEvent<SVGSVGElement>): DoodlePoint | null {
    const svg = event.currentTarget;
    const matrix = svg.getScreenCTM();
    if (!matrix) return null;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const transformed = point.matrixTransform(matrix.inverse());
    return { x: Math.round(transformed.x * 10) / 10, y: Math.round(transformed.y * 10) / 10 };
  }

  function startStroke(event: React.PointerEvent<SVGSVGElement>) {
    const point = getSvgPoint(event);
    if (!point) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const stroke: DoodleStroke = {
      id: createStrokeId(),
      tool: activeTool,
      color: selectedColor,
      width: activeTool === 'eraser' ? brushWidth + 10 : brushWidth,
      points: [point],
    };
    strokeRef.current = stroke;
    setDoodleStrokes((current) => [...current, stroke]);
  }

  function moveStroke(event: React.PointerEvent<SVGSVGElement>) {
    if (!strokeRef.current) return;
    const point = getSvgPoint(event);
    if (!point) return;
    const activeStroke = strokeRef.current;
    const lastPoint = activeStroke.points.at(-1);
    if (lastPoint && Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) < 1.8) return;
    const nextStroke = { ...activeStroke, points: [...activeStroke.points, point] };
    strokeRef.current = nextStroke;
    setDoodleStrokes((current) => current.map((stroke) => (stroke.id === nextStroke.id ? nextStroke : stroke)));
  }

  function endStroke(event: React.PointerEvent<SVGSVGElement>) {
    const stroke = strokeRef.current;
    if (!stroke) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    strokeRef.current = null;
    if (stroke.points.length < 2) {
      setDoodleStrokes((current) => current.filter((item) => item.id !== stroke.id));
      return;
    }
    setUndoStack((current) => [...current, { type: 'stroke', stroke }]);
    setRedoStack([]);
    setDirty(true);
  }

  async function finishArtwork() {
    await saveDraft();
    navigate(`/preview/${artworkIdRef.current}`);
  }

  return (
    <section className="page editor-page">
      <header className="editor-header">
        <button className="editor-round-button back" type="button" aria-label="返回" onClick={() => navigate('/templates')}>
          <ArrowLeft size={42} />
        </button>
        <h1>{editorTitles[template.id] ?? `${template.name}涂色`}</h1>
        <span className="editor-save-pill">✓ {saving ? '正在保存' : '已自动保存'}</span>
        <button className="editor-round-button save" type="button" aria-label="保存" onClick={() => void saveDraft()}>
          <Save size={36} />
          <span>保存</span>
        </button>
        <button className="editor-round-button done" type="button" aria-label="完成" onClick={() => void finishArtwork()}>
          <Check size={42} />
          <span>完成</span>
        </button>
      </header>

      <div className="editor-workspace">
        <aside className="editor-side-tools">
          <button className="editor-side-button" type="button" onClick={undo} disabled={undoStack.length === 0}>
            <Undo2 size={38} />
            撤销
          </button>
          <button className="editor-side-button" type="button" onClick={redo} disabled={redoStack.length === 0}>
            <Redo2 size={38} />
            重做
          </button>
          <button
            className={activeTool === 'eraser' ? 'editor-side-button active' : 'editor-side-button'}
            type="button"
            onClick={() => setActiveTool((tool) => (tool === 'eraser' ? 'brush' : 'eraser'))}
          >
            <Eraser size={38} />
            橡皮
          </button>
          <button className="editor-side-button danger" type="button" onClick={() => setConfirmClear(true)}>
            <Trash2 size={38} />
            清空
          </button>
        </aside>

        <section className="drawing-paper" aria-label="涂色画布">
          <ArtworkAnimal
            template={template}
            colors={{}}
            doodleStrokes={doodleStrokes}
            className="editor-canvas"
            lineArtOnly
            onCanvasPointerDown={startStroke}
            onCanvasPointerMove={moveStroke}
            onCanvasPointerUp={endStroke}
          />
        </section>
      </div>

      <footer className="paint-toolbar">
        <div className="palette">
          {palette.slice(0, 8).map((color) => (
            <button
              key={color}
              className={color === selectedColor && activeTool === 'brush' ? 'swatch active' : 'swatch'}
              style={{ backgroundColor: color }}
              type="button"
              aria-label={`选择颜色 ${color}`}
              onClick={() => {
                setSelectedColor(color);
                setActiveTool('brush');
              }}
            />
          ))}
        </div>

        <div className="brush-size-group" aria-label="画笔粗细">
          {brushSizes.map((size) => (
            <button
              key={size.value}
              className={brushWidth === size.value ? 'brush-size active' : 'brush-size'}
              type="button"
              onClick={() => setBrushWidth(size.value)}
            >
              <i style={{ width: size.value + 8, height: size.value + 8 }} />
              <span>{size.label}</span>
            </button>
          ))}
        </div>

        <button
          className={activeTool === 'eraser' ? 'toolbar-eraser active' : 'toolbar-eraser'}
          type="button"
          onClick={() => setActiveTool((tool) => (tool === 'eraser' ? 'brush' : 'eraser'))}
        >
          <Eraser size={34} />
          橡皮
        </button>
      </footer>

      <ConfirmDialog
        open={confirmClear}
        title="清空作品？"
        message="当前画笔颜色会被清空，此操作不能直接恢复。"
        danger
        confirmText="清空"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          setDoodleStrokes([]);
          setUndoStack([]);
          setRedoStack([]);
          setDirty(true);
          setConfirmClear(false);
        }}
      />
    </section>
  );
}
