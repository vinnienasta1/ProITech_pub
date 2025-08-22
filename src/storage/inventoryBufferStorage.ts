import { createLocalStorage } from './createStorage';

export interface BufferRow {
  id: string;
  serial: string;
  status: 'found' | 'not_found' | 'duplicate';
  item?: any;
}

const store = createLocalStorage<BufferRow[]>('inventory_buffer_v1', []);

export function getInventoryBuffer(): BufferRow[] {
  return store.get();
}

export function addToInventoryBuffer(row: BufferRow): void {
  const current = store.get();
  store.set([...current, row]);
}

export function removeFromInventoryBuffer(id: string): void {
  const current = store.get();
  store.set(current.filter(row => row.id !== id));
}

export function clearInventoryBuffer(): void {
  store.set([]);
}

export function saveInventoryBuffer(rows: BufferRow[]): void {
  store.set(rows);
}


