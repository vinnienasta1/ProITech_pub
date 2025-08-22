import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  History as HistoryIcon,
  Print as PrintIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import AutocompleteSelect from '../components/AutocompleteSelect';
import { getEntities } from '../storage/entitiesStorage';
import { getStatuses } from '../storage/statusStorage';
import { getEquipmentById, updateEquipment } from '../storage/equipmentStorage';
import JsBarcode from 'jsbarcode';

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

  const [editData, setEditData] = useState<Equipment>({ ...mockEquipment });
  const barcodeRef = useRef<SVGSVGElement>(null);


  // Вычисляем hasChanges через useMemo
  const hasChanges = useMemo(() => {
    if (!equipment || !editData) return false;
    
    const equipmentJson = JSON.stringify(equipment);
    const editDataJson = JSON.stringify(editData);
    const changed = equipmentJson !== editDataJson;
    
    return changed;
  }, [equipment, editData]);



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
    if (id) {
      const loadedEquipment = getEquipmentById(id);
      if (loadedEquipment) {
        setEquipment(loadedEquipment);
        setEditData({ ...loadedEquipment }); // Создаем копию объекта
      } else {
        setEquipment(mockEquipment);
        setEditData({ ...mockEquipment });
      }
    } else {
      setEquipment(mockEquipment);
      setEditData({ ...mockEquipment });
    }
  }, [id]);





  const handleInputChange = useCallback((field: keyof Equipment, value: any) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = useCallback(() => {
    if (!id) {
      return;
    }
    
    // Сохраняем изменения в базу данных
    const updatedEquipment = updateEquipment(id, editData);
    
    if (updatedEquipment) {
      // Обновляем локальное состояние
      setEquipment(updatedEquipment);
      setEditData({ ...updatedEquipment });
      
      // Показываем уведомление о сохранении
      if (window.notificationSystem) {
        window.notificationSystem.addNotification({
          type: 'success',
          title: 'Сохранено',
          message: 'Изменения в карточке оборудования успешно сохранены',
        });
      }
    } else {
      // Показываем уведомление об ошибке
      if (window.notificationSystem) {
        window.notificationSystem.addNotification({
          type: 'error',
          title: 'Ошибка',
          message: 'Не удалось сохранить изменения в карточке оборудования',
        });
      }
    }
  }, [editData, id]);

  const isRackFieldEnabled = (editData.location?.toLowerCase().includes('склад') || equipment.location?.toLowerCase().includes('склад'));

  // Генерация штрих-кода
  useEffect(() => {
    if (barcodeRef.current && equipment.inventoryNumber) {
      try {
        JsBarcode(barcodeRef.current, equipment.inventoryNumber, {
          format: 'CODE128',
          width: 2,
          height: 60,
          displayValue: true,
          fontSize: 14,
          margin: 10,
        });
      } catch (error) {
        console.error('Ошибка генерации штрих-кода:', error);
      }
    }
  }, [equipment.inventoryNumber]);

  // Функция печати карточки
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Карточка оборудования</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              margin: 20px; 
              font-size: 12px;
              line-height: 1.4;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #333; 
              padding-bottom: 10px; 
            }
            .equipment-info { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 15px; 
              margin-bottom: 20px; 
            }
            .info-group { 
              border: 1px solid #ccc; 
              padding: 10px; 
              border-radius: 5px; 
            }
            .info-group h3 { 
              margin: 0 0 10px 0; 
              color: #333; 
              font-size: 14px; 
            }
            .info-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 5px; 
            }
            .label { 
              font-weight: bold; 
              color: #666; 
            }
            .value { 
              color: #333; 
            }
            .barcode { 
              text-align: center; 
              margin: 20px 0; 
            }
            .barcode svg { 
              max-width: 100%; 
              height: auto; 
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; color: #333;">${equipment.name}</h1>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">${equipment.type} • ${equipment.manufacturer} ${equipment.model}</p>
          </div>
          
          <div class="equipment-info">
            <div class="info-group">
              <h3>Основная информация</h3>
              <div class="info-row">
                <span class="label">Наименование:</span>
                <span class="value">${equipment.name}</span>
              </div>
              <div class="info-row">
                <span class="label">Тип:</span>
                <span class="value">${equipment.type}</span>
              </div>
              <div class="info-row">
                <span class="label">Департамент:</span>
                <span class="value">${equipment.department}</span>
              </div>
              <div class="info-row">
                <span class="label">Статус:</span>
                <span class="value">${equipment.status}</span>
              </div>
              <div class="info-row">
                <span class="label">Пользователь:</span>
                <span class="value">${equipment.user}</span>
              </div>
              <div class="info-row">
                <span class="label">Местоположение:</span>
                <span class="value">${equipment.location}</span>
              </div>
            </div>
            
            <div class="info-group">
              <h3>Технические характеристики</h3>
              <div class="info-row">
                <span class="label">Производитель:</span>
                <span class="value">${equipment.manufacturer}</span>
              </div>
              <div class="info-row">
                <span class="label">Модель:</span>
                <span class="value">${equipment.model}</span>
              </div>
              <div class="info-row">
                <span class="label">Серийный номер:</span>
                <span class="value">${equipment.serialNumber}</span>
              </div>
              <div class="info-row">
                <span class="label">IP адрес:</span>
                <span class="value">${equipment.ipAddress || 'Не указан'}</span>
              </div>
              <div class="info-row">
                <span class="label">MAC адрес:</span>
                <span class="value">${equipment.macAddress || 'Не указан'}</span>
              </div>
              <div class="info-row">
                <span class="label">ОС:</span>
                <span class="value">${equipment.os || 'Не указана'}</span>
              </div>
            </div>
          </div>
          
          <div class="equipment-info">
            <div class="info-group">
              <h3>Финансовая информация</h3>
              <div class="info-row">
                <span class="label">Дата приобретения:</span>
                <span class="value">${equipment.purchaseDate}</span>
              </div>
              <div class="info-row">
                <span class="label">Стоимость:</span>
                <span class="value">${equipment.cost} ₽</span>
              </div>
              <div class="info-row">
                <span class="label">Бюджет:</span>
                <span class="value">${equipment.budget || 'Не указан'} ₽</span>
              </div>
              <div class="info-row">
                <span class="label">Гарантия:</span>
                <span class="value">${equipment.warrantyMonths} мес.</span>
              </div>
              <div class="info-row">
                <span class="label">Поставщик:</span>
                <span class="value">${equipment.supplier}</span>
              </div>
              <div class="info-row">
                <span class="label">Проект:</span>
                <span class="value">${equipment.project}</span>
              </div>
            </div>
            
            <div class="info-group">
              <h3>Дополнительно</h3>
              <div class="info-row">
                <span class="label">Комментарий:</span>
                <span class="value">${equipment.comment || 'Не указан'}</span>
              </div>
              <div class="info-row">
                <span class="label">Стеллаж:</span>
                <span class="value">${equipment.rack || 'Не указан'}</span>
              </div>
              <div class="info-row">
                <span class="label">Последнее обслуживание:</span>
                <span class="value">${equipment.lastMaintenance || 'Не указано'}</span>
              </div>
              <div class="info-row">
                <span class="label">Следующее обслуживание:</span>
                <span class="value">${equipment.nextMaintenance || 'Не указано'}</span>
              </div>
            </div>
          </div>
          
          <div class="barcode">
            <h3>Штрих-код</h3>
            <div id="barcode-container"></div>
            <p><strong>Инвентарный номер: ${equipment.inventoryNumber}</strong></p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 10px;">
            <p>Дата печати: ${new Date().toLocaleDateString('ru-RU')}</p>
            <p>Время печати: ${new Date().toLocaleTimeString('ru-RU')}</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      
      // Генерируем штрих-код в окне печати
      setTimeout(() => {
        const barcodeContainer = printWindow.document.getElementById('barcode-container');
        if (barcodeContainer && equipment.inventoryNumber) {
          try {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            JsBarcode(svg, equipment.inventoryNumber, {
              format: 'CODE128',
              width: 2,
              height: 60,
              displayValue: true,
              fontSize: 14,
              margin: 10,
            });
            barcodeContainer.appendChild(svg);
          } catch (error) {
            console.error('Ошибка генерации штрих-кода для печати:', error);
          }
        }
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1000);
      }, 500);
    }
  };

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
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={!hasChanges}
            sx={{ 
              backgroundColor: hasChanges ? 'success.main' : 'grey.400',
              color: 'white',
              '&:hover': {
                backgroundColor: hasChanges ? 'success.dark' : 'grey.500',
              }
            }}
          >
            Сохранить {hasChanges ? '(Есть изменения)' : '(Нет изменений)'}
          </Button>
          

          
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handlePrint}
            sx={{ backgroundColor: 'primary.light', color: 'primary.contrastText' }}
          >
            Печать
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
            value={editData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            sx={{ 
              '& .MuiInputBase-input': {
                color: 'text.primary',
                fontWeight: 'normal'
              }
            }}
          />
          
          <AutocompleteSelect
            value={editData.type}
            onChange={(value) => handleInputChange('type', value)}
            options={typeOptions}
            label="Тип техники"
            required
          />
        </Box>

        {/* Второй ряд - департамент и статус */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
          <AutocompleteSelect
            value={editData.department}
            onChange={(value) => handleInputChange('department', value)}
            options={departmentOptions}
            label="Департамент"
            required
          />
          
          <AutocompleteSelect
            value={editData.status}
            onChange={(value) => handleInputChange('status', value)}
            options={statusOptions}
            label="Статус"
            required
          />
        </Box>

        {/* Третий ряд - пользователь и местоположение */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
          <TextField
            fullWidth
            label="Пользователь"
            value={editData.user}
            onChange={(e) => handleInputChange('user', e.target.value)}
          />
          
          <AutocompleteSelect
            value={editData.location}
            onChange={(value) => handleInputChange('location', value)}
            options={locationOptions}
            label="Местоположение"
            required
          />
        </Box>

        {/* Четвертый ряд - стеллаж и производитель */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
          <AutocompleteSelect
            value={editData.rack || ''}
            onChange={(value) => handleInputChange('rack', value)}
            options={rackOptions}
            label="Стеллаж"
            disabled={!isRackFieldEnabled}
            helperText={!isRackFieldEnabled ? 'Доступно только для местоположения со словом «Склад»' : ''}
          />
          
          <TextField
            fullWidth
            label="Производитель"
            value={editData.manufacturer}
            onChange={(e) => handleInputChange('manufacturer', e.target.value)}
            required
          />
        </Box>

        {/* Пятый ряд - модель и инвентарный номер */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, mb: 3 }}>
          <TextField
            fullWidth
            label="Модель"
            value={editData.model}
            onChange={(e) => handleInputChange('model', e.target.value)}
            required
          />
          
          <TextField
            fullWidth
            label="Инвентарный номер"
            value={editData.inventoryNumber}
            onChange={(e) => handleInputChange('inventoryNumber', e.target.value)}
            required
          />
        </Box>

        {/* Шестой ряд - серийный номер и комментарий */}
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 3 }}>
          <TextField
            fullWidth
            label="Серийный номер"
            value={editData.serialNumber}
            onChange={(e) => handleInputChange('serialNumber', e.target.value)}
            required
          />
          
          <TextField
            fullWidth
            label="Комментарий"
            value={editData.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
            multiline
            rows={3}
          />
        </Box>

        {/* Седьмой ряд - штрих-код */}
        <Box sx={{ mt: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, backgroundColor: 'background.paper' }}>
          <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
            Штрих-код для печати
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ 
              border: '1px solid', 
              borderColor: 'divider', 
              borderRadius: 1, 
              p: 2, 
              backgroundColor: 'white',
              minHeight: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg ref={barcodeRef} />
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Инвентарный номер: <strong className="monospace-text">{equipment.inventoryNumber}</strong>
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Используйте кнопку "Печать" для создания печатной версии карточки
              </Typography>
            </Box>
          </Box>
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
              value={editData.purchaseDate}
              onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <AutocompleteSelect
              value={editData.supplier}
              onChange={(value) => handleInputChange('supplier', value)}
              options={supplierOptions}
              label="Поставщик"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              fullWidth
              label="Номер счета"
              value={editData.invoiceNumber}
              onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              fullWidth
              label="Номер договора"
              value={editData.contractNumber}
              onChange={(e) => handleInputChange('contractNumber', e.target.value)}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              fullWidth
              label="Стоимость"
              type="number"
              value={editData.cost}
              onChange={(e) => handleInputChange('cost', Number(e.target.value))}
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
              value={editData.budget || ''}
              onChange={(e) => handleInputChange('budget', Number(e.target.value))}
              InputProps={{
                endAdornment: <Typography variant="body2">₽</Typography>,
              }}
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <AutocompleteSelect
              value={editData.project}
              onChange={(value) => handleInputChange('project', value)}
              options={projectOptions}
              label="Проект"
            />
          </Box>
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <TextField
              fullWidth
              label="Гарантия (месяцев)"
              type="number"
              value={editData.warrantyMonths}
              onChange={(e) => handleInputChange('warrantyMonths', Number(e.target.value))}
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


    </Box>
  );
};

export default EquipmentDetail;
