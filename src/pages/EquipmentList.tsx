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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import FilterAltIcon from '@mui/icons-material/FilterAlt';

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

// Получаем данные из хранилища
const equipmentData = getEquipment();

const EquipmentList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addNotification } = useNotifications();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedType, setSelectedType] = useState('Все');
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


  const queryStatus = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('status');
  }, [location.search]);

  React.useEffect(() => {
    if (queryStatus && ['Активно', 'Ремонт', 'На обслуживании', 'Списано'].includes(queryStatus)) {
      setSelectedStatus(queryStatus);
    }
  }, [queryStatus]);

     const types = ['Все', 'Компьютеры', 'Периферия', 'Мониторы', 'Сетевое оборудование', 'Серверы'];
  const statuses = useMemo(() => getStatuses().map(s => s.name), []);
  const locations = ['Офис ПРМ - Склад', 'Офис ПРМ - Кабинет', 'Офис ПРМ - Серверная', 'Офис МСК - Кабинет руководства', 'Офис СПБ - IT отдел'];
  const users = useMemo(() => getEntities().users?.map(u => u.name) || [], []);

  const filteredEquipment = equipmentData.filter((equipment) => {
    const matchesSearch = equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         equipment.inventoryNumber.toLowerCase().includes(searchTerm.toLowerCase());
         const matchesType = selectedType === 'Все' || equipment.type === selectedType;
    const matchesStatus = selectedStatus === 'Все' || equipment.status === selectedStatus;
         return matchesSearch && matchesType && matchesStatus;
  });
  const filteredWithAdvanced = filteredEquipment;

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
      
      // Обновляем данные в хранилище
      if (operation.type === 'status' && operation.value) {
        selectedItems.forEach(item => {
          // Здесь будет обновление в хранилище
          console.log(`Обновление статуса для ${item.id} на ${operation.value}`);
        });
      } else if (operation.type === 'location' && operation.value) {
        selectedItems.forEach(item => {
          // Здесь будет обновление в хранилище
          console.log(`Обновление местоположения для ${item.id} на ${operation.value}`);
        });
             } else if (operation.type === 'type' && operation.value) {
         selectedItems.forEach(item => {
           // Здесь будет обновление в хранилище
           console.log(`Обновление типа для ${item.id} на ${operation.value}`);
         });
       }
      
      // Принудительно обновляем компонент
      setSelectedItems([]);
      
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

  const availableFields = ['Название', 'Тип', 'Местоположение', 'Статус', 'Производитель', 'Модель', 'Серийный номер', 'Инвентарный номер', 'Дата покупки', 'Гарантия', 'Департамент', 'Комментарий', 'Поставщик', 'Проект', 'Пользователь'];

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
                         {selectedType}
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
                         {(['invNumber','type','name','department','status','location','manufacturer','model','serialNumber','purchaseDate','warrantyExpiry','budget','comment','supplier','project','user'] as EquipmentColumnKey[]).map((key) => (
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
                                 {['name','type','location','status','manufacturer','model','serialNumber'].map(f => (
                   <option value={f} key={f}>{
                     f==='name'?'Название': f==='type'?'Тип': f==='location'?'Местоположение': f==='status'?'Статус': f==='manufacturer'?'Производитель': f==='model'?'Модель':'Серийный номер'
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
                 {types.map((type) => (
           <MenuItem
             key={type}
             onClick={() => {
               setSelectedType(type);
               setFilterAnchorEl(null);
             }}
           >
             {type}
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
                      key==='invNumber'?'Инв. номер':
                      key==='type'?'Тип':
                      key==='name'?'Название':
                      key==='department'?'Департамент':
   
                      key==='status'?'Статус':
                      key==='location'?'Местоположение':
                      key==='manufacturer'?'Производитель':
                      key==='model'?'Модель':
                      key==='serialNumber'?'Серийный номер':
                      key==='purchaseDate'?'Дата покупки':
                      key==='warrantyExpiry'?'Гарантия (мес.)':
                      key==='budget'?'Стоимость':
                      key==='comment'?'Комментарий':
                      key==='supplier'?'Поставщик':
                      key==='project'?'Проект':
                      key==='user'?'Пользователь':''
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
                          <Typography variant="body1" sx={{ fontWeight: 700 }}>
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
                             onClick={() => navigate(`/equipment/${equipment.id}`)}
                           >
                             {equipment.name}
                           </Typography>
                         ) : ''}
                        {key === 'department' && equipment.department}
                        
                        {key === 'status' && equipment.status ? (
                          <Chip label={equipment.status} color={getStatusColor(equipment.status) as any} size="small" />
                        ) : ''}
                        {key === 'location' && equipment.location}
                        {key === 'manufacturer' && equipment.manufacturer}
                        {key === 'model' && equipment.model}
                        {key === 'serialNumber' && (
                          <Typography variant="body2" className="monospace-text">
                            {equipment.serialNumber}
                          </Typography>
                        )}
                        {key === 'purchaseDate' && equipment.purchaseDate}
                        {key === 'warrantyExpiry' && equipment.warrantyMonths ? `${equipment.warrantyMonths} мес.` : ''}
                        {key === 'budget' && equipment.cost ? `${equipment.cost} ₽` : ''}
                        {key === 'comment' && equipment.comment}
                        {key === 'supplier' && equipment.supplier}
                        {key === 'project' && equipment.project}
                        {key === 'user' && equipment.user}
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
        availableTypes={types.filter(c => c !== 'Все')}
        availableUsers={users}
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
                    {bulkActionField === 'department' && ['IT отдел', 'Отдел продаж', 'Бухгалтерия', 'HR отдел', 'Руководство'].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
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
