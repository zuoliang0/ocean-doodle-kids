import { create } from 'zustand';
import type { Artwork, OceanBuddy, Settings } from '../types';
import {
  clearAllData,
  deleteArtwork,
  getArtworks,
  getOceanBuddies,
  loadSettings,
  saveArtwork,
  saveOceanBuddy,
  saveSettings,
} from '../lib/storage';

interface AppState {
  artworks: Artwork[];
  buddies: OceanBuddy[];
  settings: Settings;
  ready: boolean;
  hydrate: () => Promise<void>;
  upsertArtwork: (artwork: Artwork) => Promise<void>;
  removeArtwork: (id: string) => Promise<void>;
  addBuddy: (buddy: OceanBuddy) => Promise<void>;
  updateSettings: (patch: Partial<Settings>) => void;
  markTutorialSeen: () => void;
  resetLocalData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  artworks: [],
  buddies: [],
  settings: loadSettings(),
  ready: false,
  hydrate: async () => {
    const [artworks, buddies] = await Promise.all([getArtworks(), getOceanBuddies()]);
    set({ artworks, buddies, ready: true });
  },
  upsertArtwork: async (artwork) => {
    await saveArtwork(artwork);
    const existing = get().artworks.filter((item) => item.id !== artwork.id);
    set({ artworks: [artwork, ...existing].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)) });
  },
  removeArtwork: async (id) => {
    await deleteArtwork(id);
    set({
      artworks: get().artworks.filter((item) => item.id !== id),
      buddies: get().buddies.filter((item) => item.artworkId !== id),
    });
  },
  addBuddy: async (buddy) => {
    await saveOceanBuddy(buddy);
    set({ buddies: [buddy, ...get().buddies.filter((item) => item.artworkId !== buddy.artworkId)] });
  },
  updateSettings: (patch) => {
    const settings = { ...get().settings, ...patch };
    saveSettings(settings);
    set({ settings });
  },
  markTutorialSeen: () => {
    const settings = { ...get().settings, tutorialSeen: true };
    saveSettings(settings);
    set({ settings });
  },
  resetLocalData: async () => {
    await clearAllData();
    set({ artworks: [], buddies: [] });
  },
}));

