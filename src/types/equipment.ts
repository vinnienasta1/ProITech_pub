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
  warrantyDate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type EquipmentType = string;
