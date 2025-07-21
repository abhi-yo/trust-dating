import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  processChat: (chatText: string) => ipcRenderer.invoke('process-chat', chatText),
  fetchActivities: (interests: string[]) => ipcRenderer.invoke('fetch-activities', interests)
});
