/**
 * 🚨 ВАЖНО: ЛОГИКА ИНВЕНТАРИЗАЦИИ - НЕ ИЗМЕНЯТЬ БЕЗ ТЩАТЕЛЬНОГО ТЕСТИРОВАНИЯ!
 * 
 * КРИТИЧЕСКИЕ ПРИНЦИПЫ РАБОТЫ:
 * 1. При повторном вводе поискового запроса ВСЕГДА показывается диалог выбора
 * 2. Дубликат определяется ТОЛЬКО по инвентарному номеру уже выбранного оборудования
 * 3. Буфер ВСЕГДА сохраняется в localStorage при любых изменениях
 * 4. Массовые операции обновляют И буфер, И основное хранилище equipmentStorage
 * 
 * ТЕСТИРОВАНИЕ ПРИ ИЗМЕНЕНИЯХ:
 * - Проверить повторный ввод поискового запроса
 * - Проверить добавление дубликатов
 * - Проверить сохранение буфера при смене страницы
 * - Проверить работу массовых операций
 * 
 * КРИТИЧЕСКИЕ ФУНКЦИИ (НЕ ИЗМЕНЯТЬ БЕЗ ТЕСТИРОВАНИЯ):
 * - addSerial: логика добавления и определения дубликатов
 * - handleSelectEquipment: логика выбора оборудования из диалога
 * - handleBulkOperation: логика массовых операций
 * - searchEquipmentByNumbers: логика поиска оборудования
 * - useEffect для сохранения/загрузки буфера
 * 
 * ПРИ ИЗМЕНЕНИИ ЛЮБОЙ ИЗ ЭТИХ ФУНКЦИЙ ОБЯЗАТЕЛЬНО:
 * 1. Протестировать все сценарии работы
 * 2. Проверить сохранение буфера
 * 3. Проверить работу дубликатов
 * 4. Проверить массовые операции
 * 5. Обновить этот комментарий
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  IconButton, 
  Chip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Checkbox,
  ListItemIcon,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
  Clear as ClearIcon,
  FileDownload as ExportIcon,
  Settings as ActionsIcon,
  ViewColumn as ViewColumnIcon,
} from '@mui/icons-material';
import { getEquipment } from '../storage/equipmentStorage';
import { getEntities } from '../storage/entitiesStorage';
import { getStatuses } from '../storage/statusStorage';
import { getInventoryBuffer, clearInventoryBuffer, saveInventoryBuffer } from '../storage/inventoryBufferStorage';
import BulkOperations from '../components/BulkOperations';
import { useActionLog } from '../contexts/ActionLogContext';

interface FoundItem {
  id: string;
  inventoryNumber: string;
  name: string;
  type: string;
  department: string;
  status: string;
  location?: string;
  user?: string;
  comment?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  purchaseDate?: string;
  cost?: number;
  warrantyMonths?: number;
  supplier?: string;
  project?: string;
  invoiceNumber?: string;
  contractNumber?: string;
  rack?: string;
}

interface BufferRow {
  id: string;
  serial: string;
  status: 'found' | 'not_found' | 'duplicate';
  item?: FoundItem;
}

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const { addAction, registerUndoHandler, unregisterUndoHandler } = useActionLog();
  
  const [inputValue, setInputValue] = useState('');
  const [rows, setRows] = useState<BufferRow[]>([]);
  const [bulkOperationsOpen, setBulkOperationsOpen] = useState(false);
  const [columnsDialogOpen, setColumnsDialogOpen] = useState(false);
  const [selectionDialog, setSelectionDialog] = useState<{
    open: boolean;
    items: FoundItem[];
    searchTerm: string;
  }>({
    open: false,
    items: [],
    searchTerm: '',
  });
  
  // Настройки отображения колонок
  const [visibleColumns, setVisibleColumns] = useState(() => {
    const saved = localStorage.getItem('inventory_visible_columns');
    return saved ? JSON.parse(saved) : {
      inventoryNumber: true,
      department: true,
      name: true,
      status: true,
      location: true,
      user: true,
      type: true,
      manufacturer: true,
      model: true,
      serialNumber: true,
      comment: true
    };
  });
  
  // Порядок колонок для Drag and Drop
  const [columnOrder, setColumnOrder] = useState(() => {
    const saved = localStorage.getItem('inventory_column_order');
    return saved ? JSON.parse(saved) : [
      'inventoryNumber',
      'department', 
      'name',
      'status',
      'location',
      'user',
      'type',
      'manufacturer',
      'model',
      'serialNumber',
      'comment'
    ];
  });
  
  // Состояние для Drag and Drop
  const [isDragging, setIsDragging] = useState(false);
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);

  // Состояние для принудительного обновления цветов статусов
  const [statusColorsKey, setStatusColorsKey] = useState(0);

  // Функции для Drag and Drop
  const handleDragStart = (e: React.DragEvent, columnKey: string) => {
    setIsDragging(true);
    setDraggedColumn(columnKey);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumn: string) => {
    e.preventDefault();
    if (draggedColumn && draggedColumn !== targetColumn) {
      const newOrder = [...columnOrder];
      const draggedIndex = newOrder.indexOf(draggedColumn);
      const targetIndex = newOrder.indexOf(targetColumn);
      
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedColumn);
      
      setColumnOrder(newOrder);
      localStorage.setItem('inventory_column_order', JSON.stringify(newOrder));
    }
    setIsDragging(false);
    setDraggedColumn(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedColumn(null);
  };

  // Функция для изменения видимости колонок с сохранением
  const handleColumnVisibilityChange = (key: string, value: boolean) => {
    const newVisibleColumns = { ...visibleColumns, [key]: value };
    setVisibleColumns(newVisibleColumns);
    localStorage.setItem('inventory_visible_columns', JSON.stringify(newVisibleColumns));
  };

  // Получаем видимые колонки в правильном порядке
  const orderedVisibleColumns = columnOrder.filter((key: string) => visibleColumns[key as keyof typeof visibleColumns]);

  const equipment = getEquipment();
  const entities = getEntities();
  const statuses = getStatuses();

  // Функция для получения цвета статуса в формате MUI
  const getStatusColor = useCallback((status: string) => {
    const statusInfo = statuses.find((s: any) => s.name === status);
    if (statusInfo) {
      // Преобразуем hex цвет в MUI цвет
      const color = statusInfo.color;
      if (color === '#4caf50') return 'success';
      if (color === '#ff9800') return 'warning';
      if (color === '#f44336') return 'error';
      if (color === '#2196f3') return 'info';
      if (color === '#9c27b0') return 'secondary';
    }
    return 'default';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statuses, statusColorsKey]); // Добавляем зависимость от statusColorsKey

  // useEffect для принудительного обновления цветов статусов
  useEffect(() => {
    const checkStatusUpdates = () => {
      setStatusColorsKey(prev => prev + 1);
    };

    // Проверяем обновления каждые 5 секунд
    const interval = setInterval(checkStatusUpdates, 5000);

    return () => clearInterval(interval);
  }, []);

  /**
   * 🚨 КРИТИЧЕСКИЙ useEffect: Загрузка буфера
   * 
   * ПРИНЦИП РАБОТЫ:
   * 1. Загружает сохраненный буфер из localStorage при монтировании
   * 2. Восстанавливает состояние между сессиями
   * 3. НЕ ИЗМЕНЯТЬ логику загрузки!
   */
  useEffect(() => {
    const bufferData = getInventoryBuffer();
    if (bufferData.length > 0) {
      setRows(bufferData);
    }
  }, []);

  /**
   * 🚨 КРИТИЧЕСКИЙ useEffect: Сохранение буфера
   * 
   * ПРИНЦИП РАБОТЫ:
   * 1. ВСЕГДА сохраняет весь буфер в localStorage при любых изменениях
   * 2. Обеспечивает персистентность данных между сессиями
   * 3. НЕ ИЗМЕНЯТЬ логику сохранения!
   */
  useEffect(() => {
    if (rows.length > 0) {
      // Сохраняем все строки в localStorage
      saveInventoryBuffer(rows);
    }
  }, [rows]);

  /**
   * 🚨 КРИТИЧЕСКАЯ ФУНКЦИЯ: searchEquipmentByNumbers
   * 
   * ПРИНЦИП РАБОТЫ:
   * 1. Ищет по инвентарному номеру и серийному номеру
   * 2. Нормализует поиск (убирает ведущие нули)
   * 3. Возвращает все совпадения для показа в диалоге выбора
   * 
   * НЕ ИЗМЕНЯТЬ ЛОГИКУ ПОИСКА БЕЗ ПОЛНОГО ТЕСТИРОВАНИЯ!
   */
  const searchEquipmentByNumbers = useCallback((searchTerm: string): FoundItem[] => {
    if (!searchTerm.trim()) return [];

    const normalizedSearch = searchTerm.replace(/^0+/, '');
    const results: FoundItem[] = [];

    equipment.forEach(item => {
      const normalizedInventory = item.inventoryNumber.replace(/^0+/, '');
      const normalizedSerial = (item.serialNumber || '').replace(/^0+/, '');

      if (
        normalizedInventory.includes(normalizedSearch) ||
        normalizedSerial.includes(normalizedSearch)
      ) {
        results.push({
          id: item.id,
          inventoryNumber: item.inventoryNumber,
          name: item.name,
          type: item.type,
          department: item.department,
          status: item.status,
          location: item.location,
          user: item.user,
          comment: item.comment,
          serialNumber: item.serialNumber,
        });
      }
    });

    return results;
  }, [equipment]);

  /**
   * 🚨 КРИТИЧЕСКАЯ ФУНКЦИЯ: addSerial
   * 
   * ПРИНЦИП РАБОТЫ:
   * 1. При множественных совпадениях ВСЕГДА показывается диалог выбора
   * 2. При одном совпадении проверяется дубликат по инвентарному номеру
   * 3. Дубликат добавляется только при повторном выборе того же оборудования
   * 
   * НЕ ИЗМЕНЯТЬ ЛОГИКУ БЕЗ ПОЛНОГО ТЕСТИРОВАНИЯ!
   */
  const addSerial = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;

    const found = searchEquipmentByNumbers(searchTerm);

    if (found.length === 0) {
      // Не найдено
      const newRow: BufferRow = {
        id: Date.now().toString(),
        serial: searchTerm,
        status: 'not_found',
      };
      setRows(prev => [...prev, newRow]);
      setInputValue('');
    } else if (found.length === 1) {
      // Найдено одно совпадение
      const item = found[0];
      
      // Проверяем, не является ли это дубликатом уже выбранного оборудования
      const isDuplicate = rows.some(row => 
        row.item && row.item.inventoryNumber === item.inventoryNumber
      );

      if (isDuplicate) {
        // Это дубликат - добавляем как дубликат
        const newRow: BufferRow = {
          id: Date.now().toString(),
          serial: searchTerm,
          status: 'duplicate',
          item: item,
        };
        setRows(prev => [...prev, newRow]);
        setInputValue('');
      } else {
        // Это новое оборудование
        const newRow: BufferRow = {
          id: Date.now().toString(),
          serial: searchTerm,
          status: 'found',
          item: item,
        };
        setRows(prev => [...prev, newRow]);
        setInputValue('');

        // Добавляем действие в лог
        addAction({
          type: 'import',
          description: `Добавлено в инвентаризацию: ${item.name} (${item.inventoryNumber})`,
          entityType: 'Инвентаризация',
          entityId: item.inventoryNumber,
          oldData: null,
          newData: item,
          canUndo: true,
        });
      }
      } else {
      // Найдено несколько совпадений - всегда показываем диалог выбора
      setSelectionDialog({
        open: true,
        items: found,
        searchTerm: searchTerm,
      });
    }
  }, [searchEquipmentByNumbers, rows, addAction]);

  /**
   * 🚨 КРИТИЧЕСКАЯ ФУНКЦИЯ: handleSelectEquipment
   * 
   * ПРИНЦИП РАБОТЫ:
   * 1. Проверяет дубликат по инвентарному номеру в текущем буфере
   * 2. При дубликате добавляет как 'duplicate', иначе как 'found'
   * 3. Логирует действие только для новых элементов
   * 
   * НЕ ИЗМЕНЯТЬ ЛОГИКУ БЕЗ ПОЛНОГО ТЕСТИРОВАНИЯ!
   */
  const handleSelectEquipment = useCallback((selectedItem: FoundItem, searchTerm: string) => {
    // Проверяем, не является ли это дубликатом уже выбранного оборудования
    const isDuplicate = rows.some(row => 
      row.item && row.item.inventoryNumber === selectedItem.inventoryNumber
    );

    if (isDuplicate) {
      // Это дубликат - добавляем как дубликат
      const newRow: BufferRow = {
        id: Date.now().toString(),
        serial: searchTerm,
        status: 'duplicate',
        item: selectedItem,
      };
      setRows(prev => [...prev, newRow]);
    } else {
      // Это новое оборудование
      const newRow: BufferRow = {
        id: Date.now().toString(),
        serial: searchTerm,
        status: 'found',
        item: selectedItem,
      };
      setRows(prev => [...prev, newRow]);

      // Добавляем действие в лог только для новых элементов
      addAction({
        type: 'import',
        description: `Добавлено в инвентаризацию: ${selectedItem.name} (${selectedItem.inventoryNumber})`,
        entityType: 'Инвентаризация',
        entityId: selectedItem.inventoryNumber,
        oldData: null,
        newData: selectedItem,
        canUndo: true,
      });
    }

    setSelectionDialog({ open: false, items: [], searchTerm: '' });
    setInputValue('');
  }, [rows, addAction]);

  const removeRow = useCallback((id: string) => {
    const rowToRemove = rows.find(row => row.id === id);
    if (rowToRemove && rowToRemove.item) {
      // Добавляем действие в лог
      addAction({
        type: 'delete',
        description: `Удалено из инвентаризации: ${rowToRemove.item.name} (${rowToRemove.item.inventoryNumber})`,
        entityType: 'Инвентаризация',
        entityId: rowToRemove.item.inventoryNumber,
        oldData: rowToRemove.item,
        newData: null,
        canUndo: true,
      });
    }

    setRows(prev => prev.filter(row => row.id !== id));
  }, [rows, addAction]);

  const clearBufferData = useCallback(() => {
    // Добавляем действие в лог для всех удаляемых элементов
    rows.forEach(row => {
      if (row.item) {
        addAction({
          type: 'delete',
          description: `Очищен буфер инвентаризации: ${row.item.name} (${row.item.inventoryNumber})`,
          entityType: 'Инвентаризация',
          entityId: row.item.inventoryNumber,
          oldData: row.item,
          newData: null,
          canUndo: true,
        });
      }
    });

    setRows([]);
    clearInventoryBuffer();
  }, [rows, addAction]);

  const removeNonGreenData = useCallback(() => {
    const rowsToRemove = rows.filter(row => row.status !== 'found');
    
    // Добавляем действия в лог для удаляемых элементов
    rowsToRemove.forEach(row => {
      if (row.item) {
        addAction({
          type: 'delete',
          description: `Удалено из инвентаризации (не найдено): ${row.item.name} (${row.item.inventoryNumber})`,
          entityType: 'Инвентаризация',
          entityId: row.item.inventoryNumber,
          oldData: row.item,
          newData: null,
          canUndo: true,
        });
      }
    });

    setRows(prev => prev.filter(row => row.status === 'found'));
  }, [rows, addAction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSerial(inputValue);
  };

  const doExport = useCallback(() => {
    const data = rows
      .filter(row => row.item)
      .map(row => ({
        'Инвентарный номер': row.item!.inventoryNumber,
        'Наименование': row.item!.name,
        'Тип': row.item!.type,
        'Департамент': row.item!.department,
        'Статус': row.item!.status,
        'Местоположение': row.item!.location || '',
        'Пользователь': row.item!.user || '',
        'Комментарий': row.item!.comment || '',
      }));

    if (data.length === 0) {
      alert('Нет данных для экспорта');
      return;
    }

    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `inventory_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Добавляем действие в лог
    addAction({
      type: 'export',
      description: `Экспортирована инвентаризация (${data.length} позиций)`,
      entityType: 'Инвентаризация',
      entityId: 'bulk_export',
      oldData: null,
      newData: { count: data.length },
      canUndo: false,
    });
  }, [rows, addAction]);

  const getFoundEquipment = useCallback(() => {
    return rows
      .filter(row => row.item && row.status === 'found') // Only include 'found' items
      .map(row => ({
        id: row.item!.id,
        inventoryNumber: row.item!.inventoryNumber,
        name: row.item!.name,
        type: row.item!.type,
        department: row.item!.department,
        status: row.item!.status,
        location: row.item!.location,
        user: row.item!.user,
        comment: row.item!.comment,
        serialNumber: row.item!.serialNumber,
        manufacturer: row.item!.manufacturer,
        model: row.item!.model,
        purchaseDate: row.item!.purchaseDate,
        cost: row.item!.cost,
        warrantyMonths: row.item!.warrantyMonths,
        supplier: row.item!.supplier,
        project: row.item!.project,
        invoiceNumber: row.item!.invoiceNumber,
        contractNumber: row.item!.contractNumber,
        rack: row.item!.rack,
      }));
  }, [rows]);

  const getAvailableOptions = useCallback(() => ({
    statuses: statuses.map((s: any) => s.name),
    locations: entities.locations?.map((l: any) => l.fullPath) || [],
    types: entities.types?.map((t: any) => t.name) || [],
    users: entities.users?.map((u: any) => u.name) || [],
  }), [statuses, entities]);

  /**
   * 🚨 КРИТИЧЕСКАЯ ФУНКЦИЯ: handleBulkOperation
   * 
   * ПРИНЦИП РАБОТЫ:
   * 1. Обновляет оборудование в equipmentStorage (основное хранилище)
   * 2. Обновляет оборудование в буфере (отображение)
   * 3. Логирует действие и показывает уведомление
   * 4. Обрабатывает ошибки с уведомлениями
   * 
   * НЕ ИЗМЕНЯТЬ ЛОГИКУ БЕЗ ПОЛНОГО ТЕСТИРОВАНИЯ!
   */
  const handleBulkOperation = useCallback(async (operation: any) => {
    const foundEquipment = getFoundEquipment();

    if (foundEquipment.length === 0) {
      alert('Нет оборудования для массовых операций');
      return;
    }

    const updates: any = {};

    if (operation.type === 'status' && operation.value) {
      updates.status = operation.value;
    } else if (operation.type === 'location' && operation.value) {
      updates.location = operation.value;
    } else if (operation.type === 'comment' && operation.value) {
      updates.comment = operation.value;
    } else if (operation.type === 'assign' && operation.value) {
      updates.user = operation.value;
    } else if (operation.type === 'department' && operation.value) {
      updates.department = operation.value;
    } else if (operation.type === 'type' && operation.value) {
      updates.type = operation.value;
    } else if (operation.type === 'manufacturer' && operation.value) {
      updates.manufacturer = operation.value;
    } else if (operation.type === 'model' && operation.value) {
      updates.model = operation.value;
    } else if (operation.type === 'supplier' && operation.value) {
      updates.supplier = operation.value;
    } else if (operation.type === 'project' && operation.value) {
      updates.project = operation.value;
    } else if (operation.type === 'rack' && operation.value) {
      updates.rack = operation.value;
    } else if (operation.type === 'clear' && operation.value) {
      const fieldsToClear = JSON.parse(operation.value);
      fieldsToClear.forEach((field: string) => {
        updates[field] = '';
      });
    }

    try {
      // Обновляем оборудование в equipmentStorage
      const { updateEquipmentByInventoryNumber } = require('../storage/equipmentStorage');
      
      foundEquipment.forEach(equipment => {
        updateEquipmentByInventoryNumber(equipment.inventoryNumber, updates);
      });

      // Обновляем оборудование в буфере
      const updatedRows = rows.map(row => {
        if (row.item) {
          return {
            ...row,
            item: {
              ...row.item,
              ...updates,
            },
          };
        }
        return row;
      });

      setRows(updatedRows);

      // Добавляем действие в лог
      addAction({
        type: 'bulk',
        description: `Массовое изменение: ${operation.type} для ${foundEquipment.length} позиций`,
        entityType: 'Инвентаризация',
        entityId: 'bulk_operation',
        oldData: { count: foundEquipment.length, operation: 'bulk_update' },
        newData: { count: foundEquipment.length, operation: 'bulk_update', updates },
        canUndo: true,
      });

      // Показываем уведомление
      if (window.notificationSystem) {
        window.notificationSystem.addNotification({
          type: 'success',
          title: 'Массовое изменение',
          message: `Обновлено ${foundEquipment.length} позиций`,
        });
      }

      setBulkOperationsOpen(false);
    } catch (error) {
      console.error('Ошибка при массовом изменении:', error);
      
      if (window.notificationSystem) {
        window.notificationSystem.addNotification({
          type: 'error',
          title: 'Ошибка',
          message: 'Не удалось применить массовые изменения',
        });
      }
    }
  }, [rows, getFoundEquipment, addAction]);

  const showBarcode = useCallback((inventoryNumber: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Штрих-код</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              text-align: center;
            }
            .barcode-container {
              margin: 20px 0;
            }
            .inventory-number {
              font-size: 18px;
              font-weight: bold;
              margin-top: 10px;
            }
            .print-button {
              background: #007bff;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              margin: 20px;
            }
            .print-button:hover {
              background: #0056b3;
            }
          </style>
        </head>
        <body>
          <h2>Штрих-код</h2>
          <div class="barcode-container">
            <svg id="barcode"></svg>
          </div>
          <div class="inventory-number">${inventoryNumber}</div>
          <button class="print-button" onclick="window.print()">Печать</button>
          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            JsBarcode("#barcode", "${inventoryNumber}", {
              format: "CODE128",
              width: 2,
              height: 60,
              displayValue: false,
              margin: 10
            });
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  }, []);

  // useEffect для регистрации функций отмены в ActionLogContext
  useEffect(() => {
    // Регистрируем обработчик отмены для инвентаризации
    registerUndoHandler('Инвентаризация', (action: any) => {
      try {
        switch (action.type) {
          case 'import':
            // Отмена импорта - удаляем элемент из буфера
            if (action.newData && action.newData.inventoryNumber) {
              setRows(prev => prev.filter(row => 
                !row.item || row.item.inventoryNumber !== action.newData.inventoryNumber
              ));
              return true; // Успешно отменено
            }
            break;
            
          case 'delete':
            // Отмена удаления - восстанавливаем элемент в буфере
            if (action.oldData) {
              const newRow: BufferRow = {
                id: Date.now().toString(),
                serial: action.oldData.inventoryNumber,
                status: 'found',
                item: action.oldData,
              };
              setRows(prev => [...prev, newRow]);
              return true; // Успешно отменено
            }
            break;
        }
        return false; // Не удалось отменить
      } catch (error) {
        console.error('Ошибка при отмене действия инвентаризации:', error);
        return false;
      }
    });

    // Отменяем регистрацию при размонтировании
    return () => {
      unregisterUndoHandler('Инвентаризация');
    };
  }, [registerUndoHandler, unregisterUndoHandler]);

  return (
    <Box sx={{ p: 3, minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Улучшенная форма ввода */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05), rgba(66, 165, 245, 0.05))',
          border: '1px solid',
          borderColor: 'divider',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            Добавить оборудование
      </Typography>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <TextField
              fullWidth
              placeholder="Введите инв. номер или серийный номер"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              size="medium"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    }
                  },
                  '&.Mui-focused': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                      borderWidth: 2
                    }
                  }
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              startIcon={<AddIcon />}
              size="large"
              sx={{
                borderRadius: 2,
                px: 4,
                py: 1.5,
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                boxShadow: '0 4px 15px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1565c0, #1976d2)',
                  boxShadow: '0 6px 20px rgba(25, 118, 210, 0.4)',
                  transform: 'translateY(-1px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Добавить
            </Button>
          </form>
        </Box>
      </Paper>

      {/* Буфер инвентаризации */}
      <Paper 
        elevation={2}
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {/* Заголовок буфера */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid', 
          borderColor: 'divider',
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.08), rgba(66, 165, 245, 0.08))'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Буфер инвентаризации
                </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<ViewColumnIcon />}
                onClick={() => setColumnsDialogOpen(true)}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Колонки
              </Button>
              <Button
                variant="outlined"
                startIcon={<ActionsIcon />}
                onClick={() => setBulkOperationsOpen(true)}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Действия
              </Button>

              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={doExport}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Экспорт
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={removeNonGreenData}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Убрать не найденные
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<ClearIcon />}
                onClick={clearBufferData}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Очистить буфер
              </Button>
            </Box>
          </Box>
          
          {/* Статистика */}
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 16, 
                height: 16, 
                borderRadius: '3px 0 0 3px',
                background: 'linear-gradient(180deg, #4caf50 0%, rgba(76, 175, 80, 0.3) 100%)',
                border: '1px solid #4caf50'
              }} />
                  <Typography variant="body2" color="text.secondary">
                Найдено: {rows.filter(r => r.status === 'found').length}
                  </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 16, 
                height: 16, 
                borderRadius: '3px 0 0 3px',
                background: 'linear-gradient(180deg, #9e9e9e 0%, rgba(158, 158, 158, 0.3) 100%)',
                border: '1px solid #9e9e9e'
              }} />
              <Typography variant="body2" color="text.secondary">
                Дубликаты: {rows.filter(r => r.status === 'duplicate').length}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ 
                width: 16, 
                height: 16, 
                borderRadius: '3px 0 0 3px',
                background: 'linear-gradient(180deg, #f44336 0%, rgba(244, 67, 54, 0.3) 100%)',
                border: '1px solid #f44336'
              }} />
              <Typography variant="body2" color="text.secondary">
                Не найдено: {rows.filter(r => r.status === 'not_found').length}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                Всего: {rows.length}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Список элементов */}
        <Box sx={{ p: 2 }}>
          {rows.length === 0 ? (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              color: 'text.secondary'
            }}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Буфер пуст
              </Typography>
              <Typography variant="body2">
                Добавьте оборудование для начала инвентаризации
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    {orderedVisibleColumns.map((key: string, index: number) => (
                      <TableCell
                        key={key}
                        sx={{ 
                          fontWeight: 600
                        }}
                      >
                        {key === 'inventoryNumber' ? 'Инв. номер' :
                         key === 'department' ? 'Департамент' :
                         key === 'name' ? 'Название' :
                         key === 'status' ? 'Статус' :
                         key === 'location' ? 'Местоположение' :
                         key === 'user' ? 'Пользователь' :
                         key === 'type' ? 'Тип' :
                         key === 'manufacturer' ? 'Производитель' :
                         key === 'model' ? 'Модель' :
                         key === 'serialNumber' ? 'Серийный номер' :
                         key === 'comment' ? 'Комментарий' : key}
                      </TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 600 }}>Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow 
                      key={row.id} 
                      hover
                      sx={{
                        backgroundColor: row.status === 'found' 
                          ? 'rgba(76, 175, 80, 0.25)' // Более насыщенный зеленый для найденных
                          : row.status === 'duplicate' 
                            ? 'rgba(158, 158, 158, 0.25)' // Более насыщенный серый для дубликатов
                            : 'rgba(244, 67, 54, 0.25)', // Более насыщенный красный для не найденных
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        height: '48px',
                        '&:hover': {
                          backgroundColor: row.status === 'found' 
                            ? 'rgba(76, 175, 80, 0.35)' // Еще темнее при наведении
                            : row.status === 'duplicate' 
                              ? 'rgba(158, 158, 158, 0.35)'
                              : 'rgba(244, 67, 54, 0.35)'
                        },
                        // Левая граница для дополнительного выделения
                        borderLeft: row.status === 'found' 
                          ? '3px solid #4caf50'
                          : row.status === 'duplicate' 
                            ? '3px solid #9e9e9e'
                            : '3px solid #f44336'
                      }}
                    >
                      
                      {/* Динамические колонки */}
                      {orderedVisibleColumns.map((key: string) => (
                        <TableCell key={key} sx={{ py: 1 }}>
                          {key === 'inventoryNumber' && row.item ? (
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                              {row.item.inventoryNumber}
                            </Typography>
                          ) : key === 'inventoryNumber' && !row.item ? (
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                              {row.serial}
                            </Typography>
                          ) : key === 'department' && row.item ? (
                            <Typography variant="body2" color="text.primary">
                              {row.item.department}
                            </Typography>
                          ) : key === 'department' && !row.item ? (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          ) : key === 'name' && row.item ? (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: 'primary.main',
                                cursor: 'pointer',
                      textDecoration: 'underline',
                                fontWeight: 500,
                                '&:hover': { 
                                  color: 'primary.dark',
                                  textDecoration: 'none'
                                }
                              }}
                              onClick={() => navigate(`/equipment/${row.item!.inventoryNumber}`)}
                            >
                              {row.item.name}
                  </Typography>
                          ) : key === 'name' && !row.item ? (
                            <Typography variant="body2" color="text.secondary">Не найдено</Typography>
                          ) : key === 'status' && row.item ? (
                            <Chip
                              label={row.item.status}
                              size="small"
                              color={getStatusColor(row.item.status) as any}
                              sx={{ 
                                fontSize: '0.75rem',
                                height: '20px' // Уменьшаем высоту чипа
                              }}
                            />
                          ) : key === 'status' && !row.item ? (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          ) : key === 'location' && row.item?.location ? (
                            <Typography variant="body2" color="text.primary">
                              {row.item.location}
                            </Typography>
                          ) : key === 'location' && (!row.item || !row.item.location) ? (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          ) : key === 'user' && row.item?.user ? (
                            <Typography variant="body2" color="text.primary">
                              {row.item.user}
                            </Typography>
                          ) : key === 'user' && (!row.item || !row.item.user) ? (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          ) : key === 'type' && row.item?.type ? (
                            <Typography variant="body2" color="text.primary">
                              {row.item.type}
                            </Typography>
                          ) : key === 'type' && (!row.item || !row.item.type) ? (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          ) : key === 'manufacturer' && row.item?.manufacturer ? (
                            <Typography variant="body2" color="text.primary">
                              {row.item.manufacturer}
                            </Typography>
                          ) : key === 'manufacturer' && (!row.item || !row.item.manufacturer) ? (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          ) : key === 'model' && row.item?.model ? (
                            <Typography variant="body2" color="text.primary">
                              {row.item.model}
                            </Typography>
                          ) : key === 'model' && (!row.item || !row.item.model) ? (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          ) : key === 'serialNumber' && row.item?.serialNumber ? (
                            <Typography variant="body2" color="text.primary">
                              {row.item.serialNumber}
                            </Typography>
                          ) : key === 'serialNumber' && (!row.item || !row.item.serialNumber) ? (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          ) : key === 'comment' && row.item?.comment ? (
                            <Typography variant="body2" color="text.primary">
                              {row.item.comment}
                            </Typography>
                          ) : key === 'comment' && (!row.item || !row.item.comment) ? (
                            <Typography variant="body2" color="text.secondary">-</Typography>
                          ) : null}
                        </TableCell>
                      ))}
                      <TableCell sx={{ py: 1 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {row.status === 'found' && row.item && (
                  <IconButton
                    size="small"
                              onClick={() => showBarcode(row.item!.inventoryNumber)}
                              sx={{ 
                                color: 'primary.main',
                                backgroundColor: 'primary.light',
                                '&:hover': { 
                                  backgroundColor: 'primary.main',
                                  color: 'white'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <QrCodeIcon fontSize="small" />
                  </IconButton>
                )}
                <IconButton 
                  size="small"
                            onClick={() => removeRow(row.id)}
                            sx={{ 
                              color: 'error.main',
                              backgroundColor: 'error.light',
                              '&:hover': { 
                                backgroundColor: 'error.main',
                                color: 'white'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
                      </TableCell>
                    </TableRow>
          ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>

      {/* Диалог выбора оборудования */}
      {selectionDialog.open && (
        <Dialog
          open={selectionDialog.open}
          onClose={() => setSelectionDialog({ ...selectionDialog, open: false })}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden'
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
            color: 'white',
            fontWeight: 600
          }}>
            Выберите оборудование для добавления
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <List sx={{ p: 0 }}>
              {selectionDialog.items.map((item) => (
                <ListItem 
                  key={item.id}
                  disablePadding
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'action.hover'
                    }
                  }}
                >
                  <ListItemButton 
                    onClick={() => handleSelectEquipment(item, selectionDialog.searchTerm)}
                    sx={{ px: 3, py: 2 }}
                  >
                    <ListItemText 
                      primary={`${item.inventoryNumber} - ${item.name}`}
                      secondary={`Тип: ${item.type}, Статус: ${item.status}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
        </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button 
              onClick={() => setSelectionDialog({ ...selectionDialog, open: false })}
              variant="contained"
              sx={{ borderRadius: 2, px: 3 }}
            >
              Закрыть
            </Button>
        </DialogActions>
      </Dialog>
      )}

      {/* Массовые операции */}
      <BulkOperations
        open={bulkOperationsOpen}
        onClose={() => setBulkOperationsOpen(false)}
        selectedItems={getFoundEquipment()}
        onBulkOperation={handleBulkOperation}
        availableStatuses={getAvailableOptions().statuses}
        availableLocations={getAvailableOptions().locations}
        availableTypes={getAvailableOptions().types}
        availableUsers={getAvailableOptions().users}
        availableDepartments={entities?.departments?.map((d: any) => d.name) || []}
        availableSuppliers={entities?.suppliers?.map((s: any) => s.name) || []}
        availableProjects={entities?.projects?.map((p: any) => p.name) || []}
        availableShelves={entities?.shelves?.map((s: any) => s.name) || []}
      />

      {/* Диалог настройки колонок */}
      <Dialog
        open={columnsDialogOpen}
        onClose={() => setColumnsDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
          color: 'white',
          fontWeight: 600
        }}>
          Настройка отображения колонок
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List sx={{ p: 0 }}>
            {columnOrder.map((key: string) => (
              <ListItem 
                key={key} 
                disablePadding
                sx={{
                  cursor: 'grab',
                  '&:active': { cursor: 'grabbing' },
                  opacity: isDragging && draggedColumn === key ? 0.5 : 1,
                  transition: 'opacity 0.2s'
                }}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, key)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, key)}
                onDragEnd={handleDragEnd}
              >
                <ListItemButton 
                  onClick={() => handleColumnVisibilityChange(key, !visibleColumns[key as keyof typeof visibleColumns])}
                  sx={{ px: 3, py: 2 }}
                >
                  <ListItemIcon>
                    <Checkbox 
                      edge="start" 
                      checked={visibleColumns[key as keyof typeof visibleColumns]} 
                      tabIndex={-1}
                      disableRipple
                    />
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      key === 'inventoryNumber' ? 'Инвентарный номер' :
                      key === 'department' ? 'Департамент' :
                      key === 'name' ? 'Название' :
                      key === 'status' ? 'Статус' :
                      key === 'location' ? 'Местоположение' :
                      key === 'user' ? 'Пользователь' :
                      key === 'type' ? 'Тип' :
                      key === 'manufacturer' ? 'Производитель' :
                      key === 'model' ? 'Модель' :
                      key === 'serialNumber' ? 'Серийный номер' :
                      key === 'comment' ? 'Комментарий' : key
                    }
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                    <ViewColumnIcon 
                      sx={{ 
                        color: 'text.secondary', 
                        cursor: 'grab',
                        '&:active': { cursor: 'grabbing' }
                      }} 
                    />
                  </Box>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setColumnsDialogOpen(false)}
            variant="contained"
            sx={{ borderRadius: 2, px: 3 }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;


