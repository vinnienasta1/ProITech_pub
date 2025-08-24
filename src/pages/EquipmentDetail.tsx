import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
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
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { Equipment } from '../types/equipment';
import { getEquipment, updateEquipmentByInventoryNumber } from '../storage/equipmentStorage';
import { getEntities } from '../storage/entitiesStorage';
import { getStatuses } from '../storage/statusStorage';
import { useActionLog } from '../contexts/ActionLogContext';

const EquipmentDetail: React.FC = () => {
  const { inventoryNumber } = useParams<{ inventoryNumber: string }>();
  const { addAction } = useActionLog();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [editData, setEditData] = useState<Equipment | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const entities = getEntities();
  const statuses = getStatuses();

  useEffect(() => {
    if (inventoryNumber) {
      const allEquipment = getEquipment();
      const foundEquipment = allEquipment.find((eq: Equipment) => eq.inventoryNumber === inventoryNumber);
      if (foundEquipment) {
        setEquipment(foundEquipment);
        setEditData({ ...foundEquipment });
      }
    }
  }, [inventoryNumber]);

  // Проверяем изменения
  useEffect(() => {
    if (equipment && editData) {
      const changed = JSON.stringify(equipment) !== JSON.stringify(editData);
      setHasChanges(changed);
    }
  }, [equipment, editData]);

  const handleInputChange = useCallback((field: keyof Equipment, value: any) => {
    if (editData) {
      setEditData(prev => prev ? { ...prev, [field]: value } : null);
    }
  }, [editData]);

  const handleSave = useCallback(async () => {
    if (editData && inventoryNumber) {
      try {
        const updatedEquipment = updateEquipmentByInventoryNumber(inventoryNumber, editData);
        if (updatedEquipment) {
          setEquipment(updatedEquipment);
          setEditData({ ...updatedEquipment });
          setHasChanges(false);
          setSaveSuccess(true);

          // Создаем подробное описание изменений
          const changes = [];
          if (equipment && editData) {
            if (equipment.name !== editData.name) changes.push(`наименование: "${equipment.name}" → "${editData.name}"`);
            if (equipment.type !== editData.type) changes.push(`тип: "${equipment.type}" → "${editData.type}"`);
            if (equipment.department !== editData.department) changes.push(`департамент: "${equipment.department}" → "${editData.department}"`);
            if (equipment.user !== editData.user) changes.push(`пользователь: "${equipment.user}" → "${editData.user}"`);
            if (equipment.status !== editData.status) changes.push(`статус: "${equipment.status}" → "${editData.status}"`);
            if (equipment.location !== editData.location) changes.push(`местоположение: "${equipment.location}" → "${editData.location}"`);
            if (equipment.rack !== editData.rack) changes.push(`стеллаж: "${equipment.rack}" → "${editData.rack}"`);
            if (equipment.manufacturer !== editData.manufacturer) changes.push(`производитель: "${equipment.manufacturer}" → "${editData.manufacturer}"`);
            if (equipment.model !== editData.model) changes.push(`модель: "${equipment.model}" → "${editData.model}"`);
            if (equipment.comment !== editData.comment) changes.push(`комментарий: "${equipment.comment}" → "${editData.comment}"`);
            if (equipment.purchaseDate !== editData.purchaseDate) changes.push(`дата закупки: "${equipment.purchaseDate}" → "${editData.purchaseDate}"`);
            if (equipment.cost !== editData.cost) changes.push(`стоимость: ${equipment.cost} → ${editData.cost}`);
            if (equipment.supplier !== editData.supplier) changes.push(`поставщик: "${equipment.supplier}" → "${editData.supplier}"`);
            if (equipment.contractNumber !== editData.contractNumber) changes.push(`номер договора: "${equipment.contractNumber}" → "${editData.contractNumber}"`);
            if (equipment.invoiceNumber !== editData.invoiceNumber) changes.push(`номер счета: "${equipment.invoiceNumber}" → "${editData.invoiceNumber}"`);
            if (equipment.project !== editData.project) changes.push(`проект: "${equipment.project}" → "${editData.project}"`);
            if (equipment.warrantyMonths !== editData.warrantyMonths) changes.push(`гарантия: ${equipment.warrantyMonths} → ${editData.warrantyMonths} месяцев`);
          }
          
          const description = changes.length > 0 
            ? `Обновлено оборудование "${editData.name}" (${editData.inventoryNumber}). Изменения: ${changes.join(', ')}`
            : `Обновлено оборудование "${editData.name}" (${editData.inventoryNumber})`;

          // Добавляем действие в лог
          addAction({
            type: 'update',
            description,
            entityType: 'Оборудование',
            entityId: editData.inventoryNumber,
            oldData: equipment,
            newData: editData,
            canUndo: true,
          });

          // Показываем уведомление
          if (window.notificationSystem) {
            window.notificationSystem.addNotification({
              type: 'success',
              title: 'Сохранено',
              message: `Оборудование "${editData.name}" успешно обновлено`,
            });
          }

          setTimeout(() => setSaveSuccess(false), 3000);
        }
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
        if (window.notificationSystem) {
          window.notificationSystem.addNotification({
            type: 'error',
            title: 'Ошибка',
            message: 'Не удалось сохранить изменения',
          });
        }
      }
    }
  }, [editData, inventoryNumber, equipment, addAction]);

  if (!equipment || !editData) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4">Оборудование не найдено</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Заголовок и кнопка сохранения */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Карточка оборудования
        </Typography>
        <Button
          variant="contained"
          color={hasChanges ? 'success' : 'primary'}
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={!hasChanges}
          sx={{
            backgroundColor: hasChanges ? 'success.main' : 'action.disabledBackground',
            '&:hover': {
              backgroundColor: hasChanges ? 'success.dark' : 'action.disabledBackground',
            },
          }}
        >
          Сохранить
        </Button>
      </Box>

      {saveSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Изменения успешно сохранены!
        </Alert>
      )}

      {/* Блок 1: Основная информация */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon color="primary" />
          Основная информация
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <TextField
            fullWidth
            label="Инвентарный номер"
            value={editData.inventoryNumber}
            onChange={(e) => handleInputChange('inventoryNumber', e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Тип</InputLabel>
            <Select
              value={editData.type}
              label="Тип"
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
            value={editData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Департамент</InputLabel>
            <Select
              value={editData.department || ''}
              label="Департамент"
              onChange={(e) => handleInputChange('department', e.target.value)}
            >
              {entities.departments?.map((dept) => (
                <MenuItem key={dept.id} value={dept.name}>
                  {dept.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Пользователь</InputLabel>
            <Select
              value={editData.user || ''}
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
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Статус</InputLabel>
            <Select
              value={editData.status || ''}
              label="Статус"
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
          <FormControl fullWidth margin="normal">
            <InputLabel>Местоположение</InputLabel>
            <Select
              value={editData.location || ''}
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
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Стеллаж</InputLabel>
            <Select
              value={editData.rack || ''}
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
            value={editData.manufacturer || ''}
            onChange={(e) => handleInputChange('manufacturer', e.target.value)}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Модель"
            value={editData.model || ''}
            onChange={(e) => handleInputChange('model', e.target.value)}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Комментарий"
            value={editData.comment || ''}
            onChange={(e) => handleInputChange('comment', e.target.value)}
            margin="normal"
            multiline
            rows={3}
            sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
          />
        </Box>
      </Paper>

      {/* Блок 2: Финансовая информация */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon color="primary" />
          Финансовая информация
        </Typography>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <TextField
            fullWidth
            label="Дата закупки"
            type="date"
            value={editData.purchaseDate || ''}
            onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            label="Стоимость"
            type="number"
            value={editData.cost || ''}
            onChange={(e) => handleInputChange('cost', e.target.value)}
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Поставщик</InputLabel>
            <Select
              value={editData.supplier || ''}
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
            label="Номер договора"
            value={editData.contractNumber || ''}
            onChange={(e) => handleInputChange('contractNumber', e.target.value)}
            margin="normal"
          />
          
          <TextField
            fullWidth
            label="Номер счета"
            value={editData.invoiceNumber || ''}
            onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Проект</InputLabel>
            <Select
              value={editData.project || ''}
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
            value={editData.warrantyMonths || ''}
            onChange={(e) => handleInputChange('warrantyMonths', e.target.value)}
            margin="normal"
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Прикрепить документы:
            </Typography>
            <Tooltip title="Прикрепить документы">
              <IconButton color="primary" size="large">
                <AttachFileIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Блок 3: История изменений */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon color="primary" />
          История изменений
        </Typography>
        
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          {equipment.updatedAt && (
            <Box sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Последнее обновление: {new Date(equipment.updatedAt).toLocaleString('ru-RU')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Создано: {new Date(equipment.createdAt).toLocaleString('ru-RU')}
              </Typography>
            </Box>
          )}
          
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            История изменений будет отображаться здесь
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default EquipmentDetail;
