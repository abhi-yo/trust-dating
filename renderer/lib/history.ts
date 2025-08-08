export type HistoryType = "smartReply" | "catfish" | "quality";

export interface HistoryItem {
  id: string;
  type: HistoryType;
  inputText: string;
  outputSummary: string;
  timestamp: number;
}

const STORAGE_KEY = "sda.history.v1";

function read(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: HistoryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 200)));
  } catch {
    // ignore quota errors silently
  }
}

export function saveHistoryItem(
  item: Omit<HistoryItem, "id" | "timestamp"> & {
    id?: string;
    timestamp?: number;
  }
): HistoryItem {
  const items = read();
  const full: HistoryItem = {
    id: item.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: item.timestamp || Date.now(),
    type: item.type,
    inputText: item.inputText,
    outputSummary: item.outputSummary,
  };
  items.unshift(full);
  write(items);
  return full;
}

export function searchHistory(
  query: string,
  type?: HistoryType
): HistoryItem[] {
  const items = read();
  const q = query.trim().toLowerCase();
  return items.filter(
    (it) =>
      (type ? it.type === type : true) &&
      (q.length === 0 ||
        it.inputText.toLowerCase().includes(q) ||
        it.outputSummary.toLowerCase().includes(q))
  );
}

export function listHistory(type?: HistoryType): HistoryItem[] {
  const items = read();
  return type ? items.filter((i) => i.type === type) : items;
}

export function clearHistory(): void {
  write([]);
}
