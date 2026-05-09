import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useAppStore } from '../store/useAppStore';

const homeAssets = {
  title: new URL('../../assets/slices/page_page-2/asset_ed5d544bc4d04287.png', import.meta.url).href,
  start: new URL('../../assets/slices/page_page-2/asset_90b55477cbda4715.png', import.meta.url).href,
  gallery: new URL('../../assets/slices/page_page-2/asset_938ae150586c4a4c.png', import.meta.url).href,
  ocean: new URL('../../assets/slices/page_page-2/asset_78ee94c0298547b9.png', import.meta.url).href,
  guideArrow: new URL('../../assets/slices/page_page-2/asset_d55a184f5d09475b.png', import.meta.url).href,
  fishSprite: new URL('../assets/generated/home-fish-sprite.png', import.meta.url).href,
  topButtons: new URL('../assets/generated/home-top-buttons.png', import.meta.url).href,
};

const backgroundFish = Array.from({ length: 8 }, (_, index) => ({
  index,
  className: `fish-${index + 1}`,
}));

function HomeFishLayer() {
  const layerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const nodes = Array.from(layer.querySelectorAll<HTMLElement>('.swim-fish'));
    const fish = nodes.map((node, index) => ({
      node,
      x: Math.random() * window.innerWidth,
      y: 120 + Math.random() * Math.max(220, window.innerHeight - 260),
      direction: Math.random() > 0.5 ? 1 : -1,
      speed: 0.045 + Math.random() * 0.06,
      phase: Math.random() * Math.PI * 2,
      bob: 10 + Math.random() * 18,
      scale: [0.46, 0.54, 0.62, 0.72][index % 4],
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
    <div className="home-fish-layer" ref={layerRef} aria-hidden="true">
      {backgroundFish.map((fish) => (
        <i key={fish.index} className={`swim-fish ${fish.className}`} />
      ))}
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const settings = useAppStore((state) => state.settings);
  const markTutorialSeen = useAppStore((state) => state.markTutorialSeen);

  return (
    <section className="page home-page">
      <HomeFishLayer />
      <header className="home-header">
        <img className="home-title-art" src={homeAssets.title} alt="海洋涂鸦" />
        <div className="home-top-actions">
          <button className="home-icon-button sound" type="button" aria-label="声音" />
          <button className="home-icon-button settings" type="button" aria-label="设置" onClick={() => navigate('/settings')} />
          <button className="home-icon-button help" type="button" aria-label="帮助" onClick={() => navigate('/settings')} />
        </div>
      </header>

      <div className="home-stage">
        <button className="home-asset-button start" type="button" aria-label="开始涂色" onClick={() => navigate('/templates')}>
          <img src={homeAssets.start} alt="开始涂色" />
        </button>
        <button className="home-asset-button gallery" type="button" aria-label="我的作品" onClick={() => navigate('/gallery')}>
          <img src={homeAssets.gallery} alt="我的作品" />
        </button>
        <button className="home-asset-button ocean" type="button" aria-label="海洋世界" onClick={() => navigate('/ocean')}>
          <img src={homeAssets.ocean} alt="海洋世界" />
        </button>
      </div>

      {!settings.tutorialSeen && <img className="guide-arrow" src={homeAssets.guideArrow} alt="" />}

      <ConfirmDialog
        open={!settings.tutorialSeen}
        title="一起开始吧"
        message="先选择一个海洋伙伴，再点区域上色。完成后可以把它送进海洋。"
        confirmText="去涂色"
        cancelText="跳过"
        onConfirm={() => {
          markTutorialSeen();
          navigate('/templates');
        }}
        onCancel={markTutorialSeen}
      />
    </section>
  );
}
