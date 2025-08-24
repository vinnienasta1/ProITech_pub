export interface StatusItem {
  id: number;
  name: string;
  color: string;
  description: string;
}

const STORAGE_KEY = 'inventory_statuses_v1';

export const defaultStatuses: StatusItem[] = [
  { id: 1, name: 'Активно', color: '#4caf50', description: 'Оборудование в рабочем состоянии' },
  { id: 2, name: 'Ремонт', color: '#ff9800', description: 'Оборудование на ремонте' },
  { id: 3, name: 'Списано', color: '#f44336', description: 'Оборудование списано' },
  { id: 4, name: 'На обслуживании', color: '#2196f3', description: 'Оборудование на обслуживании' },
  { id: 5, name: 'Резерв', color: '#9c27b0', description: 'Резервное оборудование' },
];

export function getStatuses(): StatusItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStatuses;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as StatusItem[];
  } catch {}
  return defaultStatuses;
}

export function saveStatuses(statuses: StatusItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(statuses));
  } catch {}
}

export function updateStatus(oldName: string, newName: string): void {
  try {
    const statuses = getStatuses();
    const statusIndex = statuses.findIndex(s => s.name === oldName);
    
    if (statusIndex !== -1) {
      // Сохраняем цвет и описание старого статуса
      const oldStatus = statuses[statusIndex];
      statuses[statusIndex] = {
        ...oldStatus,
        name: newName
      };
      saveStatuses(statuses);
    }
  } catch {}
}


