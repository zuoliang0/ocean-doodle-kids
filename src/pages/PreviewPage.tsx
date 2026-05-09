import { Fish } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import type { OceanBuddy } from '../types';
import { getTemplate } from '../data/templates';
import { useAppStore } from '../store/useAppStore';

const previewAssets = {
  backButton: new URL('../../assets/slices/page_page-4/asset_a2299903d3aa43b1.png', import.meta.url).href,
  saved: new URL('../../assets/slices/page_page-4/asset_fe9d709bc7db4884.png', import.meta.url).href,
  frame: new URL('../../assets/slices/page_page-4/asset_dcf3235a1bc044a1.png', import.meta.url).href,
  continueButton: new URL('../../assets/slices/page_page-4/asset_78f19d0ad3934f69.png', import.meta.url).href,
  oceanButton: new URL('../../assets/slices/page_page-4/asset_65ae53bf3c3e4b74.png', import.meta.url).href,
};

export function PreviewPage() {
  const { artworkId } = useParams();
  const navigate = useNavigate();
  const artwork = useAppStore((state) => state.artworks.find((item) => item.id === artworkId));
  const upsertArtwork = useAppStore((state) => state.upsertArtwork);
  const addBuddy = useAppStore((state) => state.addBuddy);

  if (!artwork) {
    return (
      <section className="page">
        <div className="empty-state">
          <Fish size={68} />
          <h2>没有找到作品</h2>
          <button className="primary-button" type="button" onClick={() => navigate('/templates')}>
            去涂色
          </button>
        </div>
      </section>
    );
  }

  const template = getTemplate(artwork.templateId);

  async function sendToOcean() {
    if (!artwork) return;
    const now = new Date().toISOString();
    await upsertArtwork({ ...artwork, status: 'inOcean', updatedAt: now });
    const buddy: OceanBuddy = {
      artworkId: artwork.id,
      spawnAt: now,
      pathSeed: Math.random(),
      depthSeed: Math.random(),
      speed: 0.55 + Math.random() * 0.35,
      scale: 0.75 + Math.random() * 0.3,
    };
    await addBuddy(buddy);
    navigate('/ocean');
  }

  return (
    <section className="page preview-page">
      <header className="preview-header">
        <button
          className="preview-back-button"
          type="button"
          aria-label="返回继续涂色"
          onClick={() => navigate(`/color/${artwork.templateId}?artworkId=${artwork.id}`)}
        >
          <img src={previewAssets.backButton} alt="" />
        </button>
        <h1>画得真棒！</h1>
        <img className="saved-badge-art" src={previewAssets.saved} alt="已保存" />
      </header>

      <div className="preview-layout">
        <section className="preview-artwork">
          <img className="preview-frame-art" src={previewAssets.frame} alt="" />
          <img className="preview-user-art" src={artwork.textureDataUrl} alt={template.name} />
        </section>
      </div>

      <footer className="preview-actions">
        <button
          className="asset-action-button continue"
          type="button"
          onClick={() => navigate(`/color/${artwork.templateId}?artworkId=${artwork.id}`)}
        >
          <img src={previewAssets.continueButton} alt="继续涂色" />
        </button>
        <button className="asset-action-button ocean" type="button" onClick={() => void sendToOcean()}>
          <img src={previewAssets.oceanButton} alt="送入海洋" />
        </button>
      </footer>
    </section>
  );
}
