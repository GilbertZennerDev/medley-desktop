import { app, BrowserWindow, Menu, ipcMain, dialog } from 'electron';
import path from 'path';
import { LibraryService } from './services/library-scanner';
import { StorageService } from './services/storage';

let mainWindow: BrowserWindow | null = null;
let libraryService: LibraryService = null!;
let storageService: StorageService = null!;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  const startUrl = `file://${path.join(__dirname, '../../public/index.html')}`;

  mainWindow.loadURL(startUrl);
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC: Library
ipcMain.handle('library:choose-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openDirectory'],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

ipcMain.handle('library:scan-folder', async (_event, folderPath: string) => {
  return libraryService.scan(folderPath);
});

ipcMain.handle('library:get-tracks', async () => {
  return storageService.getTracks();
});

ipcMain.handle('library:save-tracks', async (_event, entries: any[]) => {
  return storageService.saveTracks(entries);
});

ipcMain.handle('library:clear-tracks', async () => {
  return storageService.clearTracks();
});

// IPC: Settings
ipcMain.handle('settings:get', async () => {
  return storageService.getSettings();
});

ipcMain.handle('settings:set', async (_event, settings: any) => {
  return storageService.setSettings(settings);
});

app.on('ready', () => {
  libraryService = new LibraryService();
  storageService = new StorageService();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Menu
const createMenu = () => {
  const template: any = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Exit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit(),
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About Medley Magic',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('show-about');
            }
          },
        },
      ],
    },
  ];

  template.push({
    label: 'Debug',
    submenu: [{ role: 'toggleDevTools' }],
  });

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

app.on('ready', createMenu);
