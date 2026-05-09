import { useMemo, useState } from 'react';
import { Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppTopBar } from '../components/AppTopBar';
import { ArtworkAnimal } from '../components/ArtworkAnimal';
import { templates } from '../data/templates';

const categories = ['全部', '推荐', '简单', '进阶'] as const;
const templateAssets = {
  dolphinCard: new URL('../../assets/slices/page_page-3/asset_f5070e6627e34c30.png', import.meta.url).href,
  tip: new URL('../../assets/slices/page_page-3/asset_5f58779077fe4363.png', import.meta.url).href,
};

export function TemplatesPage() {
  const [category, setCategory] = useState<(typeof categories)[number]>('全部');
  const navigate = useNavigate();
  const visibleTemplates = useMemo(
    () => templates.filter((template) => category === '全部' || template.category === category),
    [category],
  );

  return (
    <section className="page templates-page themed-page">
      <AppTopBar title="选择海洋伙伴" rightSlot={<Filter size={26} />} />
      <img className="template-tip-art" src={templateAssets.tip} alt="" />
      <div className="tabs">
        {categories.map((item) => (
          <button
            key={item}
            className={item === category ? 'tab active' : 'tab'}
            type="button"
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="template-grid">
        {visibleTemplates.map((template) => (
          <button
            className="template-card"
            type="button"
            key={template.id}
            onClick={() => navigate(`/color/${template.id}`)}
          >
            {template.id === 'dolphin' ? (
              <img className="template-card-art" src={templateAssets.dolphinCard} alt={template.name} />
            ) : (
              <ArtworkAnimal template={template} colors={{}} className="template-preview" />
            )}
            <strong>{template.name}</strong>
            <span>{'★'.repeat(template.difficulty)} · {template.estimatedMinutes} 分钟</span>
          </button>
        ))}
      </div>
    </section>
  );
}
