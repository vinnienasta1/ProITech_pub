import { createLocalStorage } from './createStorage';

export interface Equipment {
  id: string;
  name: string;
  type: string;
  department: string;
  status: string;
  user: string;
  location: string;
  manufacturer: string;
  model: string;
  inventoryNumber: string;
  serialNumber: string;
  comment: string;
  purchaseDate: string;
  supplier: string;
  invoiceNumber: string;
  contractNumber: string;
  cost: number;
  project: string;
  warrantyMonths: number;
  rack?: string;
  budget?: number;
  description?: string;
  tags?: string[];
  ipAddress?: string;
  macAddress?: string;
  os?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  createdAt: Date;
  updatedAt: Date;
}

const defaultEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Ноутбук Dell Latitude 5520',
    type: 'Компьютеры',
    department: 'IT отдел',
    status: 'Активно',
    user: 'Иванов И.И.',
    location: 'Офис ПРМ - Кабинет',
    manufacturer: 'Dell',
    model: 'Latitude 5520',
    inventoryNumber: 'IT-001',
    serialNumber: 'DL5520-001',
    comment: 'Основной рабочий ноутбук',
    purchaseDate: '2023-01-15',
    supplier: 'ООО "ТехноСервис"',
    invoiceNumber: 'INV-2023-001',
    contractNumber: 'CON-2023-001',
    cost: 85000,
    project: 'Обновление IT парка',
    warrantyMonths: 36,
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2023-01-15'),
  },
  {
    id: '2',
    name: 'Принтер HP LaserJet Pro',
    type: 'Периферия',
    department: 'Отдел продаж',
    status: 'Активно',
    user: 'Петров П.П.',
    location: 'Офис ПРМ - Кабинет',
    manufacturer: 'HP',
    model: 'LaserJet Pro M404n',
    inventoryNumber: 'PR-001',
    serialNumber: 'HP404-002',
    comment: 'Принтер для печати документов',
    purchaseDate: '2022-11-20',
    supplier: 'ООО "КомпьютерМир"',
    invoiceNumber: 'INV-2022-011',
    contractNumber: 'CON-2022-011',
    cost: 25000,
    project: 'Оснащение офиса',
    warrantyMonths: 24,
    createdAt: new Date('2022-11-20'),
    updatedAt: new Date('2022-11-20'),
  },
];

const store = createLocalStorage<Equipment[]>('inventory_equipment_v1', defaultEquipment);

export function getEquipment(): Equipment[] {
  return store.get();
}

export function getEquipmentById(id: string): Equipment | undefined {
  return store.get().find(item => item.id === id);
}

export function addEquipment(equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Equipment {
  const newEquipment: Equipment = {
    ...equipment,
    id: Date.now().toString(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  const currentEquipment = store.get();
  store.set([...currentEquipment, newEquipment]);
  
  return newEquipment;
}

export function updateEquipment(id: string, updates: Partial<Equipment>): Equipment | null {
  const currentEquipment = store.get();
  const index = currentEquipment.findIndex(item => item.id === id);
  
  if (index === -1) return null;
  
  const updatedEquipment: Equipment = {
    ...currentEquipment[index],
    ...updates,
    updatedAt: new Date(),
  };
  
  currentEquipment[index] = updatedEquipment;
  store.set(currentEquipment);
  
  return updatedEquipment;
}

export function deleteEquipment(id: string): boolean {
  const currentEquipment = store.get();
  const filteredEquipment = currentEquipment.filter(item => item.id !== id);
  
  if (filteredEquipment.length === currentEquipment.length) {
    return false; // Элемент не найден
  }
  
  store.set(filteredEquipment);
  return true;
}

export function searchEquipment(query: string): Equipment[] {
  const equipment = store.get();
  const lowerQuery = query.toLowerCase();
  
  return equipment.filter(item => 
    item.name.toLowerCase().includes(lowerQuery) ||
    item.inventoryNumber.toLowerCase().includes(lowerQuery) ||
    item.serialNumber.toLowerCase().includes(lowerQuery) ||
    item.manufacturer.toLowerCase().includes(lowerQuery) ||
    item.model.toLowerCase().includes(lowerQuery) ||
    item.department.toLowerCase().includes(lowerQuery) ||
    item.location.toLowerCase().includes(lowerQuery)
  );
}

export function getEquipmentByStatus(status: string): Equipment[] {
  return store.get().filter(item => item.status === status);
}

export function getEquipmentByDepartment(department: string): Equipment[] {
  return store.get().filter(item => item.department === department);
}

export function getEquipmentByLocation(location: string): Equipment[] {
  return store.get().filter(item => item.location === location);
}
