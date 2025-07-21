/// <reference types="react" />
/// <reference types="react-dom" />

interface ElectronAPI {
  processChat: (chatText: string) => Promise<string>;
  fetchActivities: (interests: string[]) => Promise<string[]>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
