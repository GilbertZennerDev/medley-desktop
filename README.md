# Medley Magic — Desktop App

Endless random music snippets from your local library. Built with Electron + React + TypeScript.

## Development

**Prerequisites:**
- Node 20+
- npm 10+
- TypeScript 5.3+

**Setup:**

```bash
# Install dependencies
npm install

# Compile TypeScript (one-time or watch mode)
npm run build

# Run the app
npm run dev
```

The app will start with DevTools open for debugging.

**Development Workflow:**
1. Edit TypeScript files in `src/`
2. Run `npm run build` to compile
3. Press F5 in Electron to reload (or close/reopen app)

## Project Structure

```
src/
  main/
    index.ts              # Electron main process
    services/
      library-scanner.ts  # Filesystem scanning
      storage.ts          # Persistence (JSON)
  preload/
    index.ts              # Secure IPC bridge
  renderer/
    App.tsx               # React root component
    index.tsx             # React DOM entry
    features/
      library/
        Medley.tsx        # Main UI component
  shared/
    ipc.ts                # TypeScript contracts
    medley-engine.ts      # Player logic (React hook)
  styles/
    medley.css            # Global styles
```

## Features

- **Local Folder Scan** — Pick any folder from your computer
- **Random Playback** — Get random 5–30s clips from your library
- **Full Control** — Adjust length & volume
- **Persistent State** — Library & settings saved locally (JSON)
- **Native File Access** — No permissions dialogs (Windows native)

## Building

```bash
# Build for Windows
npm run dist:win

# Build for macOS
npm run dist:mac

# Build for Linux
npm run dist:linux

# Build all platforms
npm run dist
```

Installers will be in the `out/` directory.

## Debugging

- Press `F12` in the app to open DevTools
- Check console for errors and IPC logs
- Use `electron --remote-debugging-port=9333` for remote debugging

## Tech Stack

- **Electron 33** — Desktop app framework
- **React 19 RC1** — UI components
- **TypeScript 5.3** — Type safety
- **Electron Builder** — Packaging & distribution
- **IPC + contextBridge** — Secure process communication

## Notes

- Audio playback uses Web Audio API (works in Electron)
- File handles are not persisted across sessions (File System Access API not available)
- Settings & track list stored in `userData/data/` as JSON
