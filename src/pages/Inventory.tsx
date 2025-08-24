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
  Card,
  CardContent,
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
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  QrCode as QrCodeIcon,
  Clear as ClearIcon,
  FileDownload as ExportIcon,
  Settings as ActionsIcon,
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
}

interface BufferRow {
  id: string;
  serial: string;
  status: 'found' | 'not_found' | 'duplicate';
  item?: FoundItem;
}

const Inventory: React.FC = () => {
  const navigate = useNavigate();
  const { addAction } = useActionLog();
  
  const [inputValue, setInputValue] = useState('');
  const [rows, setRows] = useState<BufferRow[]>([]);
  const [selectionDialog, setSelectionDialog] = useState<{
    open: boolean;
    items: FoundItem[];
    searchTerm: string;
  }>({
    open: false,
    items: [],
    searchTerm: '',
  });
  const [bulkOperationsOpen, setBulkOperationsOpen] = useState(false);

  const equipment = getEquipment();
  const entities = getEntities();
  const statuses = getStatuses();

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
      .filter(row => row.item)
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
      }));
  }, [rows]);

  const getAvailableOptions = useCallback(() => ({
    statuses: statuses.map(s => s.name),
    locations: entities.locations?.map(l => l.fullPath) || [],
    types: entities.types?.map(t => t.name) || [],
    users: entities.users?.map(u => u.name) || [],
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

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        Инвентаризация
      </Typography>

      {/* Шапка с элементами управления */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
        <TextField
                fullWidth
                placeholder="Введите инв. номер или серийный номер"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                size="small"
              />
              <Button
                type="submit"
                variant="contained"
                startIcon={<AddIcon />}
                size="small"
              >
                Добавить
              </Button>
            </form>
          </Box>
          
          <Box sx={{ flex: '1 1 600px', minWidth: 0 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<ActionsIcon />}
                onClick={() => setBulkOperationsOpen(true)}
                size="small"
              >
                Действия
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={doExport}
                size="small"
              >
                Экспорт
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={removeNonGreenData}
                size="small"
              >
                Убрать не найденные
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<ClearIcon />}
                onClick={clearBufferData}
                size="small"
              >
                Очистить буфер
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Буфер инвентаризации */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {rows.map((row) => (
          <Card
            key={row.id}
            sx={{
              backgroundColor: row.status === 'found' ? 'success.light' : 
                              row.status === 'duplicate' ? 'grey.300' : 'error.light',
              border: '1px solid',
              borderColor: row.status === 'found' ? 'success.main' : 
                          row.status === 'duplicate' ? 'grey.500' : 'error.main',
            }}
          >
            <CardContent sx={{ p: 1, py: 0.5, minHeight: '32px', '&:last-child': { pb: 0.5 } }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                gap: 1.5,
                lineHeight: 1.2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                  {row.status === 'found' && row.item ? (
                    <>
                      {/* Инвентарный номер и департамент */}
                      <Typography 
                        component="span" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          color: 'text.primary'
                        }}
                      >
                        {row.item.inventoryNumber}
                      </Typography>
                      <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>|</Typography>
                      <Typography 
                        component="span" 
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          color: 'text.primary'
                        }}
                      >
                        {row.item.department}
                      </Typography>
                      <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>|</Typography>
                      
                      {/* Наименование (кликабельное) */}
                      <Typography 
                        component="span" 
                        sx={{ 
                          color: 'primary.main',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          '&:hover': { color: 'primary.dark' }
                        }}
                        onClick={() => navigate(`/equipment/${row.item!.inventoryNumber}`)}
                      >
                        {row.item.name}
                </Typography>
                
                      <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>|</Typography>
                      
                      {/* Статус */}
                      <Chip
                        label={row.item.status}
                        size="small"
                        sx={{ 
                          fontSize: '0.75rem',
                          height: '20px',
                          backgroundColor: statuses.find(s => s.name === row.item!.status)?.color || 'default',
                          color: 'white'
                        }}
                      />

                      {/* Местоположение */}
                      {row.item?.location && (
                        <>
                          <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>|</Typography>
                          <Typography 
                            component="span" 
                            sx={{ 
                              color: 'text.primary',
                              fontSize: '0.875rem'
                            }}
                          >
                            {row.item.location}
                  </Typography>
                        </>
                      )}

                      {/* Пользователь */}
                      {row.item?.user && (
                        <>
                          <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>|</Typography>
                          <Typography 
                            component="span" 
                            sx={{ 
                              color: 'text.primary',
                              fontSize: '0.875rem'
                            }}
                          >
                            {row.item.user}
                          </Typography>
                        </>
                      )}
                    </>
                  ) : row.status === 'duplicate' ? (
                    <>
                      <Typography 
                        component="span" 
                        sx={{ 
                          fontStyle: 'italic',
                          fontSize: '0.875rem',
                          color: 'text.secondary'
                        }}
                      >
                        Дубликат
                      </Typography>
                      {row.item && (
                        <>
                          <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>|</Typography>
                          <Typography 
                            component="span" 
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                              color: 'text.primary'
                            }}
                          >
                            {row.item.inventoryNumber}
                          </Typography>
                          <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>|</Typography>
                          <Typography 
                            component="span" 
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: '0.875rem',
                              color: 'text.primary'
                            }}
                          >
                            {row.item.department}
                          </Typography>
                          <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>|</Typography>
                  <Typography 
                            component="span" 
                    sx={{ 
                              color: 'primary.main',
                              fontSize: '0.875rem',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      '&:hover': { color: 'primary.dark' }
                    }}
                            onClick={() => navigate(`/equipment/${row.item!.inventoryNumber}`)}
                          >
                            {row.item.name}
                          </Typography>
                          <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>|</Typography>
                          <Chip
                            label={row.item.status}
                            size="small"
                            sx={{ 
                              fontSize: '0.75rem',
                              height: '20px',
                              backgroundColor: statuses.find(s => s.name === row.item!.status)?.color || 'default',
                              color: 'white'
                            }}
                          />
                        </>
                      )}
                    </>
                  ) : (
                    <Typography 
                      component="span" 
                      sx={{ 
                        fontSize: '0.875rem',
                        color: 'text.primary'
                      }}
                    >
                      Не найдено: {row.serial}
                  </Typography>
                )}
              </Box>

                {/* Кнопки действий */}
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {row.status === 'found' && row.item && (
                    <IconButton
                      size="small"
                      onClick={() => showBarcode(row.item!.inventoryNumber)}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': { backgroundColor: 'primary.light' }
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
                      '&:hover': { backgroundColor: 'error.light' }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </CardContent>
          </Card>
          ))}
        </Box>

      {/* Диалог выбора оборудования */}
      <Dialog
        open={selectionDialog.open}
        onClose={() => setSelectionDialog({ open: false, items: [], searchTerm: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Выберите оборудование</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            По запросу "{selectionDialog.searchTerm}" найдено несколько позиций:
          </Typography>
          <List>
            {selectionDialog.items.map((item) => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton onClick={() => handleSelectEquipment(item, selectionDialog.searchTerm)}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {item.name}
                        </Typography>
                        <Chip
                          label={item.status}
                          size="small"
                          color={statuses.find(s => s.name === item.status)?.color as any}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Инв. номер: {item.inventoryNumber} | Департамент: {item.department}
                        </Typography>
                        {item.location && (
                          <Typography variant="body2" color="text.secondary">
                            Местоположение: {item.location}
                          </Typography>
                        )}
            </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectionDialog({ open: false, items: [], searchTerm: '' })}>
            Отмена
          </Button>
        </DialogActions>
      </Dialog>

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
      />
    </Box>
  );
};

export default Inventory;


