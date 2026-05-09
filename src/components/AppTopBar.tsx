import type { ReactNode } from 'react';
import { ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';

interface AppTopBarProps {
  title: string;
  backTo?: string;
  rightSlot?: ReactNode;
}

export function AppTopBar({ title, backTo = '/', rightSlot }: AppTopBarProps) {
  const navigate = useNavigate();
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const VolumeIcon = settings.soundOn ? Volume2 : VolumeX;

  return (
    <header className="top-bar">
      <button className="icon-button" type="button" aria-label="返回" onClick={() => navigate(backTo)}>
        <ArrowLeft size={28} />
      </button>
      <h1>{title}</h1>
      <div className="top-actions">
        {rightSlot}
        <button
          className="icon-button"
          type="button"
          aria-label="声音"
          onClick={() => updateSettings({ soundOn: !settings.soundOn })}
        >
          <VolumeIcon size={28} />
        </button>
      </div>
    </header>
  );
}

