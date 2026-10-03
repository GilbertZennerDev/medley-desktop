import { useState, useCallback } from 'react';
import type { MediaEntry, PlaybackState, PlayerSettings } from './ipc';

export function useMedley(entries: MediaEntry[]) {
  const [playback, setPlayback] = useState<PlaybackState>({
    snippet: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
  });

  const [settings, setSettings] = useState<PlayerSettings>({
    length: 10,
    volume: 0.8,
  });

  const [audioContext, setAudioContext] = useState<{
    ctx: AudioContext | null;
    source: AudioBufferSourceNode | null;
    gainNode: GainNode | null;
  }>({
    ctx: null,
    source: null,
    gainNode: null,
  });

  const initAudio = useCallback(() => {
    if (typeof window === 'undefined') return;
    if (audioContext.ctx) return;

    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.value = settings.volume;

    setAudioContext({ ctx, source: null, gainNode });
  }, [audioContext.ctx, settings.volume]);

  const playSnippet = useCallback(
    async (entry: MediaEntry) => {
      if (!audioContext.ctx) initAudio();
      if (!entries.length) return;

      try {
        setPlayback(p => ({ ...p, snippet: entry, isPlaying: true }));

        const audioCtx = audioContext.ctx!;
        const gainNode = audioContext.gainNode!;

        // Mock: simuliere Wiedergabe für Entwicklung
        // In echter App: fetch audio file -> decode -> play
        const duration = entry.duration || settings.length;
        const startTime = Math.random() * Math.max(0, (entry.duration || 60) - settings.length);

        setPlayback(p => ({
          ...p,
          duration: settings.length,
          currentTime: 0,
        }));

        for (let i = 0; i < settings.length * 10; i++) {
          if (!playback.isPlaying) break;
          await new Promise(r => setTimeout(r, 100));
          setPlayback(p => ({
            ...p,
            currentTime: Math.min(p.currentTime + 0.1, settings.length),
          }));
        }

        if (playback.isPlaying) {
          playNextSnippet();
        }
      } catch (err) {
        console.error('Playback error:', err);
      }
    },
    [audioContext, entries, settings.length, playback.isPlaying]
  );

  const playNextSnippet = useCallback(() => {
    if (!entries.length) return;
    const random = entries[Math.floor(Math.random() * entries.length)];
    playSnippet(random);
  }, [entries, playSnippet]);

  const play = useCallback(() => {
    if (playback.snippet) {
      playSnippet(playback.snippet);
    } else if (entries.length) {
      playNextSnippet();
    }
  }, [playback.snippet, entries, playSnippet, playNextSnippet]);

  const pause = useCallback(() => {
    setPlayback(p => ({ ...p, isPlaying: false }));
  }, []);

  const stop = useCallback(() => {
    setPlayback({
      snippet: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    });
  }, []);

  const setLength = useCallback((length: number) => {
    setSettings(s => ({ ...s, length: Math.max(5, Math.min(30, length)) }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    setSettings(s => ({ ...s, volume: Math.max(0, Math.min(1, volume)) }));
    if (audioContext.gainNode) {
      audioContext.gainNode.gain.value = volume;
    }
  }, [audioContext.gainNode]);

  return {
    playback,
    settings,
    play,
    pause,
    stop,
    playNextSnippet,
    setLength,
    setVolume,
  };
}

export function fmt(secs: number): string {
  if (!isFinite(secs)) return '--:--';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
