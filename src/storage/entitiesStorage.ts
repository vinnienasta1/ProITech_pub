import { createLocalStorage } from './createStorage';

export interface EquipmentType { id: number; name: string; description: string; color: string; }
export interface Department { id: number; name: string; code: string; manager: string; }
export interface Supplier { id: number; name: string; contact: string; phone: string; email: string; }
export interface Project { id: number; name: string; code: string; status: 'active' | 'completed' | 'on-hold'; }
export interface Location { id: number; name: string; parent?: string; fullPath: string; description: string; }
export interface Shelf { id: number; name: string; }
export interface User { id: number; name: string; email: string; department: string; position: string; }

const defaults = {
  types: [
    { id: 1, name: 'Компьютеры', description: 'Персональные компьютеры и ноутбуки', color: '#2196f3' },
    { id: 2, name: 'Периферия', description: 'Принтеры, сканеры, клавиатуры', color: '#ff9800' },
    { id: 3, name: 'Мониторы', description: 'Мониторы и дисплеи', color: '#4caf50' },
    { id: 4, name: 'Сетевое оборудование', description: 'Свитчи, роутеры', color: '#9c27b0' },
    { id: 5, name: 'Серверы', description: 'Серверное оборудование', color: '#f44336' },
  ] as EquipmentType[],
  departments: [
    { id: 1, name: 'IT отдел', code: 'IT', manager: 'Иванов И.И.' },
    { id: 2, name: 'Отдел продаж', code: 'SALES', manager: 'Петров П.П.' },
    { id: 3, name: 'Бухгалтерия', code: 'ACC', manager: 'Сидорова С.С.' },
    { id: 4, name: 'HR отдел', code: 'HR', manager: 'Козлова К.К.' },
    { id: 5, name: 'Руководство', code: 'MGMT', manager: 'Директор' },
  ] as Department[],
  suppliers: [
    { id: 1, name: 'ООО "ТехСнаб"', contact: 'Иванов А.А.', phone: '+7 (999) 123-45-67', email: 'info@technosnab.ru' },
    { id: 2, name: 'ИП Иванов', contact: 'Петров Б.Б.', phone: '+7 (999) 234-56-78', email: 'sales@ip-ivanov.ru' },
    { id: 3, name: 'ЗАО "КомпьютерМир"', contact: 'Сидоров В.В.', phone: '+7 (999) 345-67-89', email: 'contact@computermir.ru' },
    { id: 4, name: 'ООО "IT-Сервис"', contact: 'Козлов Г.Г.', phone: '+7 (999) 456-78-90', email: 'info@it-service.ru' },
  ] as Supplier[],
  projects: [
    { id: 1, name: 'Проект А', code: 'PROJ-A', status: 'active' },
    { id: 2, name: 'Проект Б', code: 'PROJ-B', status: 'active' },
    { id: 3, name: 'Проект В', code: 'PROJ-C', status: 'completed' },
    { id: 4, name: 'Внутренний', code: 'INTERNAL', status: 'active' },
  ] as Project[],
  locations: [
    { id: 1, name: 'Склад', parent: 'Офис ПРМ', fullPath: 'Офис ПРМ - Склад', description: 'Складское помещение' },
    { id: 2, name: 'Кабинет', parent: 'Офис ПРМ', fullPath: 'Офис ПРМ - Кабинет', description: 'Рабочие кабинеты' },
    { id: 3, name: 'Серверная', parent: 'Офис ПРМ', fullPath: 'Офис ПРМ - Серверная', description: 'Серверное помещение' },
    { id: 4, name: 'Кабинет руководства', parent: 'Офис МСК', fullPath: 'Офис МСК - Кабинет руководства', description: 'Кабинет руководителя' },
    { id: 5, name: 'Конференц-зал', parent: 'Офис МСК', fullPath: 'Офис МСК - Конференц-зал', description: 'Переговорная комната' },
    { id: 6, name: 'IT отдел', parent: 'Офис СПБ', fullPath: 'Офис СПБ - IT отдел', description: 'Отдел информационных технологий' },
  ] as Location[],
  shelves: [
    { id: 1, name: 'A1' },
    { id: 2, name: 'A2' },
    { id: 3, name: 'A3' },
    { id: 4, name: 'B1' },
    { id: 5, name: 'B2' },
    { id: 6, name: 'B3' },
    { id: 7, name: 'C1' },
    { id: 8, name: 'C2' },
    { id: 9, name: 'C3' },
  ] as Shelf[],
  users: [
    { id: 1, name: 'Иванов Иван Иванович', email: 'ivanov@company.ru', department: 'IT отдел', position: 'Системный администратор' },
    { id: 2, name: 'Петров Петр Петрович', email: 'petrov@company.ru', department: 'IT отдел', position: 'Программист' },
    { id: 3, name: 'Сидорова Анна Сергеевна', email: 'sidorova@company.ru', department: 'Отдел продаж', position: 'Менеджер' },
    { id: 4, name: 'Козлов Дмитрий Александрович', email: 'kozlov@company.ru', department: 'Бухгалтерия', position: 'Бухгалтер' },
    { id: 5, name: 'Смирнова Елена Владимировна', email: 'smirnova@company.ru', department: 'HR отдел', position: 'HR менеджер' },
    { id: 6, name: 'Соколов Александр Петрович', email: 'sokolov@company.ru', department: 'Руководство', position: 'Генеральный директор' },
  ] as User[],
};

type EntitiesState = typeof defaults;

const store = createLocalStorage<EntitiesState>('inventory_entities_v2', defaults);

export function getEntities(): EntitiesState { return store.get(); }
export function saveEntities(next: EntitiesState): void { store.set(next); }
