import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import { Save as SaveIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { Equipment } from '../types/equipment';
import { getEquipment, addEquipment, updateEquipmentByInventoryNumber } from '../storage/equipmentStorage';
import { getEntities } from '../storage/entitiesStorage';
import { getStatuses } from '../storage/statusStorage';
import { useActionLog } from '../contexts/ActionLogContext';

const EquipmentForm: React.FC = () => {
  const { inventoryNumber } = useParams<{ inventoryNumber: string }>();
  const navigate = useNavigate();
  const { addAction } = useActionLog();
  
  const isEditing = Boolean(inventoryNumber);
  const [equipmentData, setEquipmentData] = useState<Partial<Equipment>>({
    name: '', type: '', department: '', status: '', user: '', location: '',
    manufacturer: '', model: '', inventoryNumber: '', serialNumber: '', comment: '',
    purchaseDate: '',
    supplier: '', invoiceNumber: '', contractNumber: '', cost: 0, project: '',
    warrantyMonths: 0, rack: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess] = useState(false);

  const entities = getEntities();
  const statuses = getStatuses();

  useEffect(() => {
    if (inventoryNumber) {
      const allEquipment = getEquipment();
      const foundEquipment = allEquipment.find((eq: Equipment) => eq.inventoryNumber === inventoryNumber);
      if (foundEquipment) {
        setEquipmentData(foundEquipment);
      }
    }
  }, [inventoryNumber]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!equipmentData.name?.trim()) {
      newErrors.name = 'Наименование обязательно';
    }
    if (!equipmentData.type?.trim()) {
      newErrors.type = 'Тип обязателен';
    }
    if (!equipmentData.department?.trim()) {
      newErrors.department = 'Департамент обязателен';
    }
    if (!equipmentData.status?.trim()) {
      newErrors.status = 'Статус обязателен';
    }
    if (!equipmentData.inventoryNumber?.trim()) {
      newErrors.inventoryNumber = 'Инвентарный номер обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing && inventoryNumber) {
        // Редактирование существующего оборудования
        const updatedEquipment = updateEquipmentByInventoryNumber(inventoryNumber, equipmentData);
        if (updatedEquipment) {
          // Добавляем действие в лог
          addAction({
            type: 'update',
            description: `Обновлено оборудование "${equipmentData.name}" (${inventoryNumber}) - изменены основные параметры`,
            entityType: 'Оборудование',
            entityId: inventoryNumber,
            oldData: null, // Здесь можно добавить старые данные
            newData: equipmentData,
            canUndo: true,
          });

          // Показываем уведомление
          if (window.notificationSystem) {
            window.notificationSystem.addNotification({
              type: 'success',
              title: 'Обновлено',
              message: `Оборудование "${equipmentData.name}" успешно обновлено`,
            });
          }

          navigate(`/equipment/${inventoryNumber}`);
        }
      } else {
        // Создание нового оборудования
        const newEquipment = addEquipment(equipmentData as Equipment);
        if (newEquipment) {
          // Добавляем действие в лог
          addAction({
            type: 'create',
            description: `Создано новое оборудование "${equipmentData.name}" (${equipmentData.inventoryNumber}) - тип: ${equipmentData.type}, департамент: ${equipmentData.department}, статус: ${equipmentData.status}`,
            entityType: 'Оборудование',
            entityId: newEquipment.inventoryNumber,
            oldData: null,
            newData: newEquipment,
            canUndo: true,
          });

          // Показываем уведомление
          if (window.notificationSystem) {
            window.notificationSystem.addNotification({
              type: 'success',
              title: 'Создано',
              message: `Новое оборудование "${equipmentData.name}" успешно создано`,
            });
          }

          navigate('/equipment');
        }
      }
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      if (window.notificationSystem) {
        window.notificationSystem.addNotification({
          type: 'error',
          title: 'Ошибка',
          message: 'Не удалось сохранить оборудование',
        });
      }
    }
  };

  const handleInputChange = (field: keyof Equipment, value: any) => {
    setEquipmentData(prev => ({ ...prev, [field]: value }));
    // Очищаем ошибку для поля при изменении
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Назад
        </Button>
        <Typography variant="h4" component="h1">
          {isEditing ? 'Редактирование оборудования' : 'Новое оборудование'}
        </Typography>
      </Box>

      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Оборудование успешно {isEditing ? 'обновлено' : 'создано'}!
        </Alert>
      )}

              <form onSubmit={handleSubmit}>
          {/* Блок 1: Основная информация */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Основная информация
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Инвентарный номер"
                value={equipmentData.inventoryNumber || ''}
                onChange={(e) => handleInputChange('inventoryNumber', e.target.value)}
                error={!!errors.inventoryNumber}
                helperText={errors.inventoryNumber}
                required
              />
              <FormControl fullWidth error={!!errors.type}>
                <InputLabel>Тип *</InputLabel>
                <Select
                  value={equipmentData.type || ''}
                  label="Тип *"
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  {entities.types?.map((type) => (
                    <MenuItem key={type.id} value={type.name}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Наименование"
                value={equipmentData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
              <FormControl fullWidth error={!!errors.department}>
                <InputLabel>Департамент *</InputLabel>
                <Select
                  value={equipmentData.department || ''}
                  label="Департамент *"
                  onChange={(e) => handleInputChange('department', e.target.value)}
                >
                  {entities.departments?.map((dept) => (
                    <MenuItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Пользователь</InputLabel>
                <Select
                  value={equipmentData.user || ''}
                  label="Пользователь"
                  onChange={(e) => handleInputChange('user', e.target.value)}
                >
                  {entities.users?.map((user) => (
                    <MenuItem key={user.id} value={user.name}>
                      {user.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel>Статус *</InputLabel>
                <Select
                  value={equipmentData.status || ''}
                  label="Статус *"
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  {statuses.map((status) => (
                    <MenuItem key={status.name} value={status.name}>
                      <Chip
                        label={status.name}
                        color={status.color as any}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      {status.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Местоположение</InputLabel>
                <Select
                  value={equipmentData.location || ''}
                  label="Местоположение"
                  onChange={(e) => handleInputChange('location', e.target.value)}
                >
                  {entities.locations?.map((location) => (
                    <MenuItem key={location.id} value={location.fullPath}>
                      {location.fullPath}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Стеллаж</InputLabel>
                <Select
                  value={equipmentData.rack || ''}
                  label="Стеллаж"
                  onChange={(e) => handleInputChange('rack', e.target.value)}
                >
                  {entities.shelves?.map((shelf) => (
                    <MenuItem key={shelf.id} value={shelf.name}>
                      {shelf.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Производитель"
                value={equipmentData.manufacturer || ''}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
              />
              <TextField
                fullWidth
                label="Модель"
                value={equipmentData.model || ''}
                onChange={(e) => handleInputChange('model', e.target.value)}
              />
              <TextField
                fullWidth
                label="Серийный номер"
                value={equipmentData.serialNumber || ''}
                onChange={(e) => handleInputChange('serialNumber', e.target.value)}
              />
              <TextField
                fullWidth
                label="Комментарий"
                value={equipmentData.comment || ''}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                multiline
                rows={3}
                sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
              />
            </Box>
          </Paper>

          {/* Блок 2: Дополнительная информация */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Дополнительная информация
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Дата закупки"
                type="date"
                value={equipmentData.purchaseDate || ''}
                onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                fullWidth
                label="Стоимость"
                type="number"
                value={equipmentData.cost || ''}
                onChange={(e) => handleInputChange('cost', e.target.value)}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Поставщик</InputLabel>
                <Select
                  value={equipmentData.supplier || ''}
                  label="Поставщик"
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                >
                  {entities.suppliers?.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.name}>
                      {supplier.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Номер счета"
                value={equipmentData.invoiceNumber || ''}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              />
              <TextField
                fullWidth
                label="Номер договора"
                value={equipmentData.contractNumber || ''}
                onChange={(e) => handleInputChange('contractNumber', e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Проект</InputLabel>
                <Select
                  value={equipmentData.project || ''}
                  label="Проект"
                  onChange={(e) => handleInputChange('project', e.target.value)}
                >
                  {entities.projects?.map((project) => (
                    <MenuItem key={project.id} value={project.name}>
                      {project.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Гарантия (месяцев)"
                type="number"
                value={equipmentData.warrantyMonths || ''}
                onChange={(e) => handleInputChange('warrantyMonths', e.target.value)}
                InputProps={{
                  inputProps: { min: 0 }
                }}
              />
            </Box>
          </Paper>

          {/* Кнопки действий */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
            >
              {isEditing ? 'Обновить' : 'Создать'}
            </Button>
          </Box>
        </form>
      </Box>
  );
};

export default EquipmentForm;