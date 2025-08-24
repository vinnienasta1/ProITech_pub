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
  Alert,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
} from '@mui/material';
import {
  Save as SaveIcon,
  AttachFile as AttachFileIcon,
  History as HistoryIcon,
  Add as AddIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import { Equipment } from '../types/equipment';
import { getEquipment, updateEquipmentByInventoryNumber } from '../storage/equipmentStorage';
import { getEntities } from '../storage/entitiesStorage';
import { getStatuses } from '../storage/statusStorage';
import { useActionLog } from '../contexts/ActionLogContext';

const EquipmentDetail: React.FC = () => {
  const { inventoryNumber } = useParams<{ inventoryNumber: string }>();
  const { addAction, actions } = useActionLog();

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [editData, setEditData] = useState<Equipment | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Состояние для обслуживания
  const [maintenanceRecords, setMaintenanceRecords] = useState<Array<{
  id: string;
    date: string;
    work: string;
    ticketLink: string;
    performedBy: string;
  comment: string;
  }>>([]);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [newMaintenanceRecord, setNewMaintenanceRecord] = useState({
    date: new Date().toISOString().split('T')[0],
    work: '',
    ticketLink: '',
    performedBy: '',
    comment: ''
  });

  const entities = getEntities();
  const statuses = getStatuses();

  useEffect(() => {
    if (inventoryNumber) {
      const allEquipment = getEquipment();
      const foundEquipment = allEquipment.find((eq: Equipment) => eq.inventoryNumber === inventoryNumber);
      if (foundEquipment) {
        setEquipment(foundEquipment);
        setEditData({ ...foundEquipment });
        // Загружаем записи об обслуживании
        setMaintenanceRecords((foundEquipment as any).maintenanceRecords || []);
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
            
            // Проверяем изменения в записях об обслуживании
            const equipmentMaintenanceCount = (equipment as any).maintenanceRecords?.length || 0;
            const editDataMaintenanceCount = editData.maintenanceRecords?.length || 0;
            if (equipmentMaintenanceCount !== editDataMaintenanceCount) {
              if (editDataMaintenanceCount > equipmentMaintenanceCount) {
                const addedCount = editDataMaintenanceCount - equipmentMaintenanceCount;
                changes.push(`добавлено ${addedCount} записей об обслуживании`);
              } else if (editDataMaintenanceCount < equipmentMaintenanceCount) {
                const removedCount = equipmentMaintenanceCount - editDataMaintenanceCount;
                changes.push(`удалено ${removedCount} записей об обслуживании`);
              }
            }
          }
          
          const description = changes.length > 0 
            ? `Обновлено оборудование "${editData.name}" (${editData.inventoryNumber}). Изменения: ${changes.join(', ')}`
            : `Обновлено оборудование "${editData.name}" (${editData.inventoryNumber})`;

          // Добавляем действие в лог
          addAction({
            type: 'update',
            description,
            entityType: 'Оборудование',
            entityId: inventoryNumber,
            oldData: equipment,
            newData: editData,
            canUndo: true,
            user: editData.user || 'Неизвестный пользователь'
          });
        }
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
      }
    }
  }, [editData, inventoryNumber, equipment, addAction]);

  // Функции для работы с обслуживанием
  const handleAddMaintenanceRecord = useCallback(() => {
    if (newMaintenanceRecord.work.trim() && newMaintenanceRecord.performedBy.trim()) {
      const record = {
        ...newMaintenanceRecord,
        id: Date.now().toString()
      };
      const updatedRecords = [record, ...maintenanceRecords];
      setMaintenanceRecords(updatedRecords);
      
      // Обновляем editData, чтобы записи об обслуживании сохранились при сохранении карточки
      if (editData) {
        setEditData(prev => prev ? { ...prev, maintenanceRecords: updatedRecords } : null);
      }
      
      // Сбрасываем форму
      setNewMaintenanceRecord({
        date: new Date().toISOString().split('T')[0],
        work: '',
        ticketLink: '',
        performedBy: '',
        comment: ''
      });
      setMaintenanceDialogOpen(false);
    }
  }, [newMaintenanceRecord, maintenanceRecords, editData]);

  const handleMaintenanceInputChange = useCallback((field: string, value: string) => {
    setNewMaintenanceRecord(prev => ({ ...prev, [field]: value }));
  }, []);

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Typography variant="h4" component="h1">
            {equipment.name}
          </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
          {/* Кнопка сохранения */}
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
          
          {/* Информация об остаточной стоимости и гарантии */}
          <Box sx={{ textAlign: 'right' }}>
            {/* КРИТИЧЕСКАЯ ОБЛАСТЬ: РАСЧЕТ ОСТАТОЧНОЙ СТОИМОСТИ И ГАРАНТИИ
             * ПРИНЦИПЫ РАБОТЫ:
             * 1. Остаточная стоимость рассчитывается по линейной амортизации за 5 лет
             * 2. Гарантия рассчитывается от даты покупки + срок гарантии в месяцах
             * 3. Время в эксплуатации рассчитывается от даты покупки до текущего момента
             * 4. Все расчеты производятся в реальном времени
             * 
             * КРИТИЧЕСКИЕ ФУНКЦИИ:
             * - Расчет амортизации (линейный метод, 5 лет)
             * - Расчет оставшегося срока гарантии
             * - Расчет времени в эксплуатации
             * - Форматирование результатов
             * 
             * ТРЕБОВАНИЯ К ТЕСТИРОВАНИЮ:
             * 1. Проверить корректность расчета амортизации
             * 2. Проверить корректность расчета гарантии
             * 3. Проверить корректность расчета времени в эксплуатации
             * 4. Проверить отображение при отсутствии данных
             * 
             * ЗАПРЕЩЕНО ИЗМЕНЯТЬ:
             * - Формулы расчета без тщательного тестирования
             * - Срок амортизации (5 лет) без обновления документации
             */}
            {/* В эксплуатации */}
            {editData.purchaseDate && (
              <Typography variant="caption" color="text.secondary" display="block">
                В эксплуатации: {(() => {
                  const purchaseDate = new Date(editData.purchaseDate);
                  const now = new Date();
                  const timeDiff = now.getTime() - purchaseDate.getTime();
                  const yearsDiff = timeDiff / (1000 * 60 * 60 * 24 * 365.25);
                  const monthsDiff = timeDiff / (1000 * 60 * 60 * 24 * 30.44);
                  
                  if (yearsDiff < 1) {
                    // Меньше года - показываем только месяцы
                    const months = Math.floor(monthsDiff);
                    return `${months} мес.`;
                  } else {
                    // Больше года - показываем годы и месяцы
                    const years = Math.floor(yearsDiff);
                    const months = Math.floor(monthsDiff % 12);
                    if (months === 0) {
                      return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}`;
                    } else {
                      return `${years} ${years === 1 ? 'год' : years < 5 ? 'года' : 'лет'}, ${months} ${months === 1 ? 'мес' : months < 5 ? 'мес' : 'мес'}.`;
                    }
                  }
                })()}
              </Typography>
            )}
            
            {/* Остаточная стоимость */}
            {editData.cost && editData.purchaseDate && (
              <Typography variant="caption" color="text.secondary" display="block">
                Остаточная стоимость: {(() => {
                  const purchaseDate = new Date(editData.purchaseDate);
                  const now = new Date();
                  const yearsDiff = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                  const depreciationYears = Math.min(yearsDiff, 5); // Максимум 5 лет
                  const depreciationRate = depreciationYears / 5; // Норма амортизации
                  const residualValue = Math.max(0, editData.cost * (1 - depreciationRate));
                  return `${Math.round(residualValue)} ₽`;
                })()}
              </Typography>
            )}
            
            {/* Гарантия */}
            {editData.warrantyMonths && editData.purchaseDate && (
              <Typography variant="caption" color="text.secondary" display="block">
                Гарантия: {(() => {
                  const purchaseDate = new Date(editData.purchaseDate);
                  const warrantyEndDate = new Date(purchaseDate);
                  warrantyEndDate.setMonth(warrantyEndDate.getMonth() + editData.warrantyMonths);
                  const now = new Date();
                  
                  if (now > warrantyEndDate) {
                    return 'Истекла';
                  } else {
                    const remainingMonths = Math.ceil((warrantyEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
                    return `Осталось ${remainingMonths} мес.`;
                  }
                })()}
              </Typography>
            )}
          </Box>
        </Box>
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
            InputProps={{
              endAdornment: editData.comment && editData.comment.length > 50 && (
                <Tooltip 
                  title={editData.comment}
                  placement="top"
                  arrow
                >
                  <Box sx={{ cursor: 'help', p: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {editData.comment.length} символов
                    </Typography>
                  </Box>
                </Tooltip>
              )
            }}
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

      {/* Блок 3: Обслуживание */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon color="primary" />
            Обслуживание
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setMaintenanceDialogOpen(true)}
            size="small"
          >
            Добавить информацию
          </Button>
        </Box>
        
        {maintenanceRecords.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Записи об обслуживании отсутствуют. Добавьте первую запись.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Дата</TableCell>
                  <TableCell>Работы</TableCell>
                  <TableCell>Ссылка на заявку</TableCell>
                  <TableCell>Выполнил</TableCell>
                  <TableCell>Комментарий</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {maintenanceRecords.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>{new Date(record.date).toLocaleDateString('ru-RU')}</TableCell>
                    <TableCell>{record.work}</TableCell>
                    <TableCell>
                      {record.ticketLink ? (
                        <Link href={record.ticketLink} target="_blank" rel="noopener noreferrer">
                          Заявка
                        </Link>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{record.performedBy}</TableCell>
                    <TableCell>
                      {record.comment ? (
                        <Tooltip 
                          title={record.comment}
                          placement="top"
                          arrow
                        >
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              maxWidth: 150,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              cursor: 'help'
                            }}
                          >
                            {record.comment.length > 30 
                              ? `${record.comment.substring(0, 30)}...` 
                              : record.comment
                            }
                          </Typography>
                        </Tooltip>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Блок 4: История изменений */}
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
          
          {/* 
           * КРИТИЧЕСКАЯ ОБЛАСТЬ: ИСТОРИЯ ИЗМЕНЕНИЙ
           * 
           * ПРИНЦИПЫ РАБОТЫ:
           * 1. История загружается из ActionLog для конкретного оборудования
           * 2. Отображаются все действия с типом 'Оборудование' и соответствующим entityId
           * 3. Каждое действие показывает описание, время и тип
           * 
           * КРИТИЧЕСКИЕ ФУНКЦИИ:
           * - Фильтрация действий по entityType и entityId
           * - Отображение описания изменений
           * - Форматирование времени
           * 
           * ТРЕБОВАНИЯ К ТЕСТИРОВАНИЮ:
           * 1. Проверить, что история отображается после сохранения изменений
           * 2. Проверить, что фильтрация работает корректно
           * 3. Проверить, что время отображается в правильном формате
           * 
           * ЗАПРЕЩЕНО ИЗМЕНЯТЬ:
           * - Логику фильтрации действий без тщательного тестирования
           * - Формат отображения времени без обновления всех связанных мест
           */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
              История изменений карточки:
            </Typography>
            
            {/* Фильтруем действия для текущего оборудования */}
            {(() => {
              const equipmentActions = actions.filter(action => 
                action.entityType === 'Оборудование' && 
                action.entityId === inventoryNumber
              );
              
              if (equipmentActions.length === 0) {
                return (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    История изменений будет отображаться здесь после первого сохранения
                  </Typography>
                );
              }
              
              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {equipmentActions.map((action) => (
                    <Box 
                      key={action.id} 
                      sx={{ 
                        p: 2, 
                        border: '1px solid', 
                        borderColor: 'divider', 
                        borderRadius: 1,
                        backgroundColor: 'background.paper'
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {action.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {action.timestamp.toLocaleString('ru-RU')}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Тип действия: {action.type === 'create' ? 'Создание' : 
                                       action.type === 'update' ? 'Изменение' : 
                                       action.type === 'delete' ? 'Удаление' : action.type}
                      </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Изменил: {action.user || 'Система'}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              );
            })()}
          </Box>
        </Box>
      </Paper>

      {/* Диалог добавления записи об обслуживании */}
      <Dialog 
        open={maintenanceDialogOpen} 
        onClose={() => setMaintenanceDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>Добавить информацию об обслуживании</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, pt: 2 }}>
            <TextField
              fullWidth
              label="Дата"
              type="date"
              value={newMaintenanceRecord.date}
              onChange={(e) => handleMaintenanceInputChange('date', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <InputLabel>Выполнил</InputLabel>
              <Select
                value={newMaintenanceRecord.performedBy}
                label="Выполнил"
                onChange={(e) => handleMaintenanceInputChange('performedBy', e.target.value)}
              >
                {entities.users?.map((user) => (
                  <MenuItem key={user.id} value={user.name}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              fullWidth
              label="Работы"
              value={newMaintenanceRecord.work}
              onChange={(e) => handleMaintenanceInputChange('work', e.target.value)}
              multiline
              rows={2}
              sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}
            />
            
            <TextField
              fullWidth
              label="Ссылка на заявку"
              value={newMaintenanceRecord.ticketLink}
              onChange={(e) => handleMaintenanceInputChange('ticketLink', e.target.value)}
              placeholder="https://..."
              helperText="Вставьте ссылку на заявку в системе"
            />
            
            <TextField
              fullWidth
              label="Комментарий"
              value={newMaintenanceRecord.comment}
              onChange={(e) => handleMaintenanceInputChange('comment', e.target.value)}
              multiline
              rows={2}
              InputProps={{
                endAdornment: newMaintenanceRecord.comment && newMaintenanceRecord.comment.length > 50 && (
                  <Box sx={{ p: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {newMaintenanceRecord.comment.length} символов
                    </Typography>
                  </Box>
                )
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMaintenanceDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleAddMaintenanceRecord} 
            variant="contained"
            disabled={!newMaintenanceRecord.work.trim() || !newMaintenanceRecord.performedBy.trim()}
          >
            Добавить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EquipmentDetail;
