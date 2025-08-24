import { DashboardButton } from '../components/DashboardConstructor';

const STORAGE_KEY = 'dashboard_config_v1';

// Стандартные кнопки дашборда по умолчанию
export const defaultDashboardButtons: DashboardButton[] = [
  {
    id: 'btn_total',
    title: 'Всего оборудования',
    type: 'navigation',
    icon: 'inventory',
    color: 'primary.main',
    target: '/equipment',
    filters: [],
  },
  {
    id: 'btn_active',
    title: 'Активное',
    type: 'filter',
    icon: 'check',
    color: 'success.main',
    target: '/equipment',
    filters: [
      {
        field: 'status',
        operator: 'equals',
        value: 'Активно',
        operatorBetween: 'AND',
      },
    ],
  },
  {
    id: 'btn_repair',
    title: 'Требует ремонта',
    type: 'filter',
    icon: 'warning',
    color: 'warning.main',
    target: '/equipment',
    filters: [
      {
        field: 'status',
        operator: 'equals',
        value: 'Ремонт',
        operatorBetween: 'AND',
      },
    ],
  },
  {
    id: 'btn_maintenance',
    title: 'На обслуживании',
    type: 'filter',
    icon: 'schedule',
    color: 'info.main',
    target: '/equipment',
    filters: [
      {
        field: 'status',
        operator: 'equals',
        value: 'На обслуживании',
        operatorBetween: 'AND',
      },
    ],
  },
];

export function getDashboardConfig(): DashboardButton[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultDashboardButtons;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as DashboardButton[];
  } catch {}
  return defaultDashboardButtons;
}

export function saveDashboardConfig(buttons: DashboardButton[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(buttons));
  } catch {}
}

export function resetDashboardConfig(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
