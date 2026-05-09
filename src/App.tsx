import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { RotateCcw } from 'lucide-react';
import { useAppStore } from './store/useAppStore';
import { HomePage } from './pages/HomePage';
import { TemplatesPage } from './pages/TemplatesPage';
import { ColorPage } from './pages/ColorPage';
import { PreviewPage } from './pages/PreviewPage';
import { OceanPage } from './pages/OceanPage';
import { GalleryPage } from './pages/GalleryPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const hydrate = useAppStore((state) => state.hydrate);
  const ready = useAppStore((state) => state.ready);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  if (!ready) {
    return (
      <main className="app-shell">
        <section className="loading-screen">正在进入海洋...</section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="portrait-lock">
        <RotateCcw size={52} />
        <strong>请横屏使用</strong>
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/color/:templateId" element={<ColorPage />} />
        <Route path="/preview/:artworkId" element={<PreviewPage />} />
        <Route path="/ocean" element={<OceanPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}

