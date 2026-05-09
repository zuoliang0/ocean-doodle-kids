import { Brush, Fish } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppTopBar } from '../components/AppTopBar';
import { ParentGate } from '../components/ParentGate';
import { getTemplate } from '../data/templates';
import { useAppStore } from '../store/useAppStore';

const galleryAssets = {
  card: new URL('../../assets/slices/page_page-7/asset_a6072a1c836f4cc9.png', import.meta.url).href,
  continueButton: new URL('../../assets/slices/page_page-7/asset_b55771bcd01740ef.png', import.meta.url).href,
  previewButton: new URL('../../assets/slices/page_page-7/asset_cb81c539eeaa4308.png', import.meta.url).href,
  deleteButton: new URL('../../assets/slices/page_page-7/asset_4562e08313474162.png', import.meta.url).href,
};

export function GalleryPage() {
  const navigate = useNavigate();
  const artworks = useAppStore((state) => state.artworks);
  const removeArtwork = useAppStore((state) => state.removeArtwork);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <section className="page gallery-page themed-page">
      <AppTopBar title="我的作品" />
      {artworks.length === 0 ? (
        <div className="empty-state">
          <Fish size={72} />
          <h2>还没有作品</h2>
          <button className="primary-button" type="button" onClick={() => navigate('/templates')}>
            <Brush size={24} />
            去涂色
          </button>
        </div>
      ) : (
        <div className="gallery-grid">
          {artworks.map((artwork) => {
            const template = getTemplate(artwork.templateId);
            return (
              <article className="artwork-card" key={artwork.id}>
                <img className="artwork-card-bg" src={galleryAssets.card} alt="" />
                <button className="artwork-thumb" type="button" onClick={() => navigate(`/preview/${artwork.id}`)}>
                  <img src={artwork.thumbnailDataUrl} alt={template.name} />
                </button>
                <div>
                  <strong>{template.name}</strong>
                  <span>{artwork.status === 'inOcean' ? '已入海' : '草稿'}</span>
                </div>
                <div className="card-actions">
                  <button
                    className="gallery-asset-action"
                    type="button"
                    onClick={() => navigate(`/color/${artwork.templateId}?artworkId=${artwork.id}`)}
                  >
                    <img src={galleryAssets.continueButton} alt="继续涂色" />
                  </button>
                  <button className="gallery-asset-action" type="button" onClick={() => navigate(`/preview/${artwork.id}`)}>
                    <img src={galleryAssets.previewButton} alt="去预览" />
                  </button>
                  <button className="gallery-asset-action" type="button" onClick={() => setDeleteId(artwork.id)}>
                    <img src={galleryAssets.deleteButton} alt="删除" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
      <ParentGate
        open={deleteId !== null}
        title="删除作品"
        message="删除后会同时从海洋世界移除。"
        onCancel={() => setDeleteId(null)}
        onPass={() => {
          if (deleteId) void removeArtwork(deleteId);
          setDeleteId(null);
        }}
      />
    </section>
  );
}
