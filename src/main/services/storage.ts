import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { promises as fsPromises } from 'fs';
import type { MediaEntry, PlayerSettings } from '@shared/ipc';

export class StorageService {
  private dataDir: string;
  private tracksFile: string;
  private settingsFile: string;

  constructor() {
    this.dataDir = path.join(app.getPath('userData'), 'data');
    this.tracksFile = path.join(this.dataDir, 'tracks.json');
    this.settingsFile = path.join(this.dataDir, 'settings.json');
    this.ensureDataDir();
  }

  private ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  async getTracks(): Promise<MediaEntry[]> {
    try {
      if (fs.existsSync(this.tracksFile)) {
        const data = await fsPromises.readFile(this.tracksFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (err) {
      console.error('Error reading tracks:', err);
    }
    return [];
  }

  async saveTracks(entries: MediaEntry[]): Promise<void> {
    try {
      await fsPromises.writeFile(this.tracksFile, JSON.stringify(entries, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving tracks:', err);
    }
  }

  async clearTracks(): Promise<void> {
    try {
      await fsPromises.writeFile(this.tracksFile, JSON.stringify([], null, 2), 'utf-8');
    } catch (err) {
      console.error('Error clearing tracks:', err);
    }
  }

  async getSettings(): Promise<PlayerSettings> {
    try {
      if (fs.existsSync(this.settingsFile)) {
        const data = await fsPromises.readFile(this.settingsFile, 'utf-8');
        return JSON.parse(data);
      }
    } catch (err) {
      console.error('Error reading settings:', err);
    }
    return { length: 10, volume: 0.8 };
  }

  async setSettings(settings: Partial<PlayerSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      await fsPromises.writeFile(this.settingsFile, JSON.stringify(updated, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  }
}
