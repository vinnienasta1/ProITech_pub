import React, { useState, useEffect } from 'react';
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
  FormHelperText,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';

interface EquipmentFormData {
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
  cost: string;
  project: string;
  warrantyMonths: string;
}

const mockEquipmentTypes = ['Компьютеры', 'Периферия', 'Мониторы', 'Сетевое оборудование', 'Серверы'];
const mockDepartments = ['IT отдел', 'Отдел продаж', 'Бухгалтерия', 'HR отдел'];
const mockStatuses = ['Активно', 'Ремонт', 'Списано', 'На обслуживании', 'Резерв'];
const mockLocations = ['Офис ПРМ - Склад', 'Офис ПРМ - Кабинет', 'Офис ПРМ - Серверная', 'Офис МСК - Кабинет руководства', 'Офис МСК - Конференц-зал', 'Офис СПБ - IT отдел'];
const mockSuppliers = ['ООО "ТехноСервис"', 'ООО "КомпьютерМир"', 'ООО "Электроника+"'];
const mockProjects = ['Оцифровка документов', 'Обновление серверов', 'Внедрение CRM', 'Модернизация сети'];

const EquipmentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<EquipmentFormData>({
    name: '',
    type: '',
    department: '',
    status: '',
    user: '',
    location: '',
    manufacturer: '',
    model: '',
    inventoryNumber: '',
    serialNumber: '',
    comment: '',
    purchaseDate: '',
    supplier: '',
    invoiceNumber: '',
    contractNumber: '',
    cost: '',
    project: '',
    warrantyMonths: '',
  });

  const [errors, setErrors] = useState<Partial<EquipmentFormData>>({});

  useEffect(() => {
    if (isEditing) {
      // Здесь будет загрузка данных для редактирования
      // Загрузка данных для редактирования
    }
  }, [id, isEditing]);

  const handleInputChange = (field: keyof EquipmentFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<EquipmentFormData> = {};

    if (!formData.name.trim()) newErrors.name = 'Название обязательно';
    if (!formData.type) newErrors.type = 'Тип техники обязателен';
    if (!formData.department) newErrors.department = 'Департамент обязателен';
    if (!formData.status) newErrors.status = 'Статус обязателен';
    if (!formData.location.trim()) newErrors.location = 'Местоположение обязательно';
    if (!formData.manufacturer.trim()) newErrors.manufacturer = 'Производитель обязателен';
    if (!formData.model.trim()) newErrors.model = 'Модель обязательна';
    if (!formData.inventoryNumber.trim()) newErrors.inventoryNumber = 'Инвентарный номер обязателен';
    if (!formData.serialNumber.trim()) newErrors.serialNumber = 'Серийный номер обязателен';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Отправка формы
    // Здесь будет логика сохранения
    
    navigate('/equipment');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/equipment')}
          sx={{ mr: 2 }}
        >
          Назад к списку
        </Button>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          {isEditing ? 'Редактировать оборудование' : 'Добавить оборудование'}
        </Typography>
      </Box>

      <Paper sx={{ p: 4 }}>
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Основная информация */}
            <Box sx={{ width: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                Основная информация
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Наименование"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={Boolean(errors.name)}
                  helperText={errors.name}
                  required
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <FormControl fullWidth error={Boolean(errors.type)} required>
                  <InputLabel>Тип техники</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    label="Тип техники"
                  >
                    {mockEquipmentTypes.map((type) => (
                      <MenuItem key={type} value={type}>{type}</MenuItem>
                    ))}
                  </Select>
                  {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <FormControl fullWidth error={Boolean(errors.department)} required>
                  <InputLabel>Департамент</InputLabel>
                  <Select
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    label="Департамент"
                  >
                    {mockDepartments.map((dept) => (
                      <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                    ))}
                  </Select>
                  {errors.department && <FormHelperText>{errors.department}</FormHelperText>}
                </FormControl>
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <FormControl fullWidth error={Boolean(errors.status)} required>
                  <InputLabel>Статус</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    label="Статус"
                  >
                    {mockStatuses.map((status) => (
                      <MenuItem key={status} value={status}>{status}</MenuItem>
                    ))}
                  </Select>
                  {errors.status && <FormHelperText>{errors.status}</FormHelperText>}
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Пользователь"
                  value={formData.user}
                  onChange={(e) => handleInputChange('user', e.target.value)}
                  placeholder="ФИО пользователя"
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <FormControl fullWidth error={Boolean(errors.location)} required>
                  <InputLabel>Местоположение</InputLabel>
                  <Select
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    label="Местоположение"
                  >
                    {mockLocations.map((location) => (
                      <MenuItem key={location} value={location}>{location}</MenuItem>
                    ))}
                  </Select>
                  {errors.location && <FormHelperText>{errors.location}</FormHelperText>}
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Производитель"
                  value={formData.manufacturer}
                  onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                  error={Boolean(errors.manufacturer)}
                  helperText={errors.manufacturer}
                  required
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Модель"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  error={Boolean(errors.model)}
                  helperText={errors.model}
                  required
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Инвентарный номер"
                  value={formData.inventoryNumber}
                  onChange={(e) => handleInputChange('inventoryNumber', e.target.value)}
                  error={Boolean(errors.inventoryNumber)}
                  helperText={errors.inventoryNumber}
                  required
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Серийный номер"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  error={Boolean(errors.serialNumber)}
                  helperText={errors.serialNumber}
                  required
                />
              </Box>
            </Box>

            <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
              <TextField
                fullWidth
                label="Комментарий"
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                multiline
                rows={4}
                placeholder="Дополнительная информация об оборудовании..."
              />
            </Box>

            {/* Финансовая информация */}
            <Box sx={{ width: '100%' }}>
              <Box sx={{ borderTop: '1px solid', borderColor: 'divider', my: 2, pt: 2 }} />
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                Финансовая информация
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Дата приобретения"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <FormControl fullWidth>
                  <InputLabel>Поставщик</InputLabel>
                  <Select
                    value={formData.supplier}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    label="Поставщик"
                  >
                    {mockSuppliers.map((supplier) => (
                      <MenuItem key={supplier} value={supplier}>{supplier}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Номер счета"
                  value={formData.invoiceNumber}
                  onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Номер договора"
                  value={formData.contractNumber}
                  onChange={(e) => handleInputChange('contractNumber', e.target.value)}
                />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Стоимость"
                  type="number"
                  value={formData.cost}
                  onChange={(e) => handleInputChange('cost', e.target.value)}
                  InputProps={{
                    endAdornment: <Typography variant="body2">₽</Typography>,
                  }}
                />
              </Box>

              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <FormControl fullWidth>
                  <InputLabel>Проект</InputLabel>
                  <Select
                    value={formData.project}
                    onChange={(e) => handleInputChange('project', e.target.value)}
                    label="Проект"
                  >
                    {mockProjects.map((project) => (
                      <MenuItem key={project} value={project}>{project}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
                <TextField
                  fullWidth
                  label="Гарантия (месяцев)"
                  type="number"
                  value={formData.warrantyMonths}
                  onChange={(e) => handleInputChange('warrantyMonths', e.target.value)}
                  inputProps={{ min: 0, max: 120 }}
                />
              </Box>
            </Box>

            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/equipment')}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                >
                  {isEditing ? 'Сохранить изменения' : 'Добавить оборудование'}
                </Button>
              </Box>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default EquipmentForm;