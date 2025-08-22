import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Card,
  CardContent,
  Tooltip,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import QrCodeIcon from '@mui/icons-material/QrCode';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { 
  getBufferRows, 
  saveBufferRows
} from '../storage/inventoryBufferStorage';
import { getEquipment, updateEquipment } from '../storage/equipmentStorage';
import { getEntities } from '../storage/entitiesStorage';
import { getStatuses } from '../storage/statusStorage';
import BulkOperations, { BulkOperation } from '../components/BulkOperations';

type EquipmentType = 'Компьютер' | 'Монитор' | 'Устройство';

interface FoundItem {
  id: number;
  type: EquipmentType;
  name: string;
  inventoryNumber?: string;
  serialNumber?: string;
  department?: string;
  status?: string;
  location?: string;
  otherserial?: string;
  serial?: string;
  groups_id?: string;
  comment?: string;
  user?: string;
}

interface BufferRow {
  key: string;
  input: string;
  status: 'search' | 'found' | 'not_found' | 'duplicate';
  display?: string;
  item?: FoundItem;
}



const Inventory = () => {
  const [rows, setRows] = useState<BufferRow[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [foundItems, setFoundItems] = useState<Record<string, any>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const navigate = useNavigate();

  // Диалог выбора при множественных совпадениях
  const [selectionDialog, setSelectionDialog] = useState<{
    open: boolean;
    searchValue: string;
    options: any[];
  }>({ open: false, searchValue: '', options: [] });

  // Диалог массовых операций
  const [bulkOperationsOpen, setBulkOperationsOpen] = useState(false);

  // Функция для получения цвета статуса (как в EquipmentList)
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Активно':
        return 'success';
      case 'Ремонт':
      case 'В ремонте':
        return 'warning';
      case 'Списано':
      case 'Списан':
        return 'error';
      case 'Неактивно':
        return 'error';
      default:
        return 'default';
    }
  };

  // Получаем найденные элементы для массовых операций
  const getFoundEquipment = useCallback(() => {
    return rows
      .filter(row => row.status === 'found' && row.item)
      .map(row => ({
        id: row.item!.id.toString(),
        name: row.item!.name,
        type: row.item!.type,
        department: row.item!.department,
        status: row.item!.status,
        location: row.item!.location || '',
        inventoryNumber: row.item!.inventoryNumber,
        comment: row.item!.comment,
        user: row.item!.user,
        ...row.item
      }));
  }, [rows]);

  // Получаем доступные опции для массовых операций
  const getAvailableOptions = useCallback(() => {
    const entities = getEntities();
    const statuses = getStatuses();
    
    return {
      statuses: statuses.map(s => s.name),
      locations: entities.locations.map(l => l.name),
      types: entities.types.map(t => t.name),
      departments: entities.departments.map(d => d.name),
      users: entities.users?.map(u => u.name) || []
    };
  }, []);

  // Обработка массовых операций
  const handleBulkOperation = useCallback(async (operation: BulkOperation) => {
    const foundEquipment = getFoundEquipment();
    
    try {
      for (const equipment of foundEquipment) {
        const updates: any = {};
        
        switch (operation.type) {
          case 'status':
            updates.status = operation.value;
            break;
          case 'location':
            updates.location = operation.value;
            break;
          case 'comment':
            updates.comment = operation.value;
            break;
          case 'assign':
            updates.user = operation.value;
            break;
          case 'export':
            // Экспорт обрабатывается отдельно
            continue;
        }
        
        if (Object.keys(updates).length > 0) {
          updateEquipment(equipment.id.toString(), updates);
        }
      }
      
      // Обновляем буфер с новыми данными
      const updatedRows = rows.map(row => {
        if (row.status === 'found' && row.item) {
          const updatedEquipment = getEquipment().find(eq => eq.id === row.item!.id.toString());
          if (updatedEquipment) {
            return {
              ...row,
                              item: {
                  ...row.item,
                  status: updatedEquipment.status,
                  location: updatedEquipment.location,
                  type: updatedEquipment.type as EquipmentType,
                  department: updatedEquipment.department,
                  comment: updatedEquipment.comment,
                  user: updatedEquipment.user
                }
            };
          }
        }
        return row;
      });
      
      setRows(updatedRows);
      saveBufferRows(updatedRows);
      
      // Показываем уведомление об успехе
      if (window.notificationSystem) {
        window.notificationSystem.addNotification({
          type: 'success',
          title: 'Массовая операция выполнена',
          message: `Обновлено ${foundEquipment.length} элементов`
        });
      }
      
    } catch (error) {
      console.error('Ошибка массовой операции:', error);
      if (window.notificationSystem) {
        window.notificationSystem.addNotification({
          type: 'error',
          title: 'Ошибка массовой операции',
          message: 'Не удалось выполнить операцию'
        });
      }
      throw error;
    }
  }, [rows, getFoundEquipment]);

  // Загружаем данные из хранилища при инициализации и при каждом монтировании
  useEffect(() => {
    const savedRows = getBufferRows();
    if (savedRows && savedRows.length > 0) {
      setRows(savedRows);
    }
  }, []);

  // Сохраняем данные в хранилище при изменении
  useEffect(() => {
    // Используем setTimeout чтобы избежать множественных сохранений при быстрых изменениях
    const timeoutId = setTimeout(() => {
      saveBufferRows(rows);
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [rows]);

  // Поиск только по инвентарному и серийному номерам (как в референсе)
  const searchEquipmentByNumbers = useCallback((query: string) => {
    const equipment = getEquipment();
    const searchTerm = query.replace(/^0+/, '') || query; // Нормализация как в референсе
    
    const results: Array<{ type: string; item: any }> = [];
    
    equipment.forEach(item => {
      const otherserial = (item.inventoryNumber || '').replace(/^0+/, '') || (item.inventoryNumber || '');
      const serial = (item.serialNumber || '').replace(/^0+/, '') || (item.serialNumber || '');
      
      // Проверяем совпадение как по инвентарному, так и по серийному номеру (как в референсе)
      if ((otherserial && otherserial.includes(searchTerm)) || (serial && serial.includes(searchTerm))) {
        results.push({
          type: item.type || 'Устройство',
          item: item
        });
      }
    });
    
    return results;
  }, []);

  const addSerial = useCallback(() => {
    if (!inputValue.trim()) return;
    
    // Нормализуем введенный номер (убираем ведущие нули как в референсе)
    const s = inputValue.trim().replace(/^0+/, '') || inputValue.trim();
    
    // Генерируем уникальный ключ для буфера
    const bufferKey = `${s}_${Date.now()}`;
    
    // Создаем новую строку в состоянии "поиск"
    const searchRow: BufferRow = {
      key: bufferKey,
      input: s,
      status: 'search'
    };
    
    // Добавляем строку в буфер
    setRows(prev => [...prev, searchRow]);
    setInputValue('');
    
    // Выполняем поиск
    const foundEquipment = searchEquipmentByNumbers(s);
    
    if (foundEquipment.length === 0) {
      // Не найдено
      setRows(prev => prev.map(row => 
        row.key === bufferKey 
          ? { ...row, status: 'not_found' }
          : row
      ));
    } else if (foundEquipment.length === 1) {
      // Одно совпадение - проверяем на дубликат
      const equipmentData = foundEquipment[0];
      const equipment = equipmentData.item;
      
      // Определяем ключевой серийный номер (как в референсе)
      const otherserial = (equipment.inventoryNumber || '').replace(/^0+/, '') || (equipment.inventoryNumber || '');
      const serial = (equipment.serialNumber || '').replace(/^0+/, '') || (equipment.serialNumber || '');
      const keySerial = otherserial || serial;
      
      // Проверяем дубликат по уже найденному оборудованию (как в референсе)
      const isDuplicate = keySerial in foundItems;
      
      if (isDuplicate) {
        // Дубликат - обновляем с реальными данными оборудования
        setRows(prev => prev.map(row => 
          row.key === bufferKey 
            ? { 
                ...row, 
                status: 'duplicate',
                item: {
                  id: equipment.id,
                  type: equipment.type as EquipmentType,
                  name: equipment.name,
                  inventoryNumber: equipment.inventoryNumber,
                  serialNumber: equipment.serialNumber,
                  department: equipment.department,
                  status: equipment.status
                } as any
              }
            : row
        ));
      } else {
        // Найдено - добавляем в foundItems и обновляем строку
        setFoundItems(prev => ({ ...prev, [keySerial]: equipmentData }));
        
        setRows(prev => prev.map(row => 
          row.key === bufferKey 
            ? { 
                ...row, 
                status: 'found',
                item: {
                  id: equipment.id,
                  type: equipmentData.type as EquipmentType,
                  name: equipment.name,
                  inventoryNumber: equipment.inventoryNumber,
                  serialNumber: equipment.serialNumber,
                  department: equipment.department,
                  status: equipment.status
                }
              }
            : row
        ));
      }
    } else {
      // Множественные совпадения - показываем диалог выбора
      setSelectionDialog({
        open: true,
        searchValue: s,
        options: foundEquipment
      });
      
      // Удаляем временную строку поиска
      setRows(prev => prev.filter(row => row.key !== bufferKey));
    }
  }, [inputValue, searchEquipmentByNumbers, foundItems]);

  // Функции для диалога выбора
  const handleSelectionDialogClose = () => {
    setSelectionDialog({ open: false, searchValue: '', options: [] });
  };

  const handleSelectEquipment = (equipmentData: any) => {
    const equipment = equipmentData.item;
    const s = selectionDialog.searchValue;
    
    // Определяем ключевой серийный номер (как в референсе)
    const otherserial = (equipment.inventoryNumber || '').replace(/^0+/, '') || (equipment.inventoryNumber || '');
    const serial = (equipment.serialNumber || '').replace(/^0+/, '') || (equipment.serialNumber || '');
    const keySerial = otherserial || serial;
    
    // Проверяем дубликат по уже найденному оборудованию (как в референсе)
    const isDuplicate = keySerial in foundItems;
    
    const bufferKey = `${s}_${Date.now()}`;
    
    if (isDuplicate) {
      // Дубликат - с реальными данными оборудования
      const newRow: BufferRow = {
        key: bufferKey,
        input: s,
        status: 'duplicate',
        item: {
          id: equipment.id,
          type: equipment.type as EquipmentType,
          name: equipment.name,
          inventoryNumber: equipment.inventoryNumber,
          serialNumber: equipment.serialNumber,
          department: equipment.department,
          status: equipment.status
        } as any
      };
      setRows(prev => [...prev, newRow]);
    } else {
      // Найдено - добавляем в foundItems
      setFoundItems(prev => ({ ...prev, [keySerial]: equipmentData }));
      
      const newRow: BufferRow = {
        key: bufferKey,
        input: s,
        status: 'found',
        item: {
          id: equipment.id,
          type: equipmentData.type as EquipmentType,
          name: equipment.name,
          inventoryNumber: equipment.inventoryNumber,
          serialNumber: equipment.serialNumber,
          department: equipment.department,
          status: equipment.status
        }
      };
      setRows(prev => [...prev, newRow]);
    }
    
    handleSelectionDialogClose();
  };

  const removeRow = useCallback((key: string) => {
    // Находим удаляемую строку
    const rowToRemove = rows.find(r => r.key === key);
    
    if (rowToRemove && rowToRemove.item && rowToRemove.status === 'found') {
      // Если это найденный элемент, удаляем его из foundItems
      const equipment = rowToRemove.item;
      const otherserial = (equipment.inventoryNumber || '').replace(/^0+/, '') || (equipment.inventoryNumber || '');
      const serial = (equipment.serialNumber || '').replace(/^0+/, '') || (equipment.serialNumber || '');
      const keySerial = otherserial || serial;
      
      setFoundItems(prev => {
        const newFoundItems = { ...prev };
        delete newFoundItems[keySerial];
        return newFoundItems;
      });
    }
    
    // Удаляем строку из буфера
    setRows(prev => prev.filter(r => r.key !== key));
  }, [rows]);

  const clearBufferData = useCallback(() => {
    setRows([]);
    setFoundItems({});
  }, []);

  const removeNonGreenData = useCallback(() => {
    // Оставляем только найденные элементы и обновляем foundItems соответственно
    const foundRows = rows.filter(r => r.status === 'found');
    setRows(foundRows);
    
    // Обновляем foundItems, оставляя только элементы из найденных строк
    const newFoundItems: Record<string, any> = {};
    foundRows.forEach(row => {
      if (row.item) {
        const equipment = row.item;
        const otherserial = (equipment.inventoryNumber || '').replace(/^0+/, '') || (equipment.inventoryNumber || '');
        const serial = (equipment.serialNumber || '').replace(/^0+/, '') || (equipment.serialNumber || '');
        const keySerial = otherserial || serial;
        
        if (keySerial in foundItems) {
          newFoundItems[keySerial] = foundItems[keySerial];
        }
      }
    });
    setFoundItems(newFoundItems);
  }, [rows, foundItems]);



  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setSelectedFile(file);
    setImportDialogOpen(true);
  };

  const doImport = async () => {
    if (!selectedFile) return;
    
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      setImportProgress(50);
      
      // Обрабатываем импортированные данные
      const newRows: BufferRow[] = jsonData.map((row: any, index: number) => ({
        key: Date.now().toString() + index,
        input: row.serial || row.inventory || row.name || String(row),
        status: 'search'
      }));
      
      setImportProgress(100);
      
      // Добавляем новые строки
      setRows(prev => [...prev, ...newRows]);
      
      setTimeout(() => {
        setImportDialogOpen(false);
        setImportProgress(0);
        setSelectedFile(null);
      }, 1000);
      
    } catch (error) {
      console.error('Ошибка импорта:', error);
    }
  };

  const download = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const doExport = () => {
    const data = rows.map(row => ({
      'Инвентарный номер': row.input,
      'Статус поиска': row.status === 'found' ? 'Найдено' : 
                row.status === 'not_found' ? 'Не найдено' : 
                row.status === 'duplicate' ? 'Дубликат' : 'Поиск',
      'Наименование': row.item?.name || '',
      'Департамент': row.item?.department || '',
      'Статус оборудования': row.item?.status || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Инвентаризация');
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    download(blob, `inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const totalCount = rows.length;
  const foundCount = rows.filter(r => r.status === 'found').length;
  const notFoundCount = rows.filter(r => r.status === 'not_found').length;
  const duplicateCount = rows.filter(r => r.status === 'duplicate').length;

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
        Инвентаризация
      </Typography>

      {/* Статистика */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center' }}>
          <Typography variant="h6" color="primary.main">{totalCount}</Typography>
          <Typography variant="body2" color="text.secondary">Всего</Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center' }}>
          <Typography variant="h6" color="success.main">{foundCount}</Typography>
          <Typography variant="body2" color="text.secondary">Найдено</Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center' }}>
          <Typography variant="h6" color="error.main">{notFoundCount}</Typography>
          <Typography variant="body2" color="text.secondary">Не найдено</Typography>
        </Paper>
        <Paper sx={{ p: 2, minWidth: 120, textAlign: 'center' }}>
          <Typography variant="h6" color="info.main">{duplicateCount}</Typography>
          <Typography variant="body2" color="text.secondary">Дубликаты</Typography>
        </Paper>
      </Box>

      {/* Управление */}
      <Paper sx={{ p: 3, mb: 3 }}>
        {/* Ввод и основные действия */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr auto auto auto', 
          gap: 2, 
          mb: 3, 
          alignItems: 'center',
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
            gap: 1
          }
        }}>
        <TextField
            label="Добавить инвентарный номер"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSerial()}
            placeholder="Введите номер и нажмите Enter"
            helperText="Поиск только по инвентарному номеру и серийному номеру"
            fullWidth
          />
          <Button variant="contained" onClick={addSerial} disabled={!inputValue.trim()}>
            Добавить
          </Button>
          <Button variant="outlined" onClick={() => setImportDialogOpen(true)}>
            Импорт
          </Button>
          <Button variant="outlined" onClick={doExport} disabled={rows.length === 0}>
            Экспорт
          </Button>
        </Box>

        {/* Дополнительные действия */}
        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button 
              variant="outlined" 
              color="error" 
              onClick={clearBufferData}
              disabled={rows.length === 0}
              size="small"
            >
              Очистить буфер
            </Button>
            <Button 
              variant="outlined" 
              color="warning" 
              onClick={removeNonGreenData}
              disabled={rows.filter(r => r.status !== 'found').length === 0}
              size="small"
            >
              Убрать не зеленые
            </Button>
          </Box>
          
          <Button 
            variant="outlined" 
            onClick={() => {
              const foundRows = rows.filter(r => r.status === 'found');
              if (foundRows.length === 0) {
                alert('Нет найденных позиций для массовых операций');
                return;
              }
              
              setBulkOperationsOpen(true);
            }} 
            disabled={rows.length === 0}
          >
            Действия
          </Button>
        </Box>
      </Paper>

      {/* Буфер позиций */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {rows.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Буфер пуст
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Добавьте инвентарные номера для начала работы
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              💡 Введите номер в поле выше и нажмите Enter или кнопку "Добавить"
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              💡 Поиск работает только по инвентарному номеру и серийному номеру
                </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              💡 Кликните на наименование для перехода в карточку техники
                  </Typography>
          </Paper>
        ) : (
          rows.map((row, index) => (
            <Card 
              key={row.key}
              sx={{ 
                border: '1px solid',
                borderColor: row.status === 'found' ? 'success.light' : 
                             row.status === 'not_found' ? 'error.light' : 
                             row.status === 'duplicate' ? 'grey.300' : 'warning.light',
                backgroundColor: row.status === 'found' ? 'rgba(76, 175, 80, 0.08)' : 
                                row.status === 'not_found' ? 'rgba(244, 67, 54, 0.08)' : 
                                row.status === 'duplicate' ? 'rgba(158, 158, 158, 0.08)' : 'rgba(255, 152, 0, 0.08)',
                mb: 1,
                boxShadow: 2,
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease',
                animation: 'fadeInUp 0.3s ease-out',
                '@keyframes fadeInUp': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateY(10px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateY(0)',
                  },
                },
              }}
            >
              <CardContent sx={{ p: 1, py: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '32px' }}>
                  {/* Левая часть - информация */}
                  <Box sx={{ flex: 1 }}>
                    {/* Все данные в одну строку с отступами */}
                  <Typography 
                    variant="body2" 
                    sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        flexWrap: 'wrap',
                        lineHeight: 1.2
                      }}
                    >
                      {/* Инвентарный номер - жирным */}
                      <Typography 
                        component="span" 
                        sx={{ 
                          fontWeight: 700,
                          color: 'text.primary',
                          fontSize: '0.875rem'
                        }}
                      >
                        {row.item?.inventoryNumber || row.input}
                      </Typography>
                      
                      {/* Разделитель */}
                      <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>|</Typography>
                      
                      {/* Департамент - жирным */}
                      <Typography 
                        component="span" 
                        sx={{ 
                          fontWeight: 700,
                          color: 'text.primary',
                          fontSize: '0.875rem'
                        }}
                      >
                        {row.item?.department || 'Не указано'}
                      </Typography>
                      
                      {/* Наименование - кликабельно */}
                      {row.item?.name && row.status === 'found' && (
                        <>
                          <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>|</Typography>
                          <Typography 
                            component="span"
                            sx={{ 
                              color: 'primary.main',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                              fontSize: '0.875rem',
                              '&:hover': { 
                                color: 'primary.dark',
                                textDecoration: 'none'
                              }
                            }}
                            onClick={() => navigate(`/equipment/${row.item!.inventoryNumber}`)}
                          >
                            {row.item.name}
                  </Typography>
                        </>
                      )}
                      

                      
                      {/* Статус оборудования или статус поиска */}
                      {(row.item?.status || row.status !== 'found') && (
                        <>
                          <Typography component="span" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>|</Typography>
                          {row.item?.status ? (
                            <Chip 
                              label={row.item.status} 
                              color={getStatusColor(row.item.status) as any} 
                              size="small" 
                              sx={{ ml: 0.5 }}
                            />
                          ) : (
                            <Chip 
                              label={
                                row.status === 'not_found' ? 'Не найдено' : 
                                row.status === 'duplicate' ? 'Дубликат' : 
                                'Поиск...'
                              }
                              color={
                                row.status === 'not_found' ? 'error' : 
                                row.status === 'duplicate' ? 'default' : 
                                'warning'
                              }
                              size="small" 
                              sx={{ ml: 0.5 }}
                            />
                          )}
                        </>
                      )}

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
                    </Typography>
              </Box>

              {/* Правая часть - кнопки */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                                      <Tooltip title="Показать штрих-код">
                  <IconButton
                      size="small"
                    color="primary"
                      onClick={() => {
                        if (row.item?.inventoryNumber) {
                          // Открываем новое окно с штрих-кодом
                          const newWindow = window.open('', '_blank', 'width=400,height=300');
                          if (newWindow) {
                            newWindow.document.write(`
                              <!DOCTYPE html>
                              <html>
                                <head>
                                  <title>Штрих-код ${row.item.inventoryNumber}</title>
                                  <style>
                                    body { 
                                      font-family: Arial, sans-serif; 
                                      text-align: center; 
                                      padding: 20px;
                                      background: white;
                                    }
                                    .barcode-container {
                                      margin: 20px 0;
                                      padding: 20px;
                                      border: 1px solid #ccc;
                                      border-radius: 8px;
                                    }
                                    .inventory-number {
                                      font-size: 18px;
                                      font-weight: bold;
                                      margin-bottom: 10px;
                                    }
                                    .barcode {
                                      margin: 20px 0;
                                    }
                                    .print-btn {
                                      background: #2196f3;
                                      color: white;
                                      border: none;
                                      padding: 10px 20px;
                                      border-radius: 4px;
                                      cursor: pointer;
                                      font-size: 14px;
                                    }
                                    .print-btn:hover {
                                      background: #1976d2;
                                    }
                                  </style>
                                  <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
                                </head>
                                <body>
                                  <div class="barcode-container">
                                    <div class="inventory-number">Инв. №: ${row.item.inventoryNumber}</div>
                                    <div class="barcode">
                                      <svg id="barcode"></svg>
                                    </div>
                                    <button class="print-btn" onclick="window.print()">Печать</button>
                                  </div>
                                  <script>
                                    JsBarcode("#barcode", "${row.item.inventoryNumber}", {
                                      format: "CODE128",
                                      width: 2,
                                      height: 100,
                                      displayValue: true,
                                      fontSize: 16,
                                      margin: 10
                                    });
                                  </script>
                                </body>
                              </html>
                            `);
                            newWindow.document.close();
                          }
                        } else {
                          alert('Нет инвентарного номера для генерации штрих-кода');
                        }
                      }}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(33, 150, 243, 0.08)'
                        }
                      }}
                  >
                    <QrCodeIcon />
                  </IconButton>
                  </Tooltip>
                
                    <Tooltip title="Удалить позицию">
                <IconButton 
                        size="small"
                  color="error"
                        onClick={() => removeRow(row.key)}
                        sx={{ 
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.08)'
                          }
                        }}
                >
                  <DeleteIcon />
                </IconButton>
                    </Tooltip>
                  </Box>
              </Box>
              </CardContent>
            </Card>
          ))
        )}
        </Box>

      {/* Диалог импорта */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Импорт из Excel</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Выберите Excel файл для импорта инвентарных номеров
          </Typography>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={{ marginBottom: 16 }}
          />
          {importProgress > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Импорт: {importProgress}%
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Отмена</Button>
          <Button onClick={doImport} variant="contained" disabled={!selectedFile}>
            Импортировать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог выбора при множественных совпадениях */}
      <Dialog 
        open={selectionDialog.open} 
        onClose={handleSelectionDialogClose} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Выбор оборудования для "{selectionDialog.searchValue}"
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Найдено несколько совпадений. Выберите нужное оборудование:
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {selectionDialog.options.map((equipmentData, index) => {
              const equipment = equipmentData.item;
              const typeMap: Record<string, string> = {
                'Computer': 'Компьютер',
                'Monitor': 'Монитор', 
                'Peripheral': 'Устройство'
              };
              const otherserial = (equipment.inventoryNumber || '').replace(/^0+/, '') || (equipment.inventoryNumber || '');
              
              return (
                <Paper 
                  key={index}
                  sx={{
                    p: 2, 
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'primary.main',
                      backgroundColor: 'action.hover'
                    }
                  }}
                  onClick={() => handleSelectEquipment(equipmentData)}
                >
                  <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                    {typeMap[equipmentData.type] || 'Устройство'}: {equipment.name || 'Без имени'} (Инв. № {otherserial})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Департамент: {equipment.department || 'Не указано'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Серийный: {equipment.serialNumber || 'Не указано'} | Статус: {equipment.status || 'Не указано'}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSelectionDialogClose}>
            Отмена
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог массовых операций */}
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


