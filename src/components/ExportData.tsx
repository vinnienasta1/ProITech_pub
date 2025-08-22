import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  Chip,
  FormControlLabel,
  Checkbox,
  Alert,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
} from '@mui/icons-material';

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeFields: string[];
  dateRange: {
    start: string;
    end: string;
  };
  filters: {
    category?: string;
    status?: string;
    location?: string;
  };
}

interface ExportDataProps {
  open: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => Promise<void>;
  availableFields: string[];
  types: string[];
  statuses: string[];
  locations: string[];
}

const ExportData: React.FC<ExportDataProps> = ({
  open,
  onClose,
  onExport,
  availableFields,
  types,
  statuses,
  locations,
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeFields: availableFields,
    dateRange: {
      start: '',
      end: '',
    },
    filters: {},
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const formatOptions = [
    { value: 'csv', label: 'CSV файл', description: 'Для Excel и других табличных редакторов' },
    { value: 'excel', label: 'Excel файл', description: 'Нативный формат Microsoft Excel' },
    { value: 'pdf', label: 'PDF отчет', description: 'Для печати и архивирования' },
    { value: 'json', label: 'JSON файл', description: 'Для интеграции с другими системами' },
  ];

  const handleFieldToggle = (field: string) => {
    setExportOptions(prev => ({
      ...prev,
      includeFields: prev.includeFields.includes(field)
        ? prev.includeFields.filter(f => f !== field)
        : [...prev.includeFields, field],
    }));
  };

  const handleFilterChange = (filterType: keyof ExportOptions['filters'], value: string) => {
    setExportOptions(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: value || undefined,
      },
    }));
  };

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccess(false);
    
    try {
      await onExport(exportOptions);
      setExportSuccess(true);
      setTimeout(() => {
        onClose();
        setExportSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Ошибка экспорта:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return '📊';
      case 'excel':
        return '📈';
      case 'pdf':
        return '📄';
      case 'json':
        return '🔧';
      default:
        return '📁';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Экспорт данных
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {exportSuccess && (
          <Alert
            icon={<SuccessIcon />}
            severity="success"
            sx={{ mb: 2 }}
          >
            Экспорт успешно завершен! Файл загружен.
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Формат экспорта */}
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Формат файла
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Выберите формат</InputLabel>
              <Select
                value={exportOptions.format}
                onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as any }))}
                label="Выберите формат"
              >
                {formatOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography sx={{ mr: 1, fontSize: '1.2em' }}>
                        {getFormatIcon(option.value)}
                      </Typography>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {option.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.description}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Диапазон дат */}
          <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Диапазон дат
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: '1 1 50%' }}>
                <TextField
                  fullWidth
                  label="С даты"
                  type="date"
                  value={exportOptions.dateRange.start}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box sx={{ flex: '1 1 50%' }}>
                <TextField
                  fullWidth
                  label="По дату"
                  type="date"
                  value={exportOptions.dateRange.end}
                  onChange={(e) => setExportOptions(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>
          </Box>

          {/* Фильтры */}
          <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Фильтры
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
                <FormControl fullWidth>
                  <InputLabel>Категория</InputLabel>
                  <Select
                    value={exportOptions.filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    label="Категория"
                  >
                    <MenuItem value="">Все категории</MenuItem>
                    {types.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
                <FormControl fullWidth>
                  <InputLabel>Статус</InputLabel>
                  <Select
                    value={exportOptions.filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    label="Статус"
                  >
                    <MenuItem value="">Все статусы</MenuItem>
                    {statuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ flex: '1 1 250px', minWidth: 0 }}>
                <FormControl fullWidth>
                  <InputLabel>Местоположение</InputLabel>
                  <Select
                    value={exportOptions.filters.location || ''}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    label="Местоположение"
                  >
                    <MenuItem value="">Все местоположения</MenuItem>
                    {locations.map((location) => (
                      <MenuItem key={location} value={location}>
                        {location}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>

          {/* Поля для экспорта */}
          <Box sx={{ flex: '1 1 100%', minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Поля для экспорта
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {availableFields.map((field) => (
                <Chip
                  key={field}
                  label={field}
                  clickable
                  color={exportOptions.includeFields.includes(field) ? 'primary' : 'default'}
                  variant={exportOptions.includeFields.includes(field) ? 'filled' : 'outlined'}
                  onClick={() => handleFieldToggle(field)}
                  sx={{ mb: 1 }}
                />
              ))}
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={exportOptions.includeFields.length === availableFields.length}
                  indeterminate={exportOptions.includeFields.length > 0 && exportOptions.includeFields.length < availableFields.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setExportOptions(prev => ({ ...prev, includeFields: availableFields }));
                    } else {
                      setExportOptions(prev => ({ ...prev, includeFields: [] }));
                    }
                  }}
                />
              }
              label="Выбрать все поля"
            />
          </Box>
        </Box>

        {isExporting && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Экспорт данных... Пожалуйста, подождите.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isExporting}>
          Отмена
        </Button>
        <Button
          onClick={handleExport}
          variant="contained"
          startIcon={<DownloadIcon />}
          disabled={isExporting || exportOptions.includeFields.length === 0}
        >
          {isExporting ? 'Экспорт...' : 'Экспортировать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportData;
