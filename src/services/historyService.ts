import { HistoryItem } from "../types";

const STORAGE_KEY = "leaf_scan_history";

export class HistoryService {
  static getHistory(): HistoryItem[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  static saveItem(item: Omit<HistoryItem, "id">): HistoryItem {
    const history = this.getHistory();
    const newItem: HistoryItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9)
    };
    history.unshift(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 50))); // Keep last 50
    return newItem;
  }

  static deleteItem(id: string): void {
    const history = this.getHistory().filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }
}
