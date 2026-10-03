import fs from 'fs';
import path from 'path';
import { promises as fsPromises } from 'fs';
import type { MediaEntry } from '@shared/ipc';

const AUDIO_EXTS = new Set(['.mp3', '.m4a', '.wav', '.flac', '.ogg']);
const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mkv']);

export class LibraryService {
  async scan(folderPath: string): Promise<MediaEntry[]> {
    const entries: MediaEntry[] = [];
    let count = 0;

    const walk = async (dir: string, prefix: string) => {
      try {
        const files = await fsPromises.readdir(dir, { withFileTypes: true });

        for (const file of files) {
          const fullPath = path.join(dir, file.name);
          const relativePath = `${prefix}${file.name}`;

          if (file.isDirectory()) {
            await walk(fullPath, `${relativePath}/`);
          } else if (file.isFile()) {
            const ext = path.extname(file.name).toLowerCase();
            const kind = AUDIO_EXTS.has(ext) ? 'audio' : VIDEO_EXTS.has(ext) ? 'video' : null;

            if (kind) {
              entries.push({
                id: `${relativePath}-${Date.now()}-${Math.random()}`,
                path: relativePath,
                name: file.name,
                kind,
              });
              count++;
            }
          }
        }
      } catch (err) {
        console.error(`Error scanning ${dir}:`, err);
      }
    };

    await walk(folderPath, '');
    return entries;
  }

  async getMusicMetadata(_filePath: string) {
    // Placeholder: In echter App würde man hier Audio-Metadaten auslesen (z.B. mit music-metadata)
    return {
      duration: 180,
      bitrate: 320,
    };
  }
}
