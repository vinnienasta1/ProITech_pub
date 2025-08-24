/**
 * КРИТИЧЕСКИ ВАЖНАЯ ОБЛАСТЬ: НАСТРОЙКИ СТОЛБЦОВ ОБОРУДОВАНИЯ
 * 
 * ПРИНЦИПЫ РАБОТЫ:
 * 1. EquipmentColumnKey должен точно соответствовать интерфейсу Equipment
 * 2. Все названия столбцов должны быть на русском языке
 * 3. getDefaultColumnPrefs должен содержать все возможные столбцы
 * 4. Ключ localStorage должен быть уникальным для версии
 * 
 * КРИТИЧЕСКИЕ ФУНКЦИИ:
 * - getDefaultColumnPrefs - настройки по умолчанию
 * - getColumnPrefs - получение настроек из localStorage
 * - saveColumnPrefs - сохранение настроек в localStorage
 * 
 * ТРЕБОВАНИЯ К ТЕСТИРОВАНИЮ:
 * 1. Проверить, что все поля Equipment присутствуют в EquipmentColumnKey
 * 2. Проверить, что настройки сохраняются и загружаются корректно
 * 3. Проверить, что при изменении EquipmentColumnKey настройки сбрасываются
 * 
 * ЗАПРЕЩЕНО ИЗМЕНЯТЬ:
 * - EquipmentColumnKey без обновления всех связанных файлов
 * - getDefaultColumnPrefs без тщательного тестирования
 * - Ключ localStorage без веской причины
 */

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
  | 'warrantyMonths'
  | 'cost'
  | 'supplier'
  | 'project'
  | 'user'
  | 'rack'
  | 'comment'
  | 'invoiceNumber'
  | 'contractNumber';

export interface ColumnPref {
  key: EquipmentColumnKey;
  visible: boolean;
}

const STORAGE_KEY = 'equipment_columns_v2';

export function getDefaultColumnPrefs(): ColumnPref[] {
  // По умолчанию показываем ключевые 8 колонок, остальные доступны в настройках
  const defaults: ColumnPref[] = [
    { key: 'invNumber', visible: true },
    { key: 'type', visible: true },
    { key: 'name', visible: true },
    { key: 'department', visible: true },
    { key: 'status', visible: true },
    { key: 'location', visible: true },
    { key: 'manufacturer', visible: true },
    { key: 'model', visible: true },
    { key: 'serialNumber', visible: false },
    { key: 'purchaseDate', visible: false },
    { key: 'warrantyMonths', visible: false },
    { key: 'cost', visible: false },
    { key: 'supplier', visible: false },
    { key: 'project', visible: false },
    { key: 'user', visible: false },
    { key: 'rack', visible: false },
    { key: 'comment', visible: false },
    { key: 'invoiceNumber', visible: false },
    { key: 'contractNumber', visible: false },
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


