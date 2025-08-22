export type EquipmentColumnKey =
  | 'invNumber'
  | 'type'
  | 'name'
  | 'department'
  | 'status'
  | 'location'
  | 'manufacturer'
  | 'model'
  | 'serialNumber'
  | 'purchaseDate'
  | 'warrantyExpiry'
  | 'budget'
  | 'comment'
  | 'supplier'
  | 'project'
  | 'user';

export interface ColumnPref {
  key: EquipmentColumnKey;
  visible: boolean;
}

const STORAGE_KEY = 'equipment_columns_v1';

export function getDefaultColumnPrefs(): ColumnPref[] {
  // По умолчанию показываем ключевые 7 колонок, остальные доступны в настройках
  const defaults: ColumnPref[] = [
    { key: 'invNumber', visible: true },
    { key: 'type', visible: true },
    { key: 'name', visible: true },
    { key: 'department', visible: true },

    { key: 'status', visible: true },
    { key: 'location', visible: true },
    { key: 'manufacturer', visible: false },
    { key: 'model', visible: false },
    { key: 'serialNumber', visible: false },
    { key: 'purchaseDate', visible: false },
    { key: 'warrantyExpiry', visible: false },
    { key: 'budget', visible: false },
    { key: 'comment', visible: false },
    { key: 'supplier', visible: false },
    { key: 'project', visible: false },
    { key: 'user', visible: false },
  ];
  return defaults;
}

export function getColumnPrefs(): ColumnPref[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultColumnPrefs();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as ColumnPref[];
  } catch {}
  return getDefaultColumnPrefs();
}

export function saveColumnPrefs(prefs: ColumnPref[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {}
}


