import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  MenuItem,
  InputAdornment,
  Checkbox,
  Alert,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileDownload as ExportIcon,
  Settings as SettingsIcon,
  MoreVert as MoreIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import BulkOperations from '../components/BulkOperations';
import ExportData, { ExportOptions } from '../components/ExportData';
import { getStatuses } from '../storage/statusStorage';
import { getEquipment } from '../storage/equipmentStorage';
import { getEntities } from '../storage/entitiesStorage';
import { ColumnPref, EquipmentColumnKey, getColumnPrefs, saveColumnPrefs } from '../storage/userPrefs';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List as MList,
  ListItem as MListItem,
  ListItemIcon as MListItemIcon,
  ListItemText as MListItemText,
} from '@mui/material';

interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
  status: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyMonths: number;
  department: string;
  comment?: string;
  inventoryNumber: string;
  cost?: number;
  supplier?: string;
  project?: string;
  user?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EquipmentList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addNotification } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedItems, setSelectedItems] = useState<Equipment[]>([]);
  const [bulkOperationsOpen, setBulkOperationsOpen] = useState(false);
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [columnsDialogOpen, setColumnsDialogOpen] = useState(false);
  const [columnPrefs, setColumnPrefs] = useState<ColumnPref[]>(getColumnPrefs());
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [conditions, setConditions] = useState<Array<{ field: string; op: 'eq' | 'neq' | 'contains' | 'ncontains' | 'gt' | 'gte' | 'lt' | 'lte'; value: string; operator?: 'AND' | 'OR'; manualValue?: string }>>([
    { field: 'name', op: 'contains', value: '' }
  ]);
  const [bulkActionField, setBulkActionField] = useState<string | null>(null);
  const [bulkActionOperation, setBulkActionOperation] = useState<string | null>(null);
  const [bulkActionValue, setBulkActionValue] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Ключ для принудительного обновления
  const [columnOrder, setColumnOrder] = useState<EquipmentColumnKey[]>([
    'invNumber', 'type', 'name', 'department', 'status', 'location', 'rack', 'manufacturer', 'model', 'serialNumber', 'purchaseDate', 'warrantyMonths', 'cost', 'comment', 'supplier', 'project', 'user', 'invoiceNumber', 'contractNumber'
  ]);

  // Инициализируем порядок столбцов на основе текущих настроек
  React.useEffect(() => {
    const currentOrder = columnPrefs.map(c => c.key);
    setColumnOrder(currentOrder);
  }, [columnPrefs]);

  // Автоматическое обновление данных
  React.useEffect(() => {
    const updateData = () => {
      // Принудительно обновляем данные
      setRefreshKey(prev => prev + 1);
    };

    // Обновляем каждые 10 секунд
    const interval = setInterval(updateData, 10000);

    // Обновляем при фокусе на окне
    const handleFocus = () => updateData();
    window.addEventListener('focus', handleFocus);

    // Обновляем при изменении видимости страницы
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        updateData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Получаем свежие данные при каждом обновлении
  const equipmentData = React.useMemo(() => {
    return getEquipment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  // Функция для генерации описания примененных фильтров
  const getFiltersDescription = () => {
    const activeFilters = [];
    
    // Поиск по тексту
    if (searchTerm.trim()) {
      activeFilters.push(`поиск: "${searchTerm}"`);
    }
    
    // Расширенные фильтры
    const activeConditions = conditions.filter(c => {
      if (c.value === '__manual__') {
        return c.manualValue && c.manualValue.trim() !== '';
      }
      return c.value && c.value.trim() !== '';
    });
    
    if (activeConditions.length > 0) {
      const conditionDescriptions = activeConditions.map((condition, index) => {
        const fieldNames: { [key: string]: string } = {
          'inventoryNumber': 'инв. номер',
          'name': 'название',
          'type': 'тип',
          'department': 'департамент',
          'status': 'статус',
          'location': 'местоположение',
          'rack': 'стеллаж',
          'user': 'пользователь',
          'manufacturer': 'производитель',
          'model': 'модель',
          'serialNumber': 'серийный номер',
          'cost': 'стоимость',
          'supplier': 'поставщик',
          'project': 'проект',
          'invoiceNumber': 'номер счета',
          'contractNumber': 'номер договора',
          'purchaseDate': 'дата закупки',
          'warrantyMonths': 'гарантия',
          'comment': 'комментарий'
        };
        
        const operatorNames: { [key: string]: string } = {
          'eq': 'равно',
          'neq': 'не равно',
          'contains': 'содержит',
          'ncontains': 'не содержит',
          'gt': 'больше',
          'gte': 'не менее',
          'lt': 'меньше',
          'lte': 'не более'
        };
        
        const fieldName = fieldNames[condition.field] || condition.field;
        const operatorName = operatorNames[condition.op] || condition.op;
        
        // Определяем значение для отображения
        const displayValue = condition.value === '__manual__' ? condition.manualValue : condition.value;
        
        let description = `${fieldName} ${operatorName} "${displayValue}"`;
        
        // Добавляем логический оператор для не первого фильтра
        if (index > 0 && condition.operator) {
          const operatorText = condition.operator === 'AND' ? 'И' : 'ИЛИ';
          description = `${operatorText} ${description}`;
        }
        
        return description;
      });
      
      activeFilters.push(conditionDescriptions.join(' И '));
    }
    
    return activeFilters;
  };


  const types = ['Все', 'Компьютеры', 'Периферия', 'Мониторы', 'Сетевое оборудование', 'Серверы'];
  const statuses = useMemo(() => getStatuses().map(s => s.name), []);
  const locations = ['Офис ПРМ - Склад', 'Офис ПРМ - Кабинет', 'Офис ПРМ - Серверная', 'Офис МСК - Кабинет руководства', 'Офис СПБ - IT отдел'];
  const users = useMemo(() => getEntities().users?.map(u => u.name) || [], []);
  const entities = useMemo(() => getEntities(), []);

  const filteredEquipment = equipmentData.filter((equipment) => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.inventoryNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });
  
  // Применяем расширенные фильтры
  const filteredWithAdvanced = filteredEquipment.filter((equipment) => {
    if (conditions.length === 0 || !conditions.some(c => c.value && c.value.trim() !== '')) {
      return true;
    }
    
    // Фильтруем только активные условия (с заполненными значениями)
    const activeConditions = conditions.filter(c => {
      if (c.value === '__manual__') {
        return c.manualValue && c.manualValue.trim() !== '';
      }
      return c.value && c.value.trim() !== '';
    });
    
    if (activeConditions.length === 0) return true;
    
    // Применяем фильтры с учетом операторов И/ИЛИ
    let result = true;
    
    for (let i = 0; i < activeConditions.length; i++) {
      const condition = activeConditions[i];
      const fieldValue = equipment[condition.field as keyof Equipment];
      
      if (!fieldValue) {
        result = false;
        break;
      }
      
      // Определяем значение для сравнения
      const compareValue = condition.value === '__manual__' ? condition.manualValue : condition.value;
      
      // Проверяем, что значение определено
      if (!compareValue) {
        result = false;
        break;
      }
      
      let matches = false;
      
      // Специальная обработка для разных типов полей
      if (condition.field === 'purchaseDate') {
        // Для дата полей
        const fieldDate = new Date(String(fieldValue));
        const conditionDate = new Date(compareValue);
        
        if (isNaN(fieldDate.getTime()) || isNaN(conditionDate.getTime())) {
          matches = false;
        } else {
          switch (condition.op) {
            case 'eq':
              matches = fieldDate.toDateString() === conditionDate.toDateString();
              break;
            case 'neq':
              matches = fieldDate.toDateString() !== conditionDate.toDateString();
              break;
            case 'gte':
              matches = fieldDate >= conditionDate;
              break;
            case 'lte':
              matches = fieldDate <= conditionDate;
              break;
            default:
              matches = true;
          }
        }
      } else if (['cost', 'warrantyMonths'].includes(condition.field) || 
                 (condition.field === 'inventoryNumber' && ['gt', 'gte', 'lt', 'lte'].includes(condition.op))) {
        // Для числовых полей
        const fieldNum = parseFloat(String(fieldValue));
        const conditionNum = parseFloat(compareValue);
        
        if (isNaN(fieldNum) || isNaN(conditionNum)) {
          matches = false;
        } else {
          switch (condition.op) {
            case 'eq':
              matches = fieldNum === conditionNum;
              break;
            case 'neq':
              matches = fieldNum !== conditionNum;
              break;
            case 'gt':
              matches = fieldNum > conditionNum;
              break;
            case 'gte':
              matches = fieldNum >= conditionNum;
              break;
            case 'lt':
              matches = fieldNum < conditionNum;
              break;
            case 'lte':
              matches = fieldNum <= conditionNum;
              break;
            default:
              matches = true;
          }
        }
      } else {
        // Для текстовых полей
        const fieldValueStr = String(fieldValue).toLowerCase();
        const conditionValue = compareValue.toLowerCase();
        
        switch (condition.op) {
          case 'eq':
            matches = fieldValueStr === conditionValue;
            break;
          case 'neq':
            matches = fieldValueStr !== conditionValue;
            break;
          case 'contains':
            matches = fieldValueStr.includes(conditionValue);
            break;
          case 'ncontains':
            matches = !fieldValueStr.includes(conditionValue);
            break;
          default:
            matches = true;
        }
      }
      
      // Применяем логику И/ИЛИ
      if (i === 0) {
        // Первый фильтр - просто устанавливаем результат
        result = matches;
      } else {
        // Последующие фильтры - применяем оператор
        const previousCondition = activeConditions[i - 1];
        if (previousCondition.operator === 'OR') {
          // Для OR: если предыдущий прошел ИЛИ текущий проходит
          result = result || matches;
        } else {
          // Для AND (по умолчанию): если предыдущий прошел И текущий проходит
          result = result && matches;
        }
      }
    }
    
    return result;
  });

  // Состояние для принудительного обновления цветов статусов
  const [statusColorsKey, setStatusColorsKey] = useState(0);

  // Получаем цвета статусов с использованием useMemo для корректного обновления
  const statusColors = useMemo(() => {
    const { getStatuses } = require('../storage/statusStorage');
    const statuses = getStatuses();
    const colorMap: { [key: string]: string } = {};
    
    statuses.forEach((s: any) => {
      // Преобразуем hex цвет в MUI цвет
      const color = s.color;
      if (color === '#4caf50') colorMap[s.name] = 'success';
      else if (color === '#ff9800') colorMap[s.name] = 'warning';
      else if (color === '#f44336') colorMap[s.name] = 'error';
      else if (color === '#2196f3') colorMap[s.name] = 'info';
      else if (color === '#9c27b0') colorMap[s.name] = 'secondary';
      else colorMap[s.name] = 'default';
    });
    
    return colorMap;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusColorsKey]); // Зависимость от statusColorsKey для обновления при изменении статусов

  // Отдельный useEffect для отслеживания изменений в statusStorage
  useEffect(() => {
    const checkStatusUpdates = () => {
      // Принудительно обновляем цвета статусов
      setStatusColorsKey(prev => prev + 1);
    };

    // Проверяем обновления каждые 5 секунд
    const interval = setInterval(checkStatusUpdates, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    return statusColors[status] || 'default';
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredWithAdvanced.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredWithAdvanced);
    }
  };

  const handleSelectItem = (equipment: Equipment) => {
    setSelectedItems(prev => 
      prev.find(item => item.id === equipment.id)
        ? prev.filter(item => item.id !== equipment.id)
        : [...prev, equipment]
    );
  };

  const handleBulkOperation = async (operation: any) => {
    try {
      // Имитация выполнения операции
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Импортируем функцию обновления
      const { updateEquipmentByInventoryNumber } = require('../storage/equipmentStorage');
      
      // Обновляем данные в хранилище
      if (operation.type === 'status' && operation.value) {
        selectedItems.forEach(item => {
          updateEquipmentByInventoryNumber(item.inventoryNumber, { status: operation.value });
        });
      } else if (operation.type === 'location' && operation.value) {
        selectedItems.forEach(item => {
          updateEquipmentByInventoryNumber(item.inventoryNumber, { location: operation.value });
        });
      } else if (operation.type === 'type' && operation.value) {
        selectedItems.forEach(item => {
          updateEquipmentByInventoryNumber(item.inventoryNumber, { type: operation.value });
        });
      } else if (operation.type === 'department' && operation.value) {
        selectedItems.forEach(item => {
          updateEquipmentByInventoryNumber(item.inventoryNumber, { department: operation.value });
        });
      } else if (operation.type === 'manufacturer' && operation.value) {
        selectedItems.forEach(item => {
          updateEquipmentByInventoryNumber(item.inventoryNumber, { manufacturer: operation.value });
        });
      } else if (operation.type === 'model' && operation.value) {
        selectedItems.forEach(item => {
          updateEquipmentByInventoryNumber(item.inventoryNumber, { model: operation.value });
        });
      } else if (operation.type === 'supplier' && operation.value) {
        selectedItems.forEach(item => {
          updateEquipmentByInventoryNumber(item.inventoryNumber, { supplier: operation.value });
        });
      } else if (operation.type === 'project' && operation.value) {
        selectedItems.forEach(item => {
          updateEquipmentByInventoryNumber(item.inventoryNumber, { project: operation.value });
        });
      } else if (operation.type === 'rack' && operation.value) {
        selectedItems.forEach(item => {
          updateEquipmentByInventoryNumber(item.inventoryNumber, { rack: operation.value });
        });
      } else if (operation.type === 'comment' && operation.value) {
        selectedItems.forEach(item => {
          const currentComment = item.comment || '';
          const newComment = currentComment ? `${currentComment}\n${operation.value}` : operation.value;
          updateEquipmentByInventoryNumber(item.inventoryNumber, { comment: newComment });
        });
      } else if (operation.type === 'assign' && operation.value) {
        selectedItems.forEach(item => {
          updateEquipmentByInventoryNumber(item.inventoryNumber, { user: operation.value });
        });
      } else if (operation.type === 'clear' && operation.value) {
        const fieldsToClear = JSON.parse(operation.value);
        selectedItems.forEach(item => {
          const updates: any = {};
          fieldsToClear.forEach((field: string) => {
            updates[field] = '';
          });
          updateEquipmentByInventoryNumber(item.inventoryNumber, updates);
        });
      } else if (operation.type === 'export') {
        console.log(`Экспорт ${selectedItems.length} элементов`);
      }
      
      // Принудительно обновляем компонент
      setSelectedItems([]);
      setRefreshKey(prev => prev + 1); // Обновляем данные
      
      addNotification({
        type: 'success',
        title: 'Массовая операция выполнена',
        message: `Операция "${operation.type}" успешно применена к ${selectedItems.length} элементам`,
      });
    } catch (error) {
      console.error('Ошибка массовой операции:', error);
      addNotification({
        type: 'error',
        title: 'Ошибка операции',
        message: 'Не удалось выполнить массовую операцию',
      });
    }
  };

  const handleExport = async (options: ExportOptions) => {
    try {
      // Имитация экспорта
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addNotification({
        type: 'success',
        title: 'Экспорт завершен',
        message: `Данные экспортированы в формате ${options.format.toUpperCase()}`,
      });

      // Экспорт с указанными опциями
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Ошибка экспорта',
        message: 'Не удалось экспортировать данные',
      });
    }
  };

  const availableFields = ['Название', 'Тип', 'Местоположение', 'Статус', 'Производитель', 'Модель', 'Серийный номер', 'Инвентарный номер', 'Дата покупки', 'Гарантия', 'Департамент', 'Комментарий', 'Поставщик', 'Проект', 'Пользователь'];

  const isVisible = (key: EquipmentColumnKey) => columnPrefs.find(c => c.key === key)?.visible !== false;

  const toggleColumn = (key: EquipmentColumnKey) => {
    setColumnPrefs(prev => {
      const next = prev.map(c => c.key === key ? { ...c, visible: !c.visible } : c);
      saveColumnPrefs(next);
      return next;
    });
  };

  // Drag and Drop функции
  const handleDragStart = (e: React.DragEvent, key: EquipmentColumnKey) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', key);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetKey: EquipmentColumnKey) => {
    e.preventDefault();
    const draggedKey = e.dataTransfer.getData('text/plain') as EquipmentColumnKey;
    
    if (draggedKey === targetKey) return;
    
    setColumnOrder(prev => {
      const draggedIndex = prev.indexOf(draggedKey);
      const targetIndex = prev.indexOf(targetKey);
      
      if (draggedIndex === -1 || targetIndex === -1) return prev;
      
      const next = [...prev];
      const [draggedItem] = next.splice(draggedIndex, 1);
      next.splice(targetIndex, 0, draggedItem);
      
      // Обновляем порядок в columnPrefs
      const updatedPrefs = next.map(key => {
        const existing = columnPrefs.find(c => c.key === key);
        return existing || { key, visible: true };
      });
      setColumnPrefs(updatedPrefs);
      saveColumnPrefs(updatedPrefs);
      
      return next;
    });
    
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const orderedVisibleColumns = useMemo(() => columnPrefs.filter(c => c.visible !== false).map(c => c.key), [columnPrefs]);

  const handleBulkAction = () => {
    if (!bulkActionField || !bulkActionOperation || (!bulkActionValue && bulkActionOperation !== 'clear')) {
      addNotification({
        type: 'warning',
        title: 'Не все поля заполнены',
        message: 'Пожалуйста, выберите поле, операцию и значение для массового действия.',
      });
      return;
    }

    const updatedItems = selectedItems.map(item => {
      const updatedItem = { ...item };
      if (bulkActionField === 'status') {
        updatedItem.status = bulkActionValue as string;
      } else if (bulkActionField === 'location') {
        updatedItem.location = bulkActionValue as string;
      } else if (bulkActionField === 'department') {
        updatedItem.department = bulkActionValue as string;
      } else if (bulkActionField === 'type') {
        updatedItem.type = bulkActionValue as string;
      } else if (bulkActionField === 'comment') {
        if (bulkActionOperation === 'replace') {
          updatedItem.comment = bulkActionValue as string;
        } else if (bulkActionOperation === 'add') {
          updatedItem.comment = (updatedItem.comment || '') + (bulkActionValue as string);
        } else if (bulkActionOperation === 'clear') {
          updatedItem.comment = '';
        }
      }
      return updatedItem;
    });

    setSelectedItems(updatedItems);
    setBulkActionsOpen(false);
    addNotification({
      type: 'success',
      title: 'Массовое действие выполнено',
      message: `Поле "${bulkActionField}" для ${selectedItems.length} элементов успешно обновлено.`,
    });
  };

  // Обработка фильтров из URL при загрузке страницы
  useEffect(() => {
    const urlFilters: Array<{ field: string; op: 'eq' | 'neq' | 'contains' | 'ncontains' | 'gt' | 'gte' | 'lt' | 'lte'; value: string; operator?: 'AND' | 'OR' }> = [];
    
    // Парсим параметры URL для фильтров
    let index = 0;
    while (searchParams.has(`filter${index}.field`)) {
      const field = searchParams.get(`filter${index}.field`);
      const operator = searchParams.get(`filter${index}.operator`);
      const value = searchParams.get(`filter${index}.value`);
      const operatorBetween = searchParams.get(`filter${index}.operatorBetween`);
      
      if (field && operator && value) {
        // Преобразуем операторы из дашборда в операторы EquipmentList
        let op: 'eq' | 'neq' | 'contains' | 'ncontains' | 'gt' | 'gte' | 'lt' | 'lte' = 'contains';
        switch (operator) {
          case 'equals':
            op = 'eq';
            break;
          case 'not_equals':
            op = 'neq';
            break;
          case 'contains':
            op = 'contains';
            break;
          case 'starts_with':
            op = 'contains';
            break;
          case 'ends_with':
            op = 'contains';
            break;
          case 'greater_than':
            op = 'gt';
            break;
          case 'less_than':
            op = 'lt';
            break;
          default:
            op = 'contains';
        }
        
        urlFilters.push({
          field,
          op,
          value,
          operator: operatorBetween as 'AND' | 'OR' | undefined
        });
      }
      index++;
    }
    
    // Если есть фильтры из URL, применяем их
    if (urlFilters.length > 0) {
      setConditions(urlFilters);
      // Фильтры применяются автоматически, не открываем диалог
    }
  }, [searchParams]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Оборудование
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {selectedItems.length > 0 && (
            <>
              <Button
                variant="outlined"
                startIcon={<MoreIcon />}
                onClick={() => setBulkOperationsOpen(true)}
              >
                Массовые операции ({selectedItems.length})
              </Button>
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={() => setExportDialogOpen(true)}
              >
                Экспорт
              </Button>
            </>
          )}
          <Button
            variant="contained"
            onClick={() => navigate('/equipment/new')}
            sx={{ borderRadius: 2 }}
          >
            Добавить оборудование
          </Button>
        </Box>
      </Box>

      {selectedItems.length > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Выбрано {selectedItems.length} элементов. Используйте массовые операции для изменения нескольких элементов одновременно.
        </Alert>
      )}

      {/* Фильтры и поиск */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Поиск по названию, серийному номеру, производителю или модели..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button variant="outlined" startIcon={<FilterIcon />} onClick={() => setFiltersDialogOpen(true)}>
            Фильтры
          </Button>
          <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => setColumnsDialogOpen(true)}>
            Колонки
          </Button>
          {selectedItems.length > 0 && (
            <Button
              variant="contained"
              startIcon={<SettingsIcon />}
              onClick={() => setBulkOperationsOpen(true)}
              sx={{ ml: 1 }}
            >
              Действия ({selectedItems.length})
            </Button>
          )}
        </Box>
      </Paper>

      <Dialog open={columnsDialogOpen} onClose={() => setColumnsDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Настройка столбцов</DialogTitle>
        <DialogContent>
          <MList>
            {columnOrder.map((key) => (
              <MListItem 
                key={key} 
                sx={{ 
                  cursor: 'grab',
                  '&:active': { cursor: 'grabbing' },
                  opacity: isDragging ? 0.7 : 1,
                  transition: 'opacity 0.2s'
                }}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, key)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, key)}
                onDragEnd={handleDragEnd}
              >
                <MListItemIcon>
                  <Checkbox edge="start" checked={isVisible(key)} onChange={() => toggleColumn(key)} />
                </MListItemIcon>
                <MListItemText primary={
                  key==='invNumber'?'Инв номер':
                  key==='type'?'Тип':
                  key==='name'?'Название':
                  key==='department'?'Департамент':
                  key==='status'?'Статус':
                  key==='location'?'Местоположение':
                  key==='rack'?'Стеллаж':
                  key==='manufacturer'?'Производитель':
                  key==='model'?'Модель':
                  key==='serialNumber'?'Серийный номер':
                  key==='purchaseDate'?'Дата покупки':
                  key==='warrantyMonths'?'Гарантия (мес.)':
                  key==='cost'?'Стоимость':
                  key==='comment'?'Комментарий':
                  key==='supplier'?'Поставщик':
                  key==='project'?'Проект':
                  key==='user'?'Пользователь':
                  key==='invoiceNumber'?'Номер счета':
                  key==='contractNumber'?'Номер договора':''
                } />
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                  <DragIcon 
                    sx={{ 
                      color: 'text.secondary', 
                      cursor: 'grab',
                      '&:active': { cursor: 'grabbing' }
                    }} 
                  />
                </Box>
              </MListItem>
            ))}
          </MList>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColumnsDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={filtersDialogOpen} onClose={() => setFiltersDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Расширенные фильтры</DialogTitle>
        <DialogContent sx={{ minHeight: '400px' }}>
          {conditions.map((c, idx) => (
            <Box key={idx} sx={{ 
              display: 'flex', 
              gap: 2, 
              mb: 3, 
              alignItems: 'flex-start',
              flexWrap: 'nowrap',
              '&:last-child': { mb: 0 }
            }}>
              {/* Показываем условие И/ИЛИ для не первого фильтра */}
              {idx > 0 && (
                <FormControl size="small" sx={{ minWidth: 140, flexShrink: 0 }}>
                  <InputLabel>Логика</InputLabel>
                  <Select
                    value={c.operator || 'AND'}
                    onChange={(e) => setConditions(prev => prev.map((x,i)=> i===idx?{...x, operator: e.target.value as 'AND' | 'OR'}:x))}
                    label="Логика"
                  >
                    <MenuItem value="AND">И (AND)</MenuItem>
                    <MenuItem value="OR">ИЛИ (OR)</MenuItem>
                  </Select>
                </FormControl>
              )}
              
              {/* Пустое место для выравнивания первого фильтра */}
              {idx === 0 && <Box sx={{ width: 140, flexShrink: 0 }} />}
              
              <TextField
                select
                size="small"
                label="Поле"
                value={c.field}
                onChange={(e) => setConditions(prev => prev.map((x,i)=> i===idx?{...x, field: e.target.value}:x))}
                sx={{ minWidth: 200, flexShrink: 0 }}
                SelectProps={{ native: true }}
              >
                {/* Основная информация */}
                <optgroup label="Основная информация">
                  <option value="inventoryNumber">Инвентарный номер</option>
                  <option value="name">Название</option>
                  <option value="type">Тип</option>
                  <option value="department">Департамент</option>
                  <option value="status">Статус</option>
                  <option value="location">Местоположение</option>
                  <option value="rack">Стеллаж</option>
                  <option value="user">Пользователь</option>
                </optgroup>
                
                {/* Техническая информация */}
                <optgroup label="Техническая информация">
                  <option value="manufacturer">Производитель</option>
                  <option value="model">Модель</option>
                  <option value="serialNumber">Серийный номер</option>
                </optgroup>
                
                {/* Финансовая информация */}
                <optgroup label="Финансовая информация">
                  <option value="cost">Стоимость</option>
                  <option value="supplier">Поставщик</option>
                  <option value="project">Проект</option>
                  <option value="invoiceNumber">Номер счета</option>
                  <option value="contractNumber">Номер договора</option>
                </optgroup>
                
                {/* Даты и гарантия */}
                <optgroup label="Даты и гарантия">
                  <option value="purchaseDate">Дата закупки</option>
                  <option value="warrantyMonths">Гарантия (месяцев)</option>
                </optgroup>
                
                {/* Дополнительно */}
                <optgroup label="Дополнительно">
                  <option value="comment">Комментарий</option>
                </optgroup>
              </TextField>
              
              <TextField
                select
                size="small"
                label="Оператор"
                value={c.op}
                onChange={(e) => setConditions(prev => prev.map((x,i)=> i===idx?{...x, op: e.target.value as any, value: ''}:x))}
                sx={{ minWidth: 160, flexShrink: 0 }}
                SelectProps={{ native: true }}
              >
                {/* Условия для текстовых полей */}
                {['name', 'type', 'location', 'status', 'manufacturer', 'model', 'serialNumber', 'department', 'rack', 'user', 'supplier', 'project', 'invoiceNumber', 'contractNumber', 'comment'].includes(c.field) && (
                  <>
                    <option value="eq">Равно</option>
                    <option value="neq">Не равно</option>
                    <option value="contains">Содержит</option>
                    <option value="ncontains">Не содержит</option>
                  </>
                )}
                
                {/* Условия для числовых полей */}
                {['cost', 'warrantyMonths'].includes(c.field) && (
                  <>
                    <option value="eq">Равно</option>
                    <option value="neq">Не равно</option>
                    <option value="gt">Больше</option>
                    <option value="gte">Не менее</option>
                    <option value="lt">Меньше</option>
                    <option value="lte">Не более</option>
                  </>
                )}
                
                {/* Условия для инвентарного номера (может быть числовым или текстовым) */}
                {c.field === 'inventoryNumber' && (
                  <>
                    <option value="eq">Равно</option>
                    <option value="neq">Не равно</option>
                    <option value="contains">Содержит</option>
                    <option value="ncontains">Не содержит</option>
                    <option value="gt">Больше</option>
                    <option value="gte">Не менее</option>
                    <option value="lt">Меньше</option>
                    <option value="lte">Не более</option>
                  </>
                )}
                
                {/* Условия для дата полей */}
                {c.field === 'purchaseDate' && (
                  <>
                    <option value="eq">Равно</option>
                    <option value="neq">Не равно</option>
                    <option value="gte">Не ранее</option>
                    <option value="lte">Не позднее</option>
                  </>
                )}
              </TextField>
              
              {/* Значение в зависимости от типа поля и условия */}
              {c.op === 'eq' ? (
                <TextField
                  select
                  size="small"
                  label="Значение"
                  value={c.value}
                  onChange={(e) => setConditions(prev => prev.map((x,i)=> i===idx?{...x, value: e.target.value}:x))}
                  sx={{ minWidth: 240, flexGrow: 1 }}
                  SelectProps={{ native: true }}
                >
                  {/* Предустановленные значения для статусов */}
                  {c.field === 'status' && statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                  
                  {/* Предустановленные значения для местоположений */}
                  {c.field === 'location' && locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                  
                  {/* Предустановленные значения для типов */}
                  {c.field === 'type' && types.filter(t => t !== 'Все').map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                  
                  {/* Предустановленные значения для департаментов */}
                  {c.field === 'department' && ['IT отдел', 'Отдел продаж', 'Бухгалтерия', 'HR отдел', 'Руководство'].map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                  
                  {/* Предустановленные значения для производителей */}
                  {c.field === 'manufacturer' && ['Dell', 'HP', 'Lenovo', 'Samsung', 'Cisco', 'Canon', 'LG'].map(man => (
                    <option key={man} value={man}>{man}</option>
                  ))}
                  
                  {/* Предустановленные значения для моделей */}
                  {c.field === 'model' && ['Latitude 5520', 'LaserJet Pro M404n', 'S24F350', 'Catalyst 2960', 'ProLiant DL380', 'ThinkPad X1 Carbon', 'PIXMA TS8320', '27UL850-W'].map(mod => (
                    <option key={mod} value={mod}>{mod}</option>
                  ))}
                  
                  {/* Предустановленные значения для пользователей */}
                  {c.field === 'user' && users.map(user => (
                    <option key={user} value={user}>{user}</option>
                  ))}
                  
                  {/* Предустановленные значения для стеллажей */}
                  {c.field === 'rack' && ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'].map(rack => (
                    <option key={rack} value={rack}>{rack}</option>
                  ))}
                  
                  {/* Предустановленные значения для поставщиков */}
                  {c.field === 'supplier' && ['ООО "ТехСнаб"', 'ИП Иванов', 'ЗАО "КомпьютерМир"', 'ООО "IT-Сервис"'].map(supp => (
                    <option key={supp} value={supp}>{supp}</option>
                  ))}
                  
                  {/* Предустановленные значения для проектов */}
                  {c.field === 'project' && ['Проект А', 'Проект Б', 'Проект В', 'Внутренний'].map(proj => (
                    <option key={proj} value={proj}>{proj}</option>
                  ))}
                  
                  {/* Поля для ручного ввода */}
                  {['name', 'serialNumber', 'comment', 'invoiceNumber', 'contractNumber'].includes(c.field) && (
                    <option value="">Введите вручную</option>
                  )}
                  
                  {/* Числовые поля */}
                  {['cost', 'warrantyMonths'].includes(c.field) && (
                    <option value="">Введите число</option>
                  )}
                  
                  {/* Дата */}
                  {c.field === 'purchaseDate' && (
                    <option value="">Выберите дату</option>
                  )}
                </TextField>
              ) : (
                <TextField
                  select
                  size="small"
                  label="Значение"
                  value={c.value}
                  onChange={(e) => setConditions(prev => prev.map((x,i)=> i===idx?{...x, value: e.target.value}:x))}
                  sx={{ minWidth: 240, flexGrow: 1 }}
                  SelectProps={{ native: true }}
                >
                  {/* Для всех операторов показываем предустановленные значения для соответствующих полей */}
                  {c.field === 'status' && (
                    <>
                      <option value="">Выберите статус</option>
                      {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </>
                  )}
                  
                  {c.field === 'location' && (
                    <>
                      <option value="">Выберите местоположение</option>
                      {locations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </>
                  )}
                  
                  {c.field === 'type' && (
                    <>
                      <option value="">Выберите тип</option>
                      {types.filter(t => t !== 'Все').map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </>
                  )}
                  
                  {c.field === 'department' && (
                    <>
                      <option value="">Выберите департамент</option>
                      {['IT отдел', 'Отдел продаж', 'Бухгалтерия', 'HR отдел', 'Руководство'].map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </>
                  )}
                  
                  {c.field === 'manufacturer' && (
                    <>
                      <option value="">Выберите производителя</option>
                      {['Dell', 'HP', 'Lenovo', 'Samsung', 'Cisco', 'Canon', 'LG'].map(man => (
                        <option key={man} value={man}>{man}</option>
                      ))}
                    </>
                  )}
                  
                  {c.field === 'model' && (
                    <>
                      <option value="">Выберите модель</option>
                      {['Latitude 5520', 'LaserJet Pro M404n', 'S24F350', 'Catalyst 2960', 'ProLiant DL380', 'ThinkPad X1 Carbon', 'PIXMA TS8320', '27UL850-W'].map(mod => (
                        <option key={mod} value={mod}>{mod}</option>
                      ))}
                    </>
                  )}
                  
                  {c.field === 'user' && (
                    <>
                      <option value="">Выберите пользователя</option>
                      {users.map(user => (
                        <option key={user} value={user}>{user}</option>
                      ))}
                    </>
                  )}
                  
                  {c.field === 'rack' && (
                    <>
                      <option value="">Выберите стеллаж</option>
                      {['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'].map(rack => (
                        <option key={rack} value={rack}>{rack}</option>
                      ))}
                    </>
                  )}
                  
                  {c.field === 'supplier' && (
                    <>
                      <option value="">Выберите поставщика</option>
                      {['ООО "ТехСнаб"', 'ИП Иванов', 'ЗАО "КомпьютерМир"', 'ООО "IT-Сервис"'].map(supp => (
                        <option key={supp} value={supp}>{supp}</option>
                      ))}
                    </>
                  )}
                  
                  {c.field === 'project' && (
                    <>
                      <option value="">Выберите проект</option>
                      {['Проект А', 'Проект Б', 'Проект В', 'Внутренний'].map(proj => (
                        <option key={proj} value={proj}>{proj}</option>
                      ))}
                    </>
                  )}
                  
                  {/* Для полей с ручным вводом добавляем опцию ручного ввода */}
                  {['name', 'serialNumber', 'comment', 'invoiceNumber', 'contractNumber'].includes(c.field) && (
                    <>
                      <option value="">Введите вручную</option>
                      <option value="__manual__">Ручной ввод</option>
                    </>
                  )}
                  
                  {/* Для числовых полей */}
                  {['cost', 'warrantyMonths'].includes(c.field) && (
                    <option value="">Введите число</option>
                  )}
                  
                  {/* Для даты */}
                  {c.field === 'purchaseDate' && (
                    <option value="">Выберите дату</option>
                  )}
                </TextField>
              )}
              
              {/* Дополнительное поле для ручного ввода, если выбрано "__manual__" */}
              {c.value === '__manual__' && ['name', 'serialNumber', 'comment', 'invoiceNumber', 'contractNumber'].includes(c.field) && (
                <TextField
                  size="small"
                  label="Введите значение"
                  value={c.manualValue || ''}
                  onChange={(e) => setConditions(prev => prev.map((x,i)=> i===idx?{...x, manualValue: e.target.value}:x))}
                  sx={{ minWidth: 240, flexGrow: 1 }}
                  placeholder="Введите значение вручную"
                />
              )}
              
              <Button 
                size="small" 
                color="error" 
                onClick={() => setConditions(prev => prev.filter((_,i)=>i!==idx))} 
                disabled={conditions.length === 1}
                sx={{ flexShrink: 0, minWidth: 80 }}
              >
                Удалить
              </Button>
            </Box>
          ))}
          
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            mt: 3, 
            pt: 2, 
            borderTop: '1px solid', 
            borderColor: 'divider',
            justifyContent: 'center'
          }}>
            <Button 
              size="medium" 
              variant="outlined"
              onClick={() => setConditions(prev => [...prev, { field: 'name', op: 'contains', value: '', operator: 'AND' }])}
            >
              + Добавить фильтр
            </Button>
            <Button 
              size="medium" 
              variant="outlined"
              color="secondary"
              onClick={() => setConditions([{ field: 'name', op: 'contains', value: '' }])}
            >
              Сбросить все
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFiltersDialogOpen(false)} variant="contained" size="large">
            Применить фильтры
          </Button>
        </DialogActions>
      </Dialog>

      {/* Таблица оборудования */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {/* Описание примененных фильтров */}
        {(() => {
          const activeFilters = getFiltersDescription();
          if (activeFilters.length > 0) {
            return (
              <Box sx={{ 
                p: 2, 
                borderBottom: '1px solid', 
                borderColor: 'divider', 
                backgroundColor: 'background.paper',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 2
              }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterIcon fontSize="small" />
                    Отфильтровано: {activeFilters.join(', ')}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Найдено записей: {filteredWithAdvanced.length} из {equipmentData.length}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setSearchTerm('');
                    setConditions([{ field: 'name', op: 'contains', value: '' }]);
                    setPage(0);
                  }}
                  sx={{ flexShrink: 0 }}
                >
                  Очистить фильтры
                </Button>
              </Box>
            );
          }
          return null;
        })()}
        
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedItems.length > 0 && selectedItems.length < filteredEquipment.length}
                    checked={selectedItems.length === filteredEquipment.length && filteredEquipment.length > 0}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                {orderedVisibleColumns.map((key) => (
                  <TableCell
                    key={key}
                    sx={{ fontWeight: key==='invNumber'?700:600 }}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, key)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, key)}
                    onDragEnd={handleDragEnd}
                    onDragLeave={(e) => e.preventDefault()}
                    onDragEnter={(e) => e.preventDefault()}
                  >
                    {
                      key==='invNumber'?'Инв. номер':
                      key==='type'?'Тип':
                      key==='name'?'Название':
                      key==='department'?'Департамент':
   
                      key==='status'?'Статус':
                      key==='location'?'Местоположение':
                      key==='rack'?'Стеллаж':
                      key==='manufacturer'?'Производитель':
                      key==='model'?'Модель':
                      key==='serialNumber'?'Серийный номер':
                      key==='purchaseDate'?'Дата покупки':
                      key==='warrantyMonths'?'Гарантия (мес.)':
                      key==='cost'?'Стоимость':
                      key==='comment'?'Комментарий':
                      key==='supplier'?'Поставщик':
                      key==='project'?'Проект':
                      key==='user'?'Пользователь':
                      key==='invoiceNumber'?'Номер счета':
                      key==='contractNumber'?'Номер договора':''
                    }
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWithAdvanced
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((equipment) => (
                  <TableRow key={equipment.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedItems.some(item => item.id === equipment.id)}
                        onChange={() => handleSelectItem(equipment)}
                      />
                    </TableCell>
                    {orderedVisibleColumns.map((key) => (
                      <TableCell key={key}>
                        {key === 'invNumber' && (
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 700, 
                              cursor: 'pointer',
                              '&:hover': { 
                                color: 'primary.main', 
                                textDecoration: 'underline' 
                              }
                            }}
                            onClick={() => navigate(`/equipment/${equipment.inventoryNumber}`)}
                          >
                            {equipment.inventoryNumber}
                          </Typography>
                        )}
                        {key === 'type' && equipment.type ? (
                          <Chip label={equipment.type} size="small" variant="outlined" color="primary" />
                        ) : ''}
                                                 {key === 'name' && equipment.name ? (
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500, cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}
                             onClick={() => navigate(`/equipment/${equipment.inventoryNumber}`)}
                            >
                              {equipment.name}
                            </Typography>
                         ) : ''}
                        {key === 'department' && equipment.department}
                        
                        {key === 'status' && equipment.status ? (
                          <Chip label={equipment.status} color={getStatusColor(equipment.status) as any} size="small" />
                        ) : ''}
                        {key === 'location' && equipment.location}
                        {key === 'rack' && equipment.rack}
                        {key === 'manufacturer' && equipment.manufacturer}
                        {key === 'model' && equipment.model}
                        {key === 'serialNumber' && (
                          <Typography variant="body2" className="monospace-text">
                            {equipment.serialNumber}
                          </Typography>
                        )}
                        {key === 'purchaseDate' && equipment.purchaseDate}
                        {key === 'warrantyMonths' && equipment.warrantyMonths ? `${equipment.warrantyMonths} мес.` : ''}
                        {key === 'cost' && equipment.cost ? `${equipment.cost} ₽` : ''}
                        {key === 'comment' && equipment.comment}
                        {key === 'supplier' && equipment.supplier}
                        {key === 'project' && equipment.project}
                        {key === 'user' && equipment.user}
                        {key === 'invoiceNumber' && equipment.invoiceNumber}
                        {key === 'contractNumber' && equipment.contractNumber}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredWithAdvanced.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Строк на странице:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} из ${count !== -1 ? count : `более ${to}`}`
          }
        />
      </Paper>

      {/* Действия */}
      <BulkOperations
        open={bulkOperationsOpen}
        onClose={() => setBulkOperationsOpen(false)}
        selectedItems={selectedItems}
        onBulkOperation={handleBulkOperation}
        availableStatuses={statuses}
        availableLocations={locations}
        availableTypes={types.filter(c => c !== 'Все')}
        availableUsers={users}
        availableDepartments={entities?.departments?.map((d: any) => d.name) || []}
        availableSuppliers={entities?.suppliers?.map((s: any) => s.name) || []}
        availableProjects={entities?.projects?.map((p: any) => p.name) || []}
        availableShelves={entities?.shelves?.map((s: any) => s.name) || []}
      />

      {/* Экспорт данных */}
      <ExportData
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExport}
        availableFields={availableFields}
                 types={types.filter(c => c !== 'Все')}
        statuses={statuses}
        locations={locations}
      />

      {/* Диалог массовых действий */}
      <Dialog open={bulkActionsOpen} onClose={() => setBulkActionsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Действия</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Выбрано элементов: {selectedItems.length}
            </Typography>
            
            <FormControl fullWidth>
              <InputLabel>Поле для изменения</InputLabel>
              <Select
                value={bulkActionField}
                onChange={(e) => setBulkActionField(e.target.value)}
                label="Поле для изменения"
              >
                <MenuItem value="status">Статус</MenuItem>
                <MenuItem value="location">Местоположение</MenuItem>
                <MenuItem value="department">Департамент</MenuItem>
                
                <MenuItem value="comment">Комментарий</MenuItem>
              </Select>
            </FormControl>

            {bulkActionField && (
              <FormControl fullWidth>
                <InputLabel>Операция</InputLabel>
                <Select
                  value={bulkActionOperation}
                  onChange={(e) => setBulkActionOperation(e.target.value)}
                  label="Операция"
                >
                  {bulkActionField === 'comment' ? (
                    <>
                      <MenuItem value="replace">Заменить на</MenuItem>
                      <MenuItem value="add">Добавить</MenuItem>
                      <MenuItem value="clear">Очистить</MenuItem>
                    </>
                  ) : (
                    <>
                      <MenuItem value="set">Установить значение</MenuItem>
                      <MenuItem value="clear">Очистить</MenuItem>
                    </>
                  )}
                </Select>
              </FormControl>
            )}

            {bulkActionOperation && bulkActionOperation !== 'clear' && (
              bulkActionField === 'comment' ? (
                <TextField
                  fullWidth
                  label="Значение"
                  value={bulkActionValue}
                  onChange={(e) => setBulkActionValue(e.target.value)}
                  multiline
                  rows={3}
                />
              ) : (
                <FormControl fullWidth>
                  <InputLabel>Значение</InputLabel>
                  <Select
                    value={bulkActionValue}
                    onChange={(e) => setBulkActionValue(e.target.value)}
                    label="Значение"
                  >
                    {bulkActionField === 'status' && statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                    {bulkActionField === 'location' && locations.map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
                    {bulkActionField === 'department' && entities?.departments?.map((d: any) => <MenuItem key={d.id} value={d.name}>{d.name}</MenuItem>)}
                    {bulkActionField === 'type' && types.filter(c => c !== 'Все').map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              )
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionsOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleBulkAction} 
            variant="contained" 
            disabled={!bulkActionField || (!bulkActionOperation && bulkActionOperation !== 'clear') || (!bulkActionValue && bulkActionOperation !== 'clear')}
          >
            Применить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentList;
