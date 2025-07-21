declare module 'electron-next' {
  function prepareNext(rendererDir: string, port?: number): Promise<void>;
  export = prepareNext;
}

interface ElectronAPI {
  processChat: (chatText: string) => Promise<string>;
  fetchActivities: (interests: string[]) => Promise<string[]>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
