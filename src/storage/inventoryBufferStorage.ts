import { createLocalStorage } from './createStorage';

export interface BufferRow {
  key: string;
  input: string;
  status: 'search' | 'found' | 'not_found' | 'duplicate';
  display?: string;
  item?: any;
  attrs?: Record<string, string>;
}

const store = createLocalStorage<BufferRow[]>('inventory_buffer_v1', []);

export function getBufferRows(): BufferRow[] {
  return store.get();
}

export function saveBufferRows(rows: BufferRow[]): void {
  store.set(rows);
}


