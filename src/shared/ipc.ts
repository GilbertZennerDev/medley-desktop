export interface MediaEntry {
  handle?: unknown;
  path: string;
  name: string;
  kind: 'audio' | 'video';
  duration?: number;
  id: string;
}

export interface LibraryState {
  entries: MediaEntry[];
  lastScannedPath?: string;
}

export interface PlaybackState {
  snippet: MediaEntry | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
}

export interface PlayerSettings {
  length: number; // 5-30s
  volume: number; // 0-1
}

export interface IpcAPI {
  library: {
    chooseFolder: () => Promise<string | null>;
    scanFolder: (path: string) => Promise<MediaEntry[]>;
    getTracks: () => Promise<MediaEntry[]>;
    saveTracks: (entries: MediaEntry[]) => Promise<void>;
    clearTracks: () => Promise<void>;
  };
  player: {
    play: (entry: MediaEntry, startTime?: number) => Promise<void>;
    pause: () => Promise<void>;
    stop: () => Promise<void>;
    seek: (time: number) => Promise<void>;
    setVolume: (volume: number) => Promise<void>;
  };
  settings: {
    get: () => Promise<PlayerSettings>;
    set: (settings: Partial<PlayerSettings>) => Promise<void>;
  };
  on: (channel: string, callback: (data: any) => void) => () => void;
}
