import { createMockData, DATA_VERSION } from "@/data/mockData";
import type { AppData } from "@/types";

/**
 * 数据访问接口。当前实现为 localStorage；后续替换为 Supabase 时，
 * 只需提供同签名的实现（例如按集合拆表读写）并在 store 中切换即可。
 */
export interface DataService {
  load(): Promise<AppData | null>;
  save(data: AppData): Promise<void>;
  reset(): Promise<AppData>;
}

const STORAGE_KEY = "pmm-mainline-tracker:data";

/** 旧版本数据：能迁移的就地升级（保留用户修改），否则返回 null 以重新载入示例数据 */
function migrate(data: AppData): AppData | null {
  if (data.version === 2) {
    const seed = createMockData();
    data.layers = data.layers.map((l) => {
      const s = seed.layers.find((x) => x.id === l.id);
      return s ? { ...l, positioning: s.positioning, stage: s.stage } : l;
    });
    data.version = 3;
  }
  if (data.version === 3) {
    const seed = createMockData();
    const replaced = new Set(["t-1", "t-2", "t-3", "t-4"]);
    const added = seed.tasks.filter((t) => t.layerId === "bloodline" && !data.tasks.some((x) => x.id === t.id));
    data.tasks = [...data.tasks.filter((t) => !replaced.has(t.id)), ...added];
    data.version = 4;
  }
  return data.version === DATA_VERSION ? data : null;
}

export const localStorageService: DataService = {
  async load() {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return migrate(JSON.parse(raw) as AppData);
    } catch {
      return null;
    }
  },
  async save(data) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },
  async reset() {
    const data = createMockData();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  },
};

export const dataService: DataService = localStorageService;
