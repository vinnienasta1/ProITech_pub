import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Menu,
  MenuItem,
  InputAdornment,
  Checkbox,
  Tooltip,
  Alert,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  FileDownload as ExportIcon,
  Settings as SettingsIcon,
  MoreVert as MoreIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNotifications } from '../contexts/NotificationContext';
import BulkOperations from '../components/BulkOperations';
import ExportData, { ExportOptions } from '../components/ExportData';
import { getStatuses } from '../storage/statusStorage';
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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

interface Equipment {
  id: number;
  name: string;
  category: string;
  location: string;
  status: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyExpiry: string;
  department: string;
  comment?: string;
}

const mockEquipment: Equipment[] = [
  {
    id: 1,
    name: 'Ноутбук Dell Latitude 5520',
    category: 'Компьютеры',
    location: 'Офис ПРМ - Кабинет',
    status: 'Активно',
    manufacturer: 'Dell',
    model: 'Latitude 5520',
    serialNumber: 'DL5520-001',
    purchaseDate: '2023-01-15',
    warrantyExpiry: '2026-01-15',
    department: 'IT отдел',
  },
  {
    id: 2,
    name: 'Принтер HP LaserJet Pro',
    category: 'Периферия',
    location: 'Офис ПРМ - Кабинет',
    status: 'Активно',
    manufacturer: 'HP',
    model: 'LaserJet Pro M404n',
    serialNumber: 'HP404-002',
    purchaseDate: '2022-11-20',
    warrantyExpiry: '2025-11-20',
    department: 'Отдел продаж',
  },
  {
    id: 3,
    name: 'Монитор Samsung 24"',
    category: 'Мониторы',
    location: 'Офис ПРМ - Серверная',
    status: 'Ремонт',
    manufacturer: 'Samsung',
    model: 'S24F350',
    serialNumber: 'SM24-003',
    purchaseDate: '2021-08-10',
    warrantyExpiry: '2024-08-10',
    department: 'IT отдел',
  },
  {
    id: 4,
    name: 'Сетевое оборудование Cisco',
    category: 'Сетевое оборудование',
    location: 'Офис ПРМ - Серверная',
    status: 'Активно',
    manufacturer: 'Cisco',
    model: 'Catalyst 2960',
    serialNumber: 'CS2960-004',
    purchaseDate: '2020-12-05',
    warrantyExpiry: '2025-12-05',
    department: 'IT отдел',
  },
  {
    id: 5,
    name: 'Сервер HP ProLiant DL380',
    category: 'Серверы',
    location: 'Офис ПРМ - Серверная',
    status: 'Активно',
    manufacturer: 'HP',
    model: 'ProLiant DL380 Gen10',
    serialNumber: 'HP380-005',
    purchaseDate: '2022-03-15',
    warrantyExpiry: '2027-03-15',
    department: 'IT отдел',
  },
  {
    id: 6,
    name: 'Ноутбук Lenovo ThinkPad X1',
    category: 'Компьютеры',
    location: 'Офис МСК - Кабинет руководства',
    status: 'Активно',
    manufacturer: 'Lenovo',
    model: 'ThinkPad X1 Carbon',
    serialNumber: 'LX1-006',
    purchaseDate: '2023-06-10',
    warrantyExpiry: '2026-06-10',
    department: 'Руководство',
  },
  {
    id: 7,
    name: 'Принтер Canon PIXMA',
    category: 'Периферия',
    location: 'Офис СПБ - IT отдел',
    status: 'На обслуживании',
    manufacturer: 'Canon',
    model: 'PIXMA TS8320',
    serialNumber: 'CP8320-007',
    purchaseDate: '2021-12-01',
    warrantyExpiry: '2024-12-01',
    department: 'IT отдел',
  },
  {
    id: 8,
    name: 'Монитор LG 27"',
    category: 'Мониторы',
    location: 'Офис ПРМ - Кабинет',
    status: 'Активно',
    manufacturer: 'LG',
    model: '27UL850-W',
    serialNumber: 'LG27-008',
    purchaseDate: '2022-09-20',
    warrantyExpiry: '2025-09-20',
    department: 'Отдел продаж',
  },
];

const EquipmentList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [selectedItems, setSelectedItems] = useState<Equipment[]>([]);
  const [bulkOperationsOpen, setBulkOperationsOpen] = useState(false);
  const [bulkActionsOpen, setBulkActionsOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [columnsDialogOpen, setColumnsDialogOpen] = useState(false);
  const [columnPrefs, setColumnPrefs] = useState<ColumnPref[]>(getColumnPrefs());
  const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
  const [joinOperator, setJoinOperator] = useState<'AND' | 'OR'>('AND');
  const [conditions, setConditions] = useState<Array<{ field: string; op: 'eq' | 'neq' | 'contains' | 'ncontains'; value: string }>>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('Все');
  const [bulkActionField, setBulkActionField] = useState<string | null>(null);
  const [bulkActionOperation, setBulkActionOperation] = useState<string | null>(null);
  const [bulkActionValue, setBulkActionValue] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const queryStatus = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('status');
  }, [location.search]);

  React.useEffect(() => {
    if (queryStatus && ['Активно', 'Ремонт', 'На обслуживании', 'Списано'].includes(queryStatus)) {
      setSelectedStatus(queryStatus);
    }
  }, [queryStatus]);

  const categories = ['Все', 'Компьютеры', 'Периферия', 'Мониторы', 'Сетевое оборудование'];
  const statuses = useMemo(() => getStatuses().map(s => s.name), []);
  const locations = ['Офис ПРМ - Склад', 'Офис ПРМ - Кабинет', 'Офис ПРМ - Серверная', 'Офис МСК - Кабинет руководства', 'Офис СПБ - IT отдел'];

  const filteredEquipment = mockEquipment.filter((equipment) => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Все' || equipment.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Все' || equipment.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });
  const filteredWithAdvanced = useMemo(() => applyAdvancedFilters(filteredEquipment), [filteredEquipment, conditions, joinOperator, refreshKey]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Активно':
        return 'success';
      case 'Ремонт':
        return 'warning';
      case 'Списано':
        return 'error';
      default:
        return 'default';
    }
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
      
      // Обновляем mockEquipment напрямую (в реальном приложении здесь будет API вызов)
      if (operation.type === 'status' && operation.value) {
        selectedItems.forEach(item => {
          const index = mockEquipment.findIndex(e => e.id === item.id);
          if (index !== -1) {
            mockEquipment[index].status = operation.value;
          }
        });
      } else if (operation.type === 'location' && operation.value) {
        selectedItems.forEach(item => {
          const index = mockEquipment.findIndex(e => e.id === item.id);
          if (index !== -1) {
            mockEquipment[index].location = operation.value;
          }
        });
      } else if (operation.type === 'category' && operation.value) {
        selectedItems.forEach(item => {
          const index = mockEquipment.findIndex(e => e.id === item.id);
          if (index !== -1) {
            mockEquipment[index].category = operation.value;
          }
        });
      }
      
      // Принудительно обновляем компонент
      setSelectedItems([]);
      setRefreshKey(prev => prev + 1);
      
      addNotification({
        type: 'success',
        title: 'Массовая операция выполнена',
        message: `Операция "${operation.type}" успешно применена к ${selectedItems.length} элементам`,
      });
    } catch (error) {
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

  const availableFields = ['Название', 'Категория', 'Местоположение', 'Статус', 'Производитель', 'Модель', 'Серийный номер', 'Дата покупки', 'Гарантия'];

  const isVisible = (key: EquipmentColumnKey) => columnPrefs.find(c => c.key === key)?.visible !== false;

  const toggleColumn = (key: EquipmentColumnKey) => {
    setColumnPrefs(prev => {
      const next = prev.map(c => c.key === key ? { ...c, visible: !c.visible } : c);
      saveColumnPrefs(next);
      return next;
    });
  };

  const moveColumn = (key: EquipmentColumnKey, direction: 'up' | 'down') => {
    setColumnPrefs(prev => {
      const idx = prev.findIndex(c => c.key === key);
      if (idx < 0) return prev;
      const swapWith = direction === 'up' ? idx - 1 : idx + 1;
      if (swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
      saveColumnPrefs(next);
      return next;
    });
  };

  const orderedVisibleColumns = useMemo(() => columnPrefs.filter(c => c.visible !== false).map(c => c.key), [columnPrefs]);

  function applyAdvancedFilters(items: Equipment[]) {
    if (conditions.length === 0) return items;
    const check = (e: any, cond: typeof conditions[number]) => {
      const fieldMap: any = {
        name: e.name,
        category: e.category,
        location: e.location,
        status: e.status,
        manufacturer: e.manufacturer,
        model: e.model,
        serialNumber: e.serialNumber,
      };
      const left = String(fieldMap[cond.field] ?? '').toLowerCase();
      const right = cond.value.toLowerCase();
      switch (cond.op) {
        case 'eq': return left === right;
        case 'neq': return left !== right;
        case 'contains': return left.includes(right);
        case 'ncontains': return !left.includes(right);
        default: return true;
      }
    };
    return items.filter(e => {
      const results = conditions.map(c => check(e, c));
      return joinOperator === 'AND' ? results.every(Boolean) : results.some(Boolean);
    });
  }

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
      } else if (bulkActionField === 'category') {
        updatedItem.category = bulkActionValue as string;
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
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={(e) => setFilterAnchorEl(e.currentTarget)}
          >
            {selectedCategory}
          </Button>
          <Button variant="outlined" startIcon={<FilterAltIcon />} onClick={() => setFiltersDialogOpen(true)}>
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
          <TextField
            select
            label="Статус"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            SelectProps={{ native: true }}
            sx={{ minWidth: 200 }}
          >
            {['Все', 'Активно', 'Ремонт', 'На обслуживании', 'Списано'].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </TextField>
        </Box>
      </Paper>

      <Dialog open={columnsDialogOpen} onClose={() => setColumnsDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Настройка столбцов</DialogTitle>
        <DialogContent>
          <MList>
            {(['invNumber','name','department','category','status','location','manufacturer','model','serialNumber','purchaseDate','warrantyExpiry','budget','comment','supplier','project','user'] as EquipmentColumnKey[]).map((key) => (
              <MListItem key={key} secondaryAction={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton size="small" onClick={() => moveColumn(key, 'up')}><ArrowUpwardIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => moveColumn(key, 'down')}><ArrowDownwardIcon fontSize="small" /></IconButton>
                </Box>
              }>
                <MListItemIcon>
                  <Checkbox edge="start" checked={isVisible(key)} onChange={() => toggleColumn(key)} />
                </MListItemIcon>
                <MListItemText primary={
                  key==='invNumber'?'Инв номер':
                  key==='name'?'Название':
                  key==='department'?'Департамент':
                  key==='category'?'Категория':
                  key==='status'?'Статус':
                  key==='location'?'Местоположение':
                  key==='manufacturer'?'Производитель':
                  key==='model'?'Модель':
                  key==='serialNumber'?'Серийный номер':
                  key==='purchaseDate'?'Дата покупки':
                  key==='warrantyExpiry'?'Гарантия до':
                  key==='budget'?'Бюджет':
                  key==='comment'?'Комментарий':
                  key==='supplier'?'Поставщик':
                  key==='project'?'Проект':'Пользователь'
                } />
              </MListItem>
            ))}
          </MList>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColumnsDialogOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={filtersDialogOpen} onClose={() => setFiltersDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Расширенные фильтры</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <Typography variant="body2">Объединение условий:</Typography>
            <Button variant={joinOperator==='AND'?'contained':'outlined'} size="small" onClick={() => setJoinOperator('AND')}>И (AND)</Button>
            <Button variant={joinOperator==='OR'?'contained':'outlined'} size="small" onClick={() => setJoinOperator('OR')}>ИЛИ (OR)</Button>
            <Box sx={{ flexGrow: 1 }} />
            <Button size="small" onClick={() => setConditions([])}>Сбросить</Button>
          </Box>
          {conditions.map((c, idx) => (
            <Box key={idx} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                select
                size="small"
                label="Поле"
                value={c.field}
                onChange={(e) => setConditions(prev => prev.map((x,i)=> i===idx?{...x, field: e.target.value}:x))}
                sx={{ minWidth: 180 }}
                SelectProps={{ native: true }}
              >
                {['name','category','location','status','manufacturer','model','serialNumber'].map(f => (
                  <option value={f} key={f}>{
                    f==='name'?'Название': f==='category'?'Категория': f==='location'?'Местоположение': f==='status'?'Статус': f==='manufacturer'?'Производитель': f==='model'?'Модель':'Серийный номер'
                  }</option>
                ))}
              </TextField>
              <TextField
                select
                size="small"
                label="Условие"
                value={c.op}
                onChange={(e) => setConditions(prev => prev.map((x,i)=> i===idx?{...x, op: e.target.value as any}:x))}
                sx={{ minWidth: 160 }}
                SelectProps={{ native: true }}
              >
                <option value="eq">Равно</option>
                <option value="neq">Не равно</option>
                <option value="contains">Содержит</option>
                <option value="ncontains">Не содержит</option>
              </TextField>
              {c.op === 'eq' ? (
                <TextField
                  select
                  size="small"
                  label="Значение"
                  value={c.value}
                  onChange={(e) => setConditions(prev => prev.map((x,i)=> i===idx?{...x, value: e.target.value}:x))}
                  sx={{ minWidth: 220 }}
                  SelectProps={{ native: true }}
                >
                  {c.field === 'category' && categories.filter(cat => cat !== 'Все').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  {c.field === 'status' && statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                  {c.field === 'location' && locations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                  {c.field === 'manufacturer' && ['Dell', 'HP', 'Lenovo', 'Samsung', 'Cisco', 'Canon', 'LG'].map(man => (
                    <option key={man} value={man}>{man}</option>
                  ))}
                  {c.field === 'model' && ['Latitude 5520', 'LaserJet Pro M404n', 'S24F350', 'Catalyst 2960', 'ProLiant DL380', 'ThinkPad X1 Carbon', 'PIXMA TS8320', '27UL850-W'].map(mod => (
                    <option key={mod} value={mod}>{mod}</option>
                  ))}
                  {c.field === 'name' && (
                    <option value="">Введите вручную</option>
                  )}
                  {c.field === 'serialNumber' && (
                    <option value="">Введите вручную</option>
                  )}
                </TextField>
              ) : (
                <TextField
                  size="small"
                  label="Значение"
                  value={c.value}
                  onChange={(e) => setConditions(prev => prev.map((x,i)=> i===idx?{...x, value: e.target.value}:x))}
                  sx={{ minWidth: 220 }}
                />
              )}
              <Button size="small" color="error" onClick={() => setConditions(prev => prev.filter((_,i)=>i!==idx))}>Удалить</Button>
            </Box>
          ))}
          <Button size="small" onClick={() => setConditions(prev => [...prev, { field: 'name', op: 'contains', value: '' }])}>Добавить условие</Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFiltersDialogOpen(false)} variant="contained">Готово</Button>
        </DialogActions>
      </Dialog>

      {/* Меню фильтров */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
      >
        {categories.map((category) => (
          <MenuItem
            key={category}
            onClick={() => {
              setSelectedCategory(category);
              setFilterAnchorEl(null);
            }}
          >
            {category}
          </MenuItem>
        ))}
      </Menu>

      {/* Таблица оборудования */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
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
                  <TableCell key={key} sx={{ fontWeight: key==='invNumber'?700:600 }}>
                    {
                      key==='invNumber'?'Инв номер':
                      key==='name'?'Название':
                      key==='department'?'Департамент':
                      key==='category'?'Категория':
                      key==='status'?'Статус':
                      key==='location'?'Местоположение':
                      key==='manufacturer'?'Производитель':
                      key==='model'?'Модель':
                      key==='serialNumber'?'Серийный номер':
                      key==='purchaseDate'?'Дата покупки':
                      key==='warrantyExpiry'?'Гарантия до':
                      key==='budget'?'Бюджет':
                      key==='comment'?'Комментарий':
                      key==='supplier'?'Поставщик':'Проект/Пользователь'
                    }
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 600 }}>Действия</TableCell>
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
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>{equipment.serialNumber}</Typography>
                        )}
                        {key === 'name' && (
                          <Box>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 500, cursor: 'pointer', '&:hover': { color: 'primary.main', textDecoration: 'underline' } }}
                              onClick={() => navigate(`/equipment/${equipment.id}`)}
                            >
                              {equipment.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{equipment.model}</Typography>
                          </Box>
                        )}
                        {key === 'department' && equipment.department}
                        {key === 'category' && (<Chip label={equipment.category} size="small" variant="outlined" />)}
                        {key === 'status' && (
                          <Chip label={equipment.status} color={getStatusColor(equipment.status) as any} size="small" />
                        )}
                        {key === 'location' && equipment.location}
                        {key === 'manufacturer' && equipment.manufacturer}
                        {key === 'model' && equipment.model}
                        {key === 'serialNumber' && (
                          <Typography variant="body2" fontFamily="monospace">{equipment.serialNumber}</Typography>
                        )}
                        {key === 'purchaseDate' && equipment.purchaseDate}
                        {key === 'warrantyExpiry' && equipment.warrantyExpiry}
                        {key === 'budget' && '—'}
                        {key === 'comment' && '—'}
                        {key === 'supplier' && '—'}
                        {key === 'project' && '—'}
                        {key === 'user' && '—'}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Редактировать">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/equipment/edit/${equipment.id}`)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Просмотреть">
                          <IconButton 
                            size="small" 
                            color="info"
                            onClick={() => navigate(`/equipment/${equipment.id}`)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>

                      </Box>
                    </TableCell>
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
        availableCategories={categories.filter(c => c !== 'Все')}
      />

      {/* Экспорт данных */}
      <ExportData
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        onExport={handleExport}
        availableFields={availableFields}
        categories={categories.filter(c => c !== 'Все')}
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
                <MenuItem value="category">Категория</MenuItem>
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
                    {bulkActionField === 'department' && ['IT отдел', 'Отдел продаж', 'Бухгалтерия', 'HR отдел', 'Руководство'].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                    {bulkActionField === 'category' && categories.filter(c => c !== 'Все').map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
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
