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
  ] as Department[],
  suppliers: [
    { id: 1, name: 'ООО "ТехноСервис"', contact: 'Иванов А.А.', phone: '+7 (999) 123-45-67', email: 'info@technoservice.ru' },
    { id: 2, name: 'ООО "КомпьютерМир"', contact: 'Петров Б.Б.', phone: '+7 (999) 234-56-78', email: 'sales@computermir.ru' },
    { id: 3, name: 'ООО "Электроника+"', contact: 'Сидоров В.В.', phone: '+7 (999) 345-67-89', email: 'contact@electronics.ru' },
  ] as Supplier[],
  projects: [
    { id: 1, name: 'Оцифровка документов', code: 'DOC-2024', status: 'active' },
    { id: 2, name: 'Обновление серверов', code: 'SRV-2024', status: 'active' },
    { id: 3, name: 'Внедрение CRM', code: 'CRM-2023', status: 'completed' },
    { id: 4, name: 'Модернизация сети', code: 'NET-2024', status: 'on-hold' },
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
    { id: 1, name: 'Склад A / Ряд 1' },
    { id: 2, name: 'Склад A / Ряд 2' },
    { id: 3, name: 'Склад B / Зона 3' },
  ] as Shelf[],
  users: [
    { id: 1, name: 'Иванов Иван Иванович', email: 'ivanov@company.ru', department: 'IT отдел', position: 'Системный администратор' },
    { id: 2, name: 'Петров Петр Петрович', email: 'petrov@company.ru', department: 'IT отдел', position: 'Программист' },
    { id: 3, name: 'Сидорова Анна Сергеевна', email: 'sidorova@company.ru', department: 'Отдел продаж', position: 'Менеджер' },
    { id: 4, name: 'Козлов Дмитрий Александрович', email: 'kozlov@company.ru', department: 'Бухгалтерия', position: 'Бухгалтер' },
    { id: 5, name: 'Смирнова Елена Владимировна', email: 'smirnova@company.ru', department: 'HR отдел', position: 'HR менеджер' },
  ] as User[],
};

type EntitiesState = typeof defaults;

const store = createLocalStorage<EntitiesState>('inventory_entities_v2', defaults);

export function getEntities(): EntitiesState { return store.get(); }
export function saveEntities(next: EntitiesState): void { store.set(next); }
