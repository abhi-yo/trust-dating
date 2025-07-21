import { app, BrowserWindow, globalShortcut, ipcMain, IpcMainInvokeEvent } from 'electron';
import * as path from 'path';
const prepareNext = require('electron-next');

let mainWindow: BrowserWindow | null;

async function createWindow() {
  await prepareNext('./renderer', 8000);  // Prepares Next.js renderer

  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:8000');
  }

  globalShortcut.register('CommandOrControl+Shift+O', () => {
    if (mainWindow) mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });

  ipcMain.handle('process-chat', async (_event: IpcMainInvokeEvent, chatText: string) => {
    try {
      const ollama = require('ollama');
      const response = await ollama.chat({
        model: 'llama2',
        messages: [{ role: 'user', content: `Extract interests from this chat: ${chatText}` }]
      });
      return response.message.content;
    } catch (error) {
      console.error('Error processing chat:', error);
      return 'Error processing chat. Please ensure Ollama is running.';
    }
  });

  ipcMain.handle('fetch-activities', async (_event: IpcMainInvokeEvent, interests: string[]) => {
    try {
      // Mock activity suggestions based on interests
      const activities = [
        `Art gallery visit (based on interest: ${interests[0] || 'general'})`,
        `Coffee shop meetup`,
        `Outdoor hiking trail`,
        `Local museum tour`,
        `Cooking class together`
      ];
      return activities;
    } catch (error) {
      console.error('Error fetching activities:', error);
      return ['Default coffee meetup', 'Public park walk'];
    }
  });
}

app.whenReady().then(() => {
  createWindow();
  if (mainWindow) mainWindow.hide();
});

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => { 
  if (process.platform !== 'darwin') app.quit(); 
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
