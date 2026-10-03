import { useState, useEffect } from 'react';
import { useMedley, fmt } from '@shared/medley-engine';
import type { MediaEntry } from '@shared/ipc';
import '../../../styles/medley.css';

export function Medley() {
  const [entries, setEntries] = useState<MediaEntry[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [folderPath, setFolderPath] = useState<string>('');

  const medley = useMedley(entries);

  // Load saved entries on mount
  useEffect(() => {
    const loadTracks = async () => {
      const tracks = await window.medleyApi.library.getTracks();
      setEntries(tracks);
    };
    loadTracks();
  }, []);

  const handlePickFolder = async () => {
    try {
      const path = await window.medleyApi.library.chooseFolder();
      if (!path) return;

      setFolderPath(path);
      setIsScanning(true);
      setScanProgress(0);

      const scannedEntries = await window.medleyApi.library.scanFolder(path);
      setEntries(scannedEntries);
      await window.medleyApi.library.saveTracks(scannedEntries);

      setIsScanning(false);
    } catch (error) {
      console.error('Error picking folder:', error);
      setIsScanning(false);
    }
  };

  const handleClear = async () => {
    if (confirm('Clear library and stop playback?')) {
      medley.stop();
      setEntries([]);
      await window.medleyApi.library.clearTracks();
    }
  };

  return (
    <div className="medley-container">
      <header className="medley-header">
        <div className="nav-brand">Medley Magic</div>
        <span className="nav-label">
          <span className="dot"></span>Desktop App
        </span>
      </header>

      <main className="medley-content">
        <section className="medley-intro">
          <h1>Endless Random Snippets</h1>
          <p>Pick a folder from your computer. Get random 5–30 second clips from your music library on endless repeat.</p>
        </section>

        {/* Folder Selection */}
        <div className="section">
          <button
            onClick={handlePickFolder}
            disabled={isScanning}
            className="btn btn-primary"
          >
            {isScanning ? `Scanning... ${scanProgress}` : '📁 Pick Folder'}
          </button>

          {folderPath && (
            <div className="folder-info">
              <small>{folderPath}</small>
            </div>
          )}

          {entries.length > 0 && (
            <div className="entries-count">
              {entries.length} media files loaded
            </div>
          )}
        </div>

        {/* Player */}
        {entries.length > 0 && (
          <>
            {/* Now Playing */}
            <div className="section">
              <div className="now-playing">
                <p className="label">NOW PLAYING</p>
                {medley.playback.snippet ? (
                  <div>
                    <p className="track-name">{medley.playback.snippet.name}</p>
                    <p className="track-path">{medley.playback.snippet.path}</p>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{
                          width: `${medley.playback.duration ? (medley.playback.currentTime / medley.playback.duration) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div className="time-display">
                      <span>{fmt(medley.playback.currentTime)}</span>
                      <span>{fmt(medley.playback.duration)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="no-snippet">No snippet playing</p>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="section controls">
              <button
                onClick={medley.play}
                disabled={medley.playback.isPlaying}
                className="btn btn-success"
              >
                ▶ Play
              </button>
              <button
                onClick={medley.pause}
                disabled={!medley.playback.isPlaying}
                className="btn btn-warning"
              >
                ⏸ Pause
              </button>
              <button
                onClick={medley.stop}
                className="btn btn-danger"
              >
                ⏹ Stop
              </button>
              <button
                onClick={medley.playNextSnippet}
                className="btn btn-info"
              >
                ⏭ Skip
              </button>
            </div>

            {/* Settings */}
            <div className="section settings">
              <div className="setting-group">
                <label>
                  Snippet Length: <strong>{medley.settings.length}s</strong>
                </label>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={medley.settings.length}
                  onChange={(e) => medley.setLength(Number(e.target.value))}
                  className="slider"
                />
              </div>

              <div className="setting-group">
                <label>
                  Volume: <strong>{Math.round(medley.settings.volume * 100)}%</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={medley.settings.volume}
                  onChange={(e) => medley.setVolume(Number(e.target.value))}
                  className="slider"
                />
              </div>
            </div>

            {/* Library List */}
            <div className="section">
              <div className="library-header">
                <h2>Library ({entries.length})</h2>
                <button
                  onClick={handleClear}
                  className="btn btn-small btn-danger"
                >
                  Clear
                </button>
              </div>

              <div className="library-list">
                {entries.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`library-item ${
                      medley.playback.snippet?.id === entry.id ? 'playing' : ''
                    }`}
                  >
                    <p className="item-name">{entry.name}</p>
                    <p className="item-path">{entry.path}</p>
                    <p className="item-meta">
                      {entry.kind} {entry.duration ? `· ${fmt(entry.duration)}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
