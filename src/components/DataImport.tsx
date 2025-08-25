import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormLabel
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Settings as SettingsIcon,
  Preview as PreviewIcon,
  ImportExport as ImportIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  FileDownload as DownloadIcon,
  TableChart as TableIcon,
  Code as CodeIcon
} from '@mui/icons-material';

interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  required: boolean;
  defaultValue?: string;
}

interface ImportConfig {
  sourceType: 'excel' | 'csv' | 'json' | 'sql' | 'custom';
  fieldMappings: FieldMapping[];
  dataValidation: {
    skipDuplicates: boolean;
    updateExisting: boolean;
    createMissingEntities: boolean;
  };
  batchSize: number;
  previewData: any[];
}

interface DataImportProps {
  open: boolean;
  onClose: () => void;
  onImport: (config: ImportConfig, data: any[]) => Promise<void>;
}

const DataImport: React.FC<DataImportProps> = ({ open, onClose, onImport }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [importConfig, setImportConfig] = useState<ImportConfig>({
    sourceType: 'excel',
    fieldMappings: [],
    dataValidation: {
      skipDuplicates: true,
      updateExisting: false,
      createMissingEntities: true
    },
    batchSize: 100,
    previewData: []
  });
  
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Стандартные поля ProITech
  const proitechFields = [
    { key: 'name', label: 'Название', required: true },
    { key: 'type', label: 'Тип оборудования', required: true },
    { key: 'inventoryNumber', label: 'Инвентарный номер', required: true },
    { key: 'serialNumber', label: 'Серийный номер', required: false },
    { key: 'manufacturer', label: 'Производитель', required: false },
    { key: 'model', label: 'Модель', required: false },
    { key: 'department', label: 'Департамент', required: true },
    { key: 'status', label: 'Статус', required: true },
    { key: 'location', label: 'Местоположение', required: true },
    { key: 'user', label: 'Пользователь', required: false },
    { key: 'purchaseDate', label: 'Дата покупки', required: false },
    { key: 'warrantyMonths', label: 'Гарантия (месяцев)', required: false },
    { key: 'cost', label: 'Стоимость', required: false },
    { key: 'supplier', label: 'Поставщик', required: false },
    { key: 'project', label: 'Проект', required: false },
    { key: 'invoiceNumber', label: 'Номер счета', required: false },
    { key: 'contractNumber', label: 'Номер договора', required: false },
    { key: 'rack', label: 'Стеллаж', required: false },
    { key: 'comment', label: 'Комментарий', required: false }
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setError('');
    setIsProcessing(true);

    try {
      let data: any[] = [];
      
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        // Excel файл
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Преобразуем в объекты
        if (data.length > 1) {
          const headers = data[0] as string[];
          data = data.slice(1).map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              if (header && row[index] !== undefined) {
                obj[header] = row[index];
              }
            });
            return obj;
          });
        }
      } else if (file.name.endsWith('.csv')) {
        // CSV файл
        const text = await file.text();
        const lines = text.split('\n');
        if (lines.length > 1) {
          const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
          data = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
            const obj: any = {};
            headers.forEach((header, index) => {
              if (header && values[index] !== undefined) {
                obj[header] = values[index];
              }
            });
            return obj;
          });
        }
      } else if (file.name.endsWith('.json')) {
        // JSON файл
        const text = await file.text();
        data = JSON.parse(text);
      } else if (file.name.endsWith('.sql')) {
        // SQL файл - простой парсинг INSERT statements
        const text = await file.text();
        console.log('SQL file size:', text.length, 'characters');
        
        // Ищем все INSERT INTO statements
        const insertMatches = text.match(/INSERT\s+INTO\s+`?(\w+)`?\s*\(([^)]+)\)\s*VALUES\s*([^;]+);/gi);
        console.log('Found INSERT statements:', insertMatches?.length || 0);
        
        if (insertMatches && insertMatches.length > 0) {
          // Берем первый INSERT для определения структуры
          const firstMatch = insertMatches[0];
          const columnMatch = firstMatch.match(/\(([^)]+)\)/);
          const valuesMatch = firstMatch.match(/VALUES\s*([^;]+)/);
          
          if (columnMatch && valuesMatch) {
            const columns = columnMatch[1].split(',').map((col: string) => col.trim().replace(/`/g, ''));
            console.log('Columns found:', columns);
            
            // Обрабатываем все INSERT statements
            data = insertMatches.map((match, index) => {
              const valuesMatch = match.match(/VALUES\s*([^;]+)/);
              if (valuesMatch) {
                const values = valuesMatch[1].split(',').map((val: string) => val.trim().replace(/['"]/g, ''));
                
                const obj: any = {};
                columns.forEach((col, colIndex) => {
                  if (values[colIndex] !== undefined) {
                    obj[col] = values[colIndex];
                  }
                });
                return obj;
              }
              return null;
            }).filter(Boolean);
            
            console.log('Parsed records:', data.length);
          }
        }
        
        // Если не удалось распарсить, пробуем альтернативный подход
        if (data.length === 0) {
          console.log('Trying alternative SQL parsing...');
          
          // Ищем строки с данными в формате (val1, val2, val3)
          const dataMatches = text.match(/\(([^)]+)\)/g);
          if (dataMatches) {
            console.log('Found data rows:', dataMatches.length);
            
            // Пытаемся найти заголовки таблицы
            const tableMatch = text.match(/CREATE\s+TABLE\s+`?(\w+)`?\s*\(([^)]+)\)/i);
            if (tableMatch) {
              const columns = tableMatch[2].split(',').map((col: string) => {
                const colName = col.trim().split(/\s+/)[0].replace(/`/g, '');
                return colName;
              });
              console.log('Table columns from CREATE TABLE:', columns);
              
              // Создаем объекты из найденных данных
              data = dataMatches.slice(0, 100).map((match, index) => { // Ограничиваем первыми 100 записями
                const values = match.replace(/[()]/g, '').split(',').map((val: string) => val.trim().replace(/['"]/g, ''));
                
                const obj: any = {};
                columns.forEach((col, colIndex) => {
                  if (values[colIndex] !== undefined) {
                    obj[col] = values[colIndex];
                  }
                });
                return obj;
              });
            }
          }
        }
        
        console.log('Final SQL parsing result:', { dataLength: data.length, sampleData: data.slice(0, 2) });
      }

      setFileData(data);
      
      // Автоматически создаем маппинг полей
      if (data.length > 0) {
        const sampleRow = data[0];
        const sourceFields = Object.keys(sampleRow);
        const autoMappings: FieldMapping[] = [];
        
        sourceFields.forEach(sourceField => {
          // Ищем похожее поле в ProITech
          const targetField = proitechFields.find(pf => 
            pf.key.toLowerCase().includes(sourceField.toLowerCase()) ||
            sourceField.toLowerCase().includes(pf.key.toLowerCase()) ||
            pf.label.toLowerCase().includes(sourceField.toLowerCase())
          );
          
          if (targetField) {
            autoMappings.push({
              sourceField,
              targetField: targetField.key,
              required: targetField.required,
              defaultValue: targetField.required ? '' : undefined
            });
          } else {
            autoMappings.push({
              sourceField,
              targetField: 'comment', // По умолчанию в комментарий
              required: false
            });
          }
        });
        
        setImportConfig(prev => ({
          ...prev,
          fieldMappings: autoMappings,
          previewData: data.slice(0, 5) // Показываем первые 5 записей
        }));
      }
      
    } catch (err) {
      setError(`Ошибка чтения файла: ${err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFieldMappingChange = (index: number, field: keyof FieldMapping, value: any) => {
    const newMappings = [...importConfig.fieldMappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    
    setImportConfig(prev => ({
      ...prev,
      fieldMappings: newMappings
    }));
  };

  const addFieldMapping = () => {
    setImportConfig(prev => ({
      ...prev,
      fieldMappings: [
        ...prev.fieldMappings,
        {
          sourceField: '',
          targetField: 'comment',
          required: false
        }
      ]
    }));
  };

  const removeFieldMapping = (index: number) => {
    setImportConfig(prev => ({
      ...prev,
      fieldMappings: prev.fieldMappings.filter((_, i) => i !== index)
    }));
  };

  const handleValidationChange = (field: keyof ImportConfig['dataValidation'], value: boolean) => {
    setImportConfig(prev => ({
      ...prev,
      dataValidation: {
        ...prev.dataValidation,
        [field]: value
      }
    }));
  };

  const handleImport = async () => {
    if (!uploadedFile || fileData.length === 0) return;
    
    setIsProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      // Трансформируем данные согласно маппингу
      const transformedData = fileData.map(row => {
        const transformed: any = {};
        
        importConfig.fieldMappings.forEach(mapping => {
          if (mapping.sourceField && mapping.targetField) {
            let value = row[mapping.sourceField];
            
            // Применяем трансформации
            if (mapping.transformation) {
              switch (mapping.transformation) {
                case 'uppercase':
                  value = String(value).toUpperCase();
                  break;
                case 'lowercase':
                  value = String(value).toLowerCase();
                  break;
                case 'trim':
                  value = String(value).trim();
                  break;
                case 'date':
                  value = new Date(value).toISOString().split('T')[0];
                  break;
                case 'number':
                  value = parseFloat(value) || 0;
                  break;
              }
            }
            
            // Устанавливаем значение по умолчанию если поле пустое и обязательное
            if ((!value || value === '') && mapping.required && mapping.defaultValue) {
              value = mapping.defaultValue;
            }
            
            transformed[mapping.targetField] = value;
          }
        });
        
        return transformed;
      });
      
      await onImport(importConfig, transformedData);
      setSuccess(`Успешно импортировано ${transformedData.length} записей!`);
      
      // Сброс формы
      setTimeout(() => {
        setFileData([]);
        setUploadedFile(null);
        setImportConfig(prev => ({
          ...prev,
          fieldMappings: [],
          previewData: []
        }));
        setActiveStep(0);
      }, 2000);
      
    } catch (err) {
      setError(`Ошибка импорта: ${err}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    {
      label: 'Загрузка файла',
      description: 'Выберите файл для импорта'
    },
    {
      label: 'Настройка маппинга',
      description: 'Настройте соответствие полей'
    },
    {
      label: 'Предварительный просмотр',
      description: 'Проверьте данные перед импортом'
    },
    {
      label: 'Импорт',
      description: 'Выполните импорт данных'
    }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <ImportIcon />
          <Typography variant="h6">Импорт данных</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Box sx={{ mb: 2 }}>
                  <Typography>{step.description}</Typography>
                  
                  {index === 0 && (
                    <Box sx={{ mt: 2 }}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls,.csv,.json"
                        onChange={handleFileUpload}
                        style={{ display: 'none' }}
                      />
                      
                      <Button
                        variant="outlined"
                        startIcon={<UploadIcon />}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isProcessing}
                        sx={{ mb: 2 }}
                      >
                        Выбрать файл
                      </Button>
                      
                      {uploadedFile && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          Файл загружен: {uploadedFile.name} ({fileData.length} записей)
                        </Alert>
                      )}
                      
                      {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {error}
                        </Alert>
                      )}
                      
                      {fileData.length > 0 && (
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(1)}
                          sx={{ mt: 2 }}
                        >
                          Далее
                        </Button>
                      )}
                    </Box>
                  )}
                  
                  {index === 1 && (
                    <Box sx={{ mt: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">Маппинг полей</Typography>
                        <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={addFieldMapping}
                        >
                          Добавить поле
                        </Button>
                      </Box>
                      
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {importConfig.fieldMappings.map((mapping, mapIndex) => (
                          <Box key={mapIndex}>
                            <Card variant="outlined">
                              <CardContent>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                                  <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                                    <TextField
                                      fullWidth
                                      label="Поле источника"
                                      value={mapping.sourceField}
                                      onChange={(e) => handleFieldMappingChange(mapIndex, 'sourceField', e.target.value)}
                                      size="small"
                                    />
                                  </Box>
                                  
                                  <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                                    <FormControl fullWidth size="small">
                                      <InputLabel>Поле назначения</InputLabel>
                                      <Select
                                        value={mapping.targetField}
                                        onChange={(e) => handleFieldMappingChange(mapIndex, 'targetField', e.target.value)}
                                        label="Поле назначения"
                                      >
                                        {proitechFields.map(field => (
                                          <MenuItem key={field.key} value={field.key}>
                                            {field.label} {field.required && '*'}
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </Box>
                                  
                                  <Box sx={{ flex: '1 1 150px', minWidth: 150 }}>
                                    <FormControl fullWidth size="small">
                                      <InputLabel>Трансформация</InputLabel>
                                      <Select
                                        value={mapping.transformation || ''}
                                        onChange={(e) => handleFieldMappingChange(mapIndex, 'transformation', e.target.value)}
                                        label="Трансформация"
                                      >
                                        <MenuItem value="">Без изменений</MenuItem>
                                        <MenuItem value="uppercase">Верхний регистр</MenuItem>
                                        <MenuItem value="lowercase">Нижний регистр</MenuItem>
                                        <MenuItem value="trim">Убрать пробелы</MenuItem>
                                        <MenuItem value="date">Формат даты</MenuItem>
                                        <MenuItem value="number">Число</MenuItem>
                                      </Select>
                                    </FormControl>
                                  </Box>
                                  
                                  <Box sx={{ flex: '0 0 auto' }}>
                                    <IconButton
                                      color="error"
                                      onClick={() => removeFieldMapping(mapIndex)}
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Box>
                                </Box>
                                
                                <Box sx={{ mt: 1 }}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={mapping.required}
                                        onChange={(e) => handleFieldMappingChange(mapIndex, 'required', e.target.checked)}
                                      />
                                    }
                                    label="Обязательное поле"
                                  />
                                  
                                  {mapping.required && (
                                    <TextField
                                      fullWidth
                                      label="Значение по умолчанию"
                                      value={mapping.defaultValue || ''}
                                      onChange={(e) => handleFieldMappingChange(mapIndex, 'defaultValue', e.target.value)}
                                      size="small"
                                      sx={{ mt: 1 }}
                                    />
                                  )}
                                </Box>
                              </CardContent>
                            </Card>
                          </Box>
                        ))}
                      </Box>
                      
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() => setActiveStep(0)}
                          sx={{ mr: 1 }}
                        >
                          Назад
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(2)}
                          disabled={importConfig.fieldMappings.length === 0}
                        >
                          Далее
                        </Button>
                      </Box>
                    </Box>
                  )}
                  
                  {index === 2 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Предварительный просмотр данных
                      </Typography>
                      
                      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              {proitechFields.map(field => (
                                <TableCell key={field.key}>
                                  {field.label} {field.required && '*'}
                                </TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {importConfig.previewData.map((row, rowIndex) => (
                              <TableRow key={rowIndex}>
                                {proitechFields.map(field => (
                                  <TableCell key={field.key}>
                                    {row[field.key] || '-'}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() => setActiveStep(1)}
                          sx={{ mr: 1 }}
                        >
                          Назад
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => setActiveStep(3)}
                        >
                          Далее
                        </Button>
                      </Box>
                    </Box>
                  )}
                  
                  {index === 3 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>
                        Настройки импорта
                      </Typography>
                      
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={importConfig.dataValidation.skipDuplicates}
                                onChange={(e) => handleValidationChange('skipDuplicates', e.target.checked)}
                              />
                            }
                            label="Пропускать дубликаты"
                          />
                        </Box>
                        
                        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={importConfig.dataValidation.updateExisting}
                                onChange={(e) => handleValidationChange('updateExisting', e.target.checked)}
                              />
                            }
                            label="Обновлять существующие записи"
                          />
                        </Box>
                        
                        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={importConfig.dataValidation.createMissingEntities}
                                onChange={(e) => handleValidationChange('createMissingEntities', e.target.checked)}
                              />
                            }
                            label="Создавать недостающие справочники"
                          />
                        </Box>
                        
                        <Box sx={{ flex: '1 1 250px', minWidth: 250 }}>
                          <TextField
                            fullWidth
                            label="Размер пакета"
                            type="number"
                            value={importConfig.batchSize}
                            onChange={(e) => setImportConfig(prev => ({
                              ...prev,
                              batchSize: parseInt(e.target.value) || 100
                            }))}
                            size="small"
                          />
                        </Box>
                      </Box>
                      
                      {success && (
                        <Alert severity="success" sx={{ mt: 2 }}>
                          {success}
                        </Alert>
                      )}
                      
                      <Box sx={{ mt: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={() => setActiveStep(2)}
                          sx={{ mr: 1 }}
                        >
                          Назад
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleImport}
                          disabled={isProcessing || !uploadedFile}
                          startIcon={<ImportIcon />}
                        >
                          {isProcessing ? 'Импорт...' : 'Выполнить импорт'}
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataImport;
