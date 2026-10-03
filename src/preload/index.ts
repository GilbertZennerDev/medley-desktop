import { contextBridge, ipcRenderer } from 'electron';
import type { IpcAPI } from '@shared/ipc';

const api: IpcAPI = {
  library: {
    chooseFolder: () => ipcRenderer.invoke('library:choose-folder'),
    scanFolder: (path: string) => ipcRenderer.invoke('library:scan-folder', path),
    getTracks: () => ipcRenderer.invoke('library:get-tracks'),
    saveTracks: (entries) => ipcRenderer.invoke('library:save-tracks', entries),
    clearTracks: () => ipcRenderer.invoke('library:clear-tracks'),
  },
  player: {
    play: (entry, startTime) => ipcRenderer.invoke('player:play', entry, startTime),
    pause: () => ipcRenderer.invoke('player:pause'),
    stop: () => ipcRenderer.invoke('player:stop'),
    seek: (time) => ipcRenderer.invoke('player:seek', time),
    setVolume: (volume) => ipcRenderer.invoke('player:set-volume', volume),
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (settings) => ipcRenderer.invoke('settings:set', settings),
  },
  on: (channel: string, callback: (data: any) => void) => {
    const listener = (_event: any, data: any) => callback(data);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
};

contextBridge.exposeInMainWorld('medleyApi', api);

declare global {
  interface Window {
    medleyApi: IpcAPI;
  }
}
