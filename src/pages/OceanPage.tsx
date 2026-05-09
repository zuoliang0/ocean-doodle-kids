import { useEffect, useMemo, useRef, useState } from 'react';
import { Application, Container, Graphics, Sprite, Texture } from 'pixi.js';
import { Brush } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTemplate } from '../data/templates';
import { useAppStore } from '../store/useAppStore';
import type { Artwork, OceanBuddy } from '../types';

interface OceanItem {
  artwork: Artwork;
  buddy: OceanBuddy;
}

interface SceneEntity {
  node: Container | Graphics;
  kind: 'userBuddy' | 'bubble';
  speed: number;
  phase: number;
  depth: number;
  baseY: number;
  range: number;
  direction: 1 | -1;
  seed: number;
  artwork?: Artwork;
  selectedUntil?: number;
}

const oceanAssets = {
  homeButton: new URL('../../assets/slices/page_page-6/asset_a47c20e944cb4028.png', import.meta.url).href,
  title: new URL('../../assets/slices/page_page-6/asset_7621b512b17c4028.png', import.meta.url).href,
  soundButton: new URL('../../assets/slices/page_page-6/asset_d7b73897bd3a4f31.png', import.meta.url).href,
  card: new URL('../../assets/slices/page_page-6/asset_bb13b47009b940b5.png', import.meta.url).href,
  previewButton: new URL('../../assets/slices/page_page-6/asset_873843974f4a47d8.png', import.meta.url).href,
};

const backgroundFish = Array.from({ length: 8 }, (_, index) => ({
  index,
  className: `fish-${index + 1}`,
}));

function hashSeed(value: string) {
  let hash = 2166136261;
  for (const char of value) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function seeded(seed: number, offset = 0) {
  const x = Math.sin(seed * 9999 + offset * 127.1) * 10000;
  return x - Math.floor(x);
}

async function loadTextureFromDataUrl(dataUrl: string) {
  const image = new Image();
  image.src = dataUrl;
  await image.decode();
  return Texture.from(image, true);
}

function OceanFishLayer() {
  const layerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const nodes = Array.from(layer.querySelectorAll<HTMLElement>('.swim-fish'));
    const fish = nodes.map((node, index) => ({
      node,
      x: seeded(index, 1) * window.innerWidth,
      y: 130 + seeded(index, 2) * Math.max(260, window.innerHeight - 320),
      direction: seeded(index, 3) > 0.5 ? 1 : -1,
      speed: 0.045 + seeded(index, 4) * 0.06,
      phase: seeded(index, 6) * Math.PI * 2,
      bob: 10 + seeded(index, 7) * 18,
      scale: [0.38, 0.46, 0.55, 0.66][index % 4],
    }));
    let frame = 0;
    let last = performance.now();

    function tick(now: number) {
      const delta = Math.min(34, now - last);
      last = now;
      const width = window.innerWidth;
      fish.forEach((item) => {
        item.x += item.speed * item.direction * delta;
        if (item.direction === 1 && item.x > width + 110) item.x = -130;
        if (item.direction === -1 && item.x < -130) item.x = width + 110;

        const bob = Math.sin(now / 620 + item.phase) * item.bob;
        const roll = Math.sin(now / 880 + item.phase) * 4;
        const face = item.direction === -1 ? 1 : -1;
        item.node.style.transform = `translate3d(${item.x}px, ${item.y + bob}px, 0) rotate(${roll}deg) scaleX(${face}) scale(${item.scale})`;
      });

      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="ocean-fish-layer" ref={layerRef} aria-hidden="true">
      {backgroundFish.map((fish) => (
        <i key={fish.index} className={`swim-fish ${fish.className}`} />
      ))}
    </div>
  );
}

export function OceanPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const artworks = useAppStore((state) => state.artworks);
  const buddies = useAppStore((state) => state.buddies);
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);

  const oceanItems = useMemo(
    () =>
      buddies
        .map((buddy) => {
          const artwork = artworks.find((item) => item.id === buddy.artworkId && item.status === 'inOcean');
          return artwork ? { artwork, buddy } : null;
        })
        .filter((item): item is OceanItem => Boolean(item)),
    [artworks, buddies],
  );

  const activeSelectedArtwork = selectedArtwork && oceanItems.some((item) => item.artwork.id === selectedArtwork.id) ? selectedArtwork : null;

  useEffect(() => {
    const host = containerRef.current;
    if (!host || oceanItems.length === 0) return;
    const hostElement = host;

    let destroyed = false;
    let initialized = false;
    const app = new Application();
    const entities: SceneEntity[] = [];

    async function setup() {
      await app.init({
        width: hostElement.clientWidth,
        height: hostElement.clientHeight,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio, 2),
      });
      initialized = true;
      if (destroyed) {
        app.destroy();
        return;
      }

      hostElement.innerHTML = '';
      hostElement.appendChild(app.canvas);

      const resize = () => {
        app.renderer.resize(hostElement.clientWidth, hostElement.clientHeight);
      };
      window.addEventListener('resize', resize);

      const midLayer = new Container();
      const foregroundLayer = new Container();
      app.stage.addChild(midLayer, foregroundLayer);

      app.stage.eventMode = 'static';
      app.stage.hitArea = app.screen;
      app.stage.on('pointertap', () => setSelectedArtwork(null));

      const bubbleCount = settings.lowPerfMode ? 12 : 28;
      for (let index = 0; index < bubbleCount; index += 1) {
        const bubble = new Graphics();
        const radius = 4 + seeded(index, 6) * 13;
        bubble.circle(0, 0, radius).stroke({ color: 0xffffff, alpha: 0.72, width: 2 });
        bubble.circle(-radius * 0.25, -radius * 0.26, radius * 0.22).fill({ color: 0xffffff, alpha: 0.56 });
        bubble.x = seeded(index, 7) * app.screen.width;
        bubble.y = seeded(index, 8) * app.screen.height;
        foregroundLayer.addChild(bubble);
        entities.push({
          node: bubble,
          kind: 'bubble',
          speed: 0.28 + seeded(index, 9) * 0.56,
          phase: seeded(index, 10) * Math.PI * 2,
          depth: 0.4,
          baseY: bubble.y,
          range: 12 + seeded(index, 11) * 18,
          direction: 1,
          seed: index + 30,
        });
      }

      const visibleItems = oceanItems.slice(0, settings.lowPerfMode ? 5 : 10);
      for (let index = 0; index < visibleItems.length; index += 1) {
        const { artwork, buddy } = visibleItems[index];
        const texture = await loadTextureFromDataUrl(artwork.textureDataUrl);
        if (destroyed) return;
        const seed = buddy.pathSeed || hashSeed(artwork.id);
        const depth = 0.34 + (buddy.depthSeed || seeded(seed, 1)) * 0.54;
        const container = new Container();
        const glow = new Graphics();
        glow.ellipse(0, 18, 132, 54).stroke({ color: 0xffffff, alpha: 0.62, width: 4 });
        glow.ellipse(0, 18, 190, 72).stroke({ color: 0x92f4ff, alpha: 0.28, width: 3 });
        glow.visible = false;
        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5);
        const maxSide = Math.max(texture.width, texture.height);
        const targetSize = 210 * (0.72 + depth * 0.5) * (buddy.scale || 1);
        const baseScale = targetSize / maxSide;
        sprite.scale.set(baseScale);
        container.addChild(glow, sprite);
        container.x = app.screen.width * (0.16 + seeded(seed, 2) * 0.58);
        container.y = app.screen.height * (0.26 + seeded(seed, 3) * 0.42);
        container.eventMode = 'static';
        container.cursor = 'pointer';
        container.on('pointertap', (event) => {
          event.stopPropagation();
          glow.visible = true;
          setSelectedArtwork(artwork);
          const entity = entities.find((item) => item.artwork?.id === artwork.id);
          if (entity) entity.selectedUntil = performance.now() + 1700;
        });
        midLayer.addChild(container);
        entities.push({
          node: container,
          kind: 'userBuddy',
          speed: buddy.speed || 0.58,
          phase: seeded(seed, 4) * Math.PI * 2,
          depth,
          baseY: container.y,
          range: 42 + seeded(seed, 5) * 78,
          direction: seeded(seed, 6) > 0.5 ? 1 : -1,
          seed,
          artwork,
        });
      }

      app.ticker.add((ticker) => {
        const width = app.screen.width;
        const height = app.screen.height;
        const delta = ticker.deltaTime;
        const now = performance.now();
        const time = now / 1000;

        entities.forEach((entity) => {
          if (entity.kind === 'bubble') {
            entity.node.y -= entity.speed * delta * 1.9;
            entity.node.x += Math.sin(time * 1.8 + entity.phase) * 0.34;
            if (entity.node.y < -30) {
              entity.node.y = height + 30;
              entity.node.x = seeded(entity.seed + time, 12) * width;
            }
          }

          if (entity.kind === 'userBuddy') {
            const loop = time * entity.speed * 0.24 + entity.phase;
            const centerX = width * (0.18 + seeded(entity.seed, 7) * 0.5);
            const centerY = height * (0.3 + seeded(entity.seed, 8) * 0.33);
            const radiusX = width * (0.16 + seeded(entity.seed, 9) * 0.18);
            const radiusY = entity.range;
            const nextX = centerX + Math.cos(loop) * radiusX;
            const nextY = centerY + Math.sin(loop * 1.36) * radiusY;
            const movingRight = Math.sin(loop) < 0;
            const active = (entity.selectedUntil ?? 0) > now;
            const depthPulse = entity.depth + Math.sin(loop * 0.8) * 0.08;
            const scale = 0.82 + depthPulse * 0.5 + (active ? 0.16 : 0);
            entity.node.x = nextX;
            entity.node.y = nextY;
            entity.node.alpha = 0.78 + depthPulse * 0.24;
            entity.node.scale.x = (movingRight ? 1 : -1) * scale;
            entity.node.scale.y = scale * (1 + Math.sin(time * 4 + entity.phase) * 0.035);
            entity.node.rotation = Math.sin(loop * 1.2) * 0.08;
            const glow = entity.node.children[0];
            glow.visible = active;
          }
        });

        midLayer.children.sort((a, b) => a.y - b.y);
      });

      return () => {
        window.removeEventListener('resize', resize);
      };
    }

    let cleanup: (() => void) | undefined;
    void setup().then((nextCleanup) => {
      cleanup = nextCleanup;
    });

    return () => {
      destroyed = true;
      cleanup?.();
      if (initialized) app.destroy();
      hostElement.innerHTML = '';
    };
  }, [oceanItems, settings.lowPerfMode]);

  return (
    <section className="page ocean-page">
      <header className="ocean-scene-header">
        <button className="ocean-image-button home" type="button" aria-label="返回主页" onClick={() => navigate('/')}>
          <img src={oceanAssets.homeButton} alt="" />
        </button>
        <img className="ocean-title-art" src={oceanAssets.title} alt="海洋世界" />
        <button
          className={settings.soundOn ? 'ocean-image-button sound' : 'ocean-image-button sound muted'}
          type="button"
          aria-label="声音"
          onClick={() => updateSettings({ soundOn: !settings.soundOn })}
        >
          <img src={oceanAssets.soundButton} alt="" />
        </button>
      </header>

      {settings.lowPerfMode && <div className="perf-badge">低性能模式</div>}

      {oceanItems.length === 0 ? (
        <div className="empty-state ocean-empty">
          <h2>海洋里还没有伙伴</h2>
          <button className="primary-button" type="button" onClick={() => navigate('/templates')}>
            <Brush size={24} />
            去涂色添加伙伴
          </button>
        </div>
      ) : (
        <>
          <OceanFishLayer />
          <div className="ocean-canvas" ref={containerRef} />
        </>
      )}

      {activeSelectedArtwork && (
        <aside className="ocean-card">
          <img className="ocean-card-bg" src={oceanAssets.card} alt="" />
          <img
            className="ocean-card-thumb"
            src={activeSelectedArtwork.thumbnailDataUrl}
            alt={getTemplate(activeSelectedArtwork.templateId).name}
          />
          <div className="ocean-card-copy">
            <span>作者：本机</span>
            <span>时间：{new Date(activeSelectedArtwork.updatedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}</span>
            <span>模板：{getTemplate(activeSelectedArtwork.templateId).name}</span>
          </div>
          <button className="ocean-preview-button" type="button" onClick={() => navigate(`/preview/${activeSelectedArtwork.id}`)}>
            <img src={oceanAssets.previewButton} alt="去预览" />
          </button>
          <button className="ocean-card-close" type="button" aria-label="关闭" onClick={() => setSelectedArtwork(null)}>
            ×
          </button>
        </aside>
      )}
    </section>
  );
}
