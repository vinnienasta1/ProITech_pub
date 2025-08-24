import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { getStatuses } from '../storage/statusStorage';
import { getEntities } from '../storage/entitiesStorage';

export interface DashboardButton {
  id: string;
  title: string;
  type: 'navigation' | 'filter' | 'action';
  icon: string;
  color: string;
  target: string;
  filterValue?: string;
  actionType?: string;
  // Новые поля для сложной фильтрации
  filters?: FilterCondition[];
}

export interface FilterCondition {
  field: string;
  operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'in_list' | 'not_equals';
  value: string;
  operatorBetween: 'AND' | 'OR';
}

interface DashboardConstructorProps {
  open: boolean;
  onClose: () => void;
  onSave: (buttons: DashboardButton[]) => void;
  currentButtons: DashboardButton[];
}

const availableIcons = [
  { value: 'inventory', label: 'Оборудование', icon: <InventoryIcon /> },
  { value: 'check', label: 'Активное', icon: <CheckCircleIcon /> },
  { value: 'warning', label: 'Ремонт', icon: <WarningIcon /> },
  { value: 'schedule', label: 'Обслуживание', icon: <ScheduleIcon /> },
  { value: 'location', label: 'Местоположение', icon: <LocationIcon /> },
  { value: 'person', label: 'Пользователь', icon: <PersonIcon /> },
  { value: 'business', label: 'Департамент', icon: <BusinessIcon /> },
  { value: 'category', label: 'Тип', icon: <CategoryIcon /> },
];

const availableColors = [
  { value: 'primary.main', label: 'Основной' },
  { value: 'success.main', label: 'Успех' },
  { value: 'warning.main', label: 'Предупреждение' },
  { value: 'error.main', label: 'Ошибка' },
  { value: 'info.main', label: 'Информация' },
  { value: 'secondary.main', label: 'Вторичный' },
];

const availableOperators = [
  { value: 'equals', label: 'Равно' },
  { value: 'not_equals', label: 'Не равно' },
  { value: 'contains', label: 'Содержит' },
  { value: 'starts_with', label: 'Начинается с' },
  { value: 'ends_with', label: 'Заканчивается на' },
  { value: 'greater_than', label: 'Больше чем' },
  { value: 'less_than', label: 'Меньше чем' },
  { value: 'in_list', label: 'В списке' },
];

const availableFields = [
  { value: 'status', label: 'Статус' },
  { value: 'department', label: 'Департамент' },
  { value: 'location', label: 'Местоположение' },
  { value: 'type', label: 'Тип оборудования' },
  { value: 'manufacturer', label: 'Производитель' },
  { value: 'model', label: 'Модель' },
  { value: 'user', label: 'Пользователь' },
  { value: 'supplier', label: 'Поставщик' },
  { value: 'project', label: 'Проект' },
  { value: 'rack', label: 'Стеллаж' },
  { value: 'purchaseDate', label: 'Дата покупки' },
  { value: 'cost', label: 'Стоимость' },
  { value: 'warrantyMonths', label: 'Гарантия (месяцы)' },
];

const DashboardConstructor: React.FC<DashboardConstructorProps> = ({
  open,
  onClose,
  onSave,
  currentButtons,
}) => {
  const [buttons, setButtons] = useState<DashboardButton[]>(currentButtons);
  const [editingButton, setEditingButton] = useState<DashboardButton | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Получаем динамические данные для фильтров
  const statuses = useMemo(() => getStatuses().map(s => s.name), []);
  const entities = useMemo(() => getEntities(), []);
  
  // Хардкод массивы как в EquipmentList.tsx
  const types = ['Компьютеры', 'Периферия', 'Мониторы', 'Сетевое оборудование', 'Серверы'];
  const locations = ['Офис ПРМ - Склад', 'Офис ПРМ - Кабинет', 'Офис ПРМ - Серверная', 'Офис МСК - Кабинет руководства', 'Офис СПБ - IT отдел'];
  const manufacturers = ['Dell', 'HP', 'Lenovo', 'Samsung', 'Cisco', 'Canon', 'LG'];
  const models = ['Latitude 5520', 'LaserJet Pro M404n', 'S24F350', 'Catalyst 2960', 'ProLiant DL380', 'ThinkPad X1 Carbon', 'PIXMA TS8320', '27UL850-W'];

  // Динамические массивы из entities
  const departments = useMemo(() => entities?.departments?.map(d => d.name) || [], [entities]);
  const users = useMemo(() => entities?.users?.map(u => u.name) || [], [entities]);
  const suppliers = useMemo(() => entities?.suppliers?.map(s => s.name) || [], [entities]);
  const projects = useMemo(() => entities?.projects?.map(p => p.name) || [], [entities]);
  const shelves = useMemo(() => entities?.shelves?.map(s => s.name) || [], [entities]);

  // Функция для получения доступных опций для конкретного поля
  const getFieldOptions = (fieldName: string): string[] => {
    switch (fieldName) {
      case 'status':
        return statuses;
      case 'department':
        return departments;
      case 'location':
        return locations;
      case 'type':
        return types;
      case 'manufacturer':
        return manufacturers;
      case 'model':
        return models;
      case 'user':
        return users;
      case 'supplier':
        return suppliers;
      case 'project':
        return projects;
      case 'rack':
        return shelves;
      default:
        return [];
    }
  };

  useEffect(() => {
    setButtons(currentButtons);
  }, [currentButtons]);

  const handleAddButton = () => {
    const newButton: DashboardButton = {
      id: `btn_${Date.now()}`,
      title: 'Новая кнопка',
      type: 'navigation',
      icon: 'category', // Используем более подходящую иконку по умолчанию
      color: 'primary.main',
      target: '/equipment',
      filters: [],
    };
    setButtons([...buttons, newButton]);
    setEditingButton(newButton);
    setIsEditing(true);
  };

  const handleEditButton = (button: DashboardButton) => {
    setEditingButton(button);
    setIsEditing(true);
  };

  const handleDeleteButton = (buttonId: string) => {
    setButtons(buttons.filter(btn => btn.id !== buttonId));
  };

  const handleSaveButton = () => {
    if (editingButton) {
      setButtons(buttons.map(btn => 
        btn.id === editingButton.id ? editingButton : btn
      ));
      setEditingButton(null);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingButton(null);
    setIsEditing(false);
  };

  const handleAddFilter = () => {
    if (editingButton) {
      const newFilter: FilterCondition = {
        field: 'status',
        operator: 'equals',
        value: '',
        operatorBetween: 'AND',
      };
      setEditingButton({
        ...editingButton,
        filters: [...(editingButton.filters || []), newFilter],
      });
    }
  };

  const handleRemoveFilter = (filterIndex: number) => {
    if (editingButton && editingButton.filters) {
      const newFilters = editingButton.filters.filter((_, index) => index !== filterIndex);
      setEditingButton({
        ...editingButton,
        filters: newFilters,
      });
    }
  };

  const handleFilterChange = (filterIndex: number, field: keyof FilterCondition, value: string) => {
    if (editingButton && editingButton.filters) {
      const newFilters = editingButton.filters.map((filter, index) => 
        index === filterIndex ? { ...filter, [field]: value } : filter
      );
      setEditingButton({
        ...editingButton,
        filters: newFilters,
      });
    }
  };

  const handleSaveAll = () => {
    onSave(buttons);
    onClose();
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactElement } = {
      inventory: <InventoryIcon />,
      check: <CheckCircleIcon />,
      warning: <WarningIcon />,
      schedule: <ScheduleIcon />,
      location: <LocationIcon />,
      person: <PersonIcon />,
      business: <BusinessIcon />,
      category: <CategoryIcon />,
    };
    
    // Проверяем, есть ли иконка в карте
    if (iconMap[iconName]) {
      return iconMap[iconName];
    }
    
    // Если иконка не найдена, возвращаем иконку по умолчанию
    console.warn(`Иконка "${iconName}" не найдена, используется иконка по умолчанию`);
    return <CategoryIcon />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Конструктор дашборда
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Кнопки дашборда
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddButton}
            >
              Добавить кнопку
            </Button>
          </Box>

          <Alert severity="info" sx={{ mb: 2 }}>
            Настройте кнопки дашборда для быстрого доступа к различным разделам системы
          </Alert>

          <List>
            {buttons.map((button, index) => (
              <ListItem
                key={button.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: 'background.paper',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                  <Box
                    sx={{
                      color: button.color,
                      mr: 2,
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {getIconComponent(button.icon)}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {button.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {button.type === 'navigation' ? `Переход: ${button.target}` : 
                       button.type === 'filter' ? (
                         button.filters && button.filters.length > 0 
                           ? `Фильтры: ${button.filters.length} условие(й)`
                           : 'Фильтр не настроен'
                       ) : 
                       `Действие: ${button.actionType}`}
                    </Typography>
                  </Box>
                </Box>
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEditButton(button)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteButton(button.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Редактирование кнопки */}
        {isEditing && editingButton && (
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Редактирование кнопки
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <TextField
                label="Название кнопки"
                value={editingButton.title}
                onChange={(e) => setEditingButton({ ...editingButton, title: e.target.value })}
                fullWidth
              />
              
              <FormControl fullWidth>
                <InputLabel>Тип кнопки</InputLabel>
                <Select
                  value={editingButton.type}
                  onChange={(e) => setEditingButton({ ...editingButton, type: e.target.value as any })}
                  label="Тип кнопки"
                >
                  <MenuItem value="navigation">Навигация</MenuItem>
                  <MenuItem value="filter">Фильтр</MenuItem>
                  <MenuItem value="action">Действие</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Иконка</InputLabel>
                <Select
                  value={editingButton.icon}
                  onChange={(e) => setEditingButton({ ...editingButton, icon: e.target.value })}
                  label="Иконка"
                >
                  {availableIcons.map((icon) => (
                    <MenuItem key={icon.value} value={icon.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {icon.icon}
                        {icon.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Цвет</InputLabel>
                <Select
                  value={editingButton.color}
                  onChange={(e) => setEditingButton({ ...editingButton, color: e.target.value })}
                  label="Цвет"
                >
                  {availableColors.map((color) => (
                    <MenuItem key={color.value} value={color.value}>
                      <Chip
                        label={color.label}
                        sx={{ backgroundColor: color.value, color: 'white' }}
                        size="small"
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {editingButton.type === 'navigation' && (
              <TextField
                label="Целевая страница"
                value={editingButton.target}
                onChange={(e) => setEditingButton({ ...editingButton, target: e.target.value })}
                fullWidth
                sx={{ mb: 2 }}
                placeholder="/equipment, /inventory, /administration"
              />
            )}

            {editingButton.type === 'filter' && (
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Условия фильтрации
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={handleAddFilter}
                  >
                    Добавить условие
                  </Button>
                </Box>

                {editingButton.filters && editingButton.filters.length > 0 ? (
                  <Box sx={{ space: 2 }}>
                    {editingButton.filters.map((filter, index) => (
                      <Box
                        key={index}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          p: 2,
                          mb: 2,
                          backgroundColor: 'background.paper',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            Условие {index + 1}
                          </Typography>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveFilter(index)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, mb: 2 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Поле</InputLabel>
                            <Select
                              value={filter.field}
                              onChange={(e) => handleFilterChange(index, 'field', e.target.value)}
                              label="Поле"
                            >
                              {availableFields.map((field) => (
                                <MenuItem key={field.value} value={field.value}>
                                  {field.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControl fullWidth size="small">
                            <InputLabel>Оператор</InputLabel>
                            <Select
                              value={filter.operator}
                              onChange={(e) => handleFilterChange(index, 'operator', e.target.value)}
                              label="Оператор"
                            >
                              {availableOperators.map((op) => (
                                <MenuItem key={op.value} value={op.value}>
                                  {op.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          {/* Поле для значения - выпадающий список или текстовое поле */}
                          {getFieldOptions(filter.field).length > 0 ? (
                            <FormControl fullWidth size="small">
                              <InputLabel>Значение</InputLabel>
                              <Select
                                value={filter.value}
                                onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                                label="Значение"
                              >
                                {getFieldOptions(filter.field).map((option) => (
                                  <MenuItem key={option} value={option}>
                                    {option}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            <TextField
                              label="Значение"
                              value={filter.value}
                              onChange={(e) => handleFilterChange(index, 'value', e.target.value)}
                              size="small"
                              placeholder="Введите значение..."
                            />
                          )}
                        </Box>

                        {editingButton.filters && index < editingButton.filters.length - 1 && (
                          <FormControl fullWidth size="small">
                            <InputLabel>Связка с следующим условием</InputLabel>
                            <Select
                              value={filter.operatorBetween}
                              onChange={(e) => handleFilterChange(index, 'operatorBetween', e.target.value)}
                              label="Связка с следующим условием"
                            >
                              <MenuItem value="AND">И (AND)</MenuItem>
                              <MenuItem value="OR">ИЛИ (OR)</MenuItem>
                            </Select>
                          </FormControl>
                        )}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    Фильтры не настроены. Нажмите "Добавить условие" для настройки.
                  </Typography>
                )}
              </Box>
            )}

            {editingButton.type === 'action' && (
              <TextField
                label="Тип действия"
                value={editingButton.actionType || ''}
                onChange={(e) => setEditingButton({ ...editingButton, actionType: e.target.value })}
                fullWidth
                sx={{ mb: 2 }}
                placeholder="export, print, refresh"
              />
            )}

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button onClick={handleCancelEdit} variant="outlined">
                Отмена
              </Button>
              <Button onClick={handleSaveButton} variant="contained" startIcon={<SaveIcon />}>
                Сохранить кнопку
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined">
          Отмена
        </Button>
        <Button onClick={handleSaveAll} variant="contained" color="primary">
          Сохранить дашборд
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DashboardConstructor;
