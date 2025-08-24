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
  description?: string;
  tags?: string[];
  ipAddress?: string;
  macAddress?: string;
  os?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenanceRecords?: Array<{
    id: string;
    date: string;
    work: string;
    ticketLink: string;
    performedBy: string;
    comment: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export type EquipmentType = string;
