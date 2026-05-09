export type ArtworkStatus = 'draft' | 'inOcean';

export interface TemplateRegion {
  id: string;
  label: string;
  path: string;
  defaultColor: string;
}

export interface Template {
  id: string;
  name: string;
  category: '推荐' | '简单' | '进阶';
  difficulty: 1 | 2 | 3;
  animalType: 'dolphin' | 'turtle' | 'octopus' | 'whale';
  estimatedMinutes: number;
  viewBox: string;
  regions: TemplateRegion[];
}

export interface DoodlePoint {
  x: number;
  y: number;
}

export interface DoodleStroke {
  id: string;
  tool: 'brush' | 'eraser';
  color: string;
  width: number;
  points: DoodlePoint[];
}

export interface Artwork {
  id: string;
  templateId: string;
  title: string;
  status: ArtworkStatus;
  createdAt: string;
  updatedAt: string;
  regionColorMap: Record<string, string>;
  doodleStrokes: DoodleStroke[];
  thumbnailDataUrl: string;
  textureDataUrl: string;
  textureVersion: number;
}

export interface OceanBuddy {
  artworkId: string;
  spawnAt: string;
  pathSeed: number;
  depthSeed: number;
  speed: number;
  scale: number;
}

export interface Settings {
  soundOn: boolean;
  sfxOn: boolean;
  lowPerfMode: boolean;
  tutorialSeen: boolean;
}
