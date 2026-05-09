import { openDB, type DBSchema } from 'idb';
import type { Artwork, OceanBuddy, Settings } from '../types';

const DB_NAME = 'ocean-doodle-db';
const DB_VERSION = 1;
const SETTINGS_KEY = 'ocean-doodle-settings';

const defaultSettings: Settings = {
  soundOn: true,
  sfxOn: true,
  lowPerfMode: false,
  tutorialSeen: false,
};

interface OceanDoodleDb extends DBSchema {
  artworks: {
    key: string;
    value: Artwork;
    indexes: { 'by-updated': string };
  };
  oceanBuddies: {
    key: string;
    value: OceanBuddy;
  };
}

const dbPromise = openDB<OceanDoodleDb>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    const artworkStore = db.createObjectStore('artworks', { keyPath: 'id' });
    artworkStore.createIndex('by-updated', 'updatedAt');
    db.createObjectStore('oceanBuddies', { keyPath: 'artworkId' });
  },
});

export async function getArtworks() {
  const db = await dbPromise;
  const artworks = await db.getAll('artworks');
  return artworks.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getArtwork(id: string) {
  const db = await dbPromise;
  return db.get('artworks', id);
}

export async function saveArtwork(artwork: Artwork) {
  const db = await dbPromise;
  await db.put('artworks', artwork);
}

export async function deleteArtwork(id: string) {
  const db = await dbPromise;
  const tx = db.transaction(['artworks', 'oceanBuddies'], 'readwrite');
  await tx.objectStore('artworks').delete(id);
  await tx.objectStore('oceanBuddies').delete(id);
  await tx.done;
}

export async function getOceanBuddies() {
  const db = await dbPromise;
  return db.getAll('oceanBuddies');
}

export async function saveOceanBuddy(buddy: OceanBuddy) {
  const db = await dbPromise;
  await db.put('oceanBuddies', buddy);
}

export async function clearAllData() {
  const db = await dbPromise;
  const tx = db.transaction(['artworks', 'oceanBuddies'], 'readwrite');
  await tx.objectStore('artworks').clear();
  await tx.objectStore('oceanBuddies').clear();
  await tx.done;
}

export function loadSettings(): Settings {
  const raw = window.localStorage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;

  try {
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: Settings) {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

