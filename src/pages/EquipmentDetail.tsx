import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import AutocompleteSelect from '../components/AutocompleteSelect';
import { getEntities } from '../storage/entitiesStorage';
import { getStatuses } from '../storage/statusStorage';

interface Equipment {
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
}

interface HistoryItem {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  timestamp: Date;
  comment?: string;
}

const mockEquipment: Equipment = {
  id: '1',
  name: 'Ноутбук Dell Latitude 5520',
  type: 'Компьютеры',
  department: 'IT отдел',
  status: 'Активно',
  user: 'Иванов Иван Иванович',
  location: 'Офис ПРМ - Склад',
  manufacturer: 'Dell',
  model: 'Latitude 5520',
  inventoryNumber: 'INV-2024-001',
  serialNumber: 'DL5520-001',
  comment: 'Корпоративный ноутбук для разработки',
  purchaseDate: '2024-01-15',
  supplier: 'ООО "ТехноСервис"',
  invoiceNumber: 'INV-2024-001',
  contractNumber: 'CON-2024-001',
  cost: 45000,
  project: 'Оцифровка документов',
  warrantyMonths: 24,
  rack: 'A-12',
  budget: 50000,
  description: 'Мощный ноутбук для разработчиков',
  tags: ['разработка', 'корпоративный'],
  ipAddress: '192.168.1.100',
  macAddress: '00:1B:44:11:3A:B7',
  os: 'Windows 11 Pro',
  lastMaintenance: '2024-06-15',
  nextMaintenance: '2024-12-15',
};

const mockHistory: HistoryItem[] = [
  {
    id: '1',
    field: 'Статус',
    oldValue: 'На обслуживании',
    newValue: 'Активно',
    changedBy: 'Администратор',
    timestamp: new Date('2024-08-19T10:00:00'),
    comment: 'Оборудование прошло обслуживание',
  },
  {
    id: '2',
    field: 'Пользователь',
    oldValue: 'Петров П.П.',
    newValue: 'Иванов И.И.',
    changedBy: 'HR отдел',
    timestamp: new Date('2024-08-15T14:30:00'),
    comment: 'Передача оборудования новому сотруднику',
  },
  {
    id: '3',
    field: 'Местоположение',
    oldValue: 'Офис 205',
    newValue: 'Офис 301',
    changedBy: 'Администратор',
    timestamp: new Date('2024-08-10T09:15:00'),
    comment: 'Перемещение в новый офис',
  },
  {
    id: '4',
    field: 'Комментарий',
    oldValue: 'Требует обновления',
    newValue: 'Корпоративный ноутбук для разработки',
    changedBy: 'IT отдел',
    timestamp: new Date('2024-08-05T16:45:00'),
  },
];

const EquipmentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [equipment, setEquipment] = useState<Equipment>(mockEquipment);
  const [history] = useState<HistoryItem[]>(mockHistory);
  const [editMode, setEditMode] = useState(true); // Автоматически входим в режим редактирования
  const [editData, setEditData] = useState<Equipment>(equipment);

  // Получаем данные из хранилища
  const entities = useMemo(() => getEntities(), []);
  const statuses = useMemo(() => getStatuses(), []);

  // Подготавливаем опции для выпадающих списков
  const typeOptions = useMemo(() => entities.types.map(t => t.name), [entities.types]);
  const departmentOptions = useMemo(() => entities.departments.map(d => d.name), [entities.departments]);
  const statusOptions = useMemo(() => statuses.map(s => s.name), [statuses]);
  const locationOptions = useMemo(() => entities.locations.map(l => l.fullPath), [entities.locations]);
  const supplierOptions = useMemo(() => entities.suppliers.map(s => s.name), [entities.suppliers]);
  const projectOptions = useMemo(() => entities.projects.map(p => p.name), [entities.projects]);
  const rackOptions = useMemo(() => entities.shelves.map(s => s.name), [entities.shelves]);

  useEffect(() => {
    // Здесь будет загрузка данных по ID
    // Загрузка оборудования с ID: ${id}
  }, [id]);

  const handleEdit = () => {
    setEditData({ ...equipment });
    setEditMode(true);
  };

  const handleSave = () => {
    setEquipment(editData);
    setEditMode(false);
    // Здесь будет логика сохранения
    // Сохранение изменений
  };

  const handleCancel = () => {
    setEditData(equipment);
    setEditMode(false);
  };

  const handleInputChange = (field: keyof Equipment, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const isRackFieldEnabled = editMode && (editData.location?.toLowerCase().includes('склад') || equipment.location?.toLowerCase().includes('склад'));

  return (
    <Box>
      {/* Заголовок */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/equipment')}
          sx={{ mr: 2 }}
        >
          Назад
        </Button>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            {equipment.name}
          </Typography>
          <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 500, mt: 1 }}>
            Редактирование
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            disabled={editMode}
          >
            Редактировать
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Удалить
          </Button>
        </Box>
      </Box>

      {/* Основная информация */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'primary.main' }}>
          Основная информация
        </Typography>
        
        <Box sx={{ 
          '& .MuiTextField-root .MuiInputBase-input': {
            color: 'text.primary !important',
            fontWeight: '500 !important'
          },
          '& .MuiAutocomplete-root .MuiInputBase-input': {
            color: 'text.primary !important',
            fontWeight: '500 !important'
          }
        }}>
        
        {/* Первый ряд - название и тип */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 3, mb: 3 }}>
          <TextField
            fullWidth
            label="Наименование"
            value={editMode ? editData.name : equipment.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            disabled={!editMode}
            required
            sx={{ 
              '& .MuiInputBase-input': {
                color: editMode ? 'text.primary' : 'text.primary',
                fontWeight: editMode ? 'normal' : '500'
              }
            }}
          />
          
          <AutocompleteSelect
            value={editMode ? editData.type : equipment.type}
            onChange={(value) => handleInputChange('type', value)}
            options={typeOptions}
            label="Тип техники"
            disabled={!editMode}
            required
          />
        </Box>

        {/* Второй ряд - департамент и статус */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
          <AutocompleteSelect
            value={editMode ? editData.department : equipment.department}
            onChange={(value) => handleInputChange('department', value)}
            options={departmentOptions}
            label="Департамент"
            disabled={!editMode}
            required
          />
          
          <AutocompleteSelect
            value={editMode ? editData.status : equipment.status}
            onChange={(value) => handleInputChange('status', value)}
            options={statusOptions}
            label="Статус"
            disabled={!editMode}
            required
          />
        </Box>

        {/* Третий ряд - пользователь и местоположение */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
          <TextField
            fullWidth
            label="Пользователь"
            value={editMode ? editData.user : equipment.user}
            onChange={(e) => handleInputChange('user', e.target.value)}
            disabled={!editMode}
          />
          
          <AutocompleteSelect
            value={editMode ? editData.location : equipment.location}
            onChange={(value) => handleInputChange('location', value)}
            options={locationOptions}
            label="Местоположение"
            disabled={!editMode}
            required
          />
        </Box>

        {/* Четвертый ряд - стеллаж и производитель */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
          <AutocompleteSelect
            value={editMode ? (editData.rack || '') : (equipment.rack || '')}
            onChange={(value) => handleInputChange('rack', value)}
            options={rackOptions}
            label="Стеллаж"
            disabled={!isRackFieldEnabled}
            helperText={!isRackFieldEnabled && editMode ? 'Доступно только для местоположения со словом «Склад»' : ''}
          />
          
          <TextField
            fullWidth
            label="Производитель"
            value={editMode ? editData.manufacturer : equipment.manufacturer}
            onChange={(e) => handleInputChange('manufacturer', e.target.value)}
            disabled={!editMode}
            required
          />
        </Box>

        {/* Пятый ряд - модель и инвентарный номер */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
          <TextField
            fullWidth
            label="Модель"
            value={editMode ? editData.model : equipment.model}
            onChange={(e) => handleInputChange('model', e.target.value)}
            disabled={!editMode}
            required
          />
          
          <TextField
            fullWidth
            label="Инвентарный номер"
            value={editMode ? editData.inventoryNumber : equipment.inventoryNumber}
            onChange={(e) => handleInputChange('inventoryNumber', e.target.value)}
            disabled={!editMode}
            required
          />
        </Box>

        {/* Шестой ряд - серийный номер и комментарий */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 3 }}>
          <TextField
            fullWidth
            label="Серийный номер"
            value={editMode ? editData.serialNumber : equipment.serialNumber}
            onChange={(e) => handleInputChange('serialNumber', e.target.value)}
            disabled={!editMode}
            required
          />
          
          <TextField
            fullWidth
            label="Комментарий"
            value={editMode ? editData.comment : equipment.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
            disabled={!editMode}
            multiline
            rows={3}
          />
        </Box>
        </Box>
      </Paper>

      {/* Финансовая информация */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
          Финансовая информация
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              fullWidth
              label="Дата приобретения"
              type="date"
              value={editMode ? editData.purchaseDate : equipment.purchaseDate}
              onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
              disabled={!editMode}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <AutocompleteSelect
              value={editMode ? editData.supplier : equipment.supplier}
              onChange={(value) => handleInputChange('supplier', value)}
              options={supplierOptions}
              label="Поставщик"
              disabled={!editMode}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              fullWidth
              label="Номер счета"
              value={editMode ? editData.invoiceNumber : equipment.invoiceNumber}
              onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              disabled={!editMode}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              fullWidth
              label="Номер договора"
              value={editMode ? editData.contractNumber : equipment.contractNumber}
              onChange={(e) => handleInputChange('contractNumber', e.target.value)}
              disabled={!editMode}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              fullWidth
              label="Стоимость"
              type="number"
              value={editMode ? editData.cost : equipment.cost}
              onChange={(e) => handleInputChange('cost', Number(e.target.value))}
              disabled={!editMode}
              InputProps={{
                endAdornment: <Typography variant="body2">₽</Typography>,
              }}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              fullWidth
              label="Бюджет"
              type="number"
              value={editMode ? (editData.budget || '') : (equipment.budget || '')}
              onChange={(e) => handleInputChange('budget', Number(e.target.value))}
              disabled={!editMode}
              InputProps={{
                endAdornment: <Typography variant="body2">₽</Typography>,
              }}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <AutocompleteSelect
              value={editMode ? editData.project : equipment.project}
              onChange={(value) => handleInputChange('project', value)}
              options={projectOptions}
              label="Проект"
              disabled={!editMode}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              fullWidth
              label="Гарантия (месяцев)"
              type="number"
              value={editMode ? editData.warrantyMonths : equipment.warrantyMonths}
              onChange={(e) => handleInputChange('warrantyMonths', Number(e.target.value))}
              disabled={!editMode}
            />
          </Box>
        </Box>
      </Paper>

      {/* История изменений */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
          История изменений
        </Typography>
        <List>
          {history.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem alignItems="flex-start">
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <HistoryIcon />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {item.field}
                      </Typography>
                      <Chip
                        label={`${item.oldValue} → ${item.newValue}`}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Изменил: {item.changedBy} • {item.timestamp.toLocaleString('ru-RU')}
                      </Typography>
                      {item.comment && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Комментарий: {item.comment}
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
              {index < history.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* Кнопки редактирования */}
      {editMode && (
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
          <Button variant="outlined" onClick={handleCancel}>
            Отмена
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Сохранить изменения
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default EquipmentDetail;
