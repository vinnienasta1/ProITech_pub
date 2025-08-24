import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  IconButton,
  TextField,
} from '@mui/material';
import {
  Clear as ClearIcon,
  OpenInNew as MoveIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
  Comment as CommentIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

export interface BulkOperation {
  type: 'status' | 'location' | 'comment' | 'assign' | 'export' | 'department' | 'type' | 'manufacturer' | 'model' | 'serialNumber' | 'purchaseDate' | 'cost' | 'warrantyMonths' | 'supplier' | 'project' | 'invoiceNumber' | 'contractNumber' | 'rack' | 'clear';
  value?: string;
  description: string;
}

interface BulkOperationsProps {
  open: boolean;
  onClose: () => void;
  selectedItems: any[];
  onBulkOperation: (operation: BulkOperation) => Promise<void>;
  availableStatuses: string[];
  availableLocations: string[];
  availableTypes: string[];
  availableUsers: string[];
  availableDepartments: string[];
  availableSuppliers: string[];
  availableProjects: string[];
  availableShelves: string[];
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  open,
  onClose,
  selectedItems,
  onBulkOperation,
  availableStatuses,
  availableLocations,
  availableTypes,
  availableUsers,
  availableDepartments,
  availableSuppliers,
  availableProjects,
  availableShelves,
}) => {
  const [operation, setOperation] = useState<BulkOperation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fieldsToClear, setFieldsToClear] = useState<string[]>([]);

  // Поля, которые можно очистить
  const clearableFields = [
    { key: 'department', label: 'Департамент' },
    { key: 'location', label: 'Местоположение' },
    { key: 'user', label: 'Пользователь' },
    { key: 'supplier', label: 'Поставщик' },
    { key: 'project', label: 'Проект' },
    { key: 'rack', label: 'Стеллаж' },
    { key: 'comment', label: 'Комментарий' },
    { key: 'invoiceNumber', label: 'Номер счета' },
    { key: 'contractNumber', label: 'Номер договора' },
  ];

  const operations = [
    {
      type: 'status' as const,
      label: 'Изменить статус',
      icon: <AssignmentIcon />,
      description: 'Установить новый статус для выбранного оборудования',
      requiresValue: true,
      valueOptions: availableStatuses,
    },
    {
      type: 'department' as const,
      label: 'Изменить департамент',
      icon: <AssignmentIcon />,
      description: 'Установить новый департамент для выбранного оборудования',
      requiresValue: true,
      valueOptions: availableDepartments,
    },
    {
      type: 'type' as const,
      label: 'Изменить тип',
      icon: <AssignmentIcon />,
      description: 'Установить новый тип для выбранного оборудования',
      requiresValue: true,
      valueOptions: availableTypes,
    },
    {
      type: 'location' as const,
      label: 'Переместить',
      icon: <MoveIcon />,
      description: 'Переместить оборудование в другое местоположение',
      requiresValue: true,
      valueOptions: availableLocations,
    },
    {
      type: 'manufacturer' as const,
      label: 'Изменить производителя',
      icon: <AssignmentIcon />,
      description: 'Установить нового производителя для выбранного оборудования',
      requiresValue: true,
      valueOptions: ['Dell', 'HP', 'Lenovo', 'Samsung', 'Cisco', 'Canon', 'LG'],
    },
    {
      type: 'model' as const,
      label: 'Изменить модель',
      icon: <AssignmentIcon />,
      description: 'Установить новую модель для выбранного оборудования',
      requiresValue: true,
      valueOptions: ['Latitude 5520', 'LaserJet Pro M404n', 'S24F350', 'Catalyst 2960', 'ProLiant DL380', 'ThinkPad X1 Carbon', 'PIXMA TS8320', '27UL850-W'],
    },
    {
      type: 'supplier' as const,
      label: 'Изменить поставщика',
      icon: <AssignmentIcon />,
      description: 'Установить нового поставщика для выбранного оборудования',
      requiresValue: true,
      valueOptions: availableSuppliers,
    },
    {
      type: 'project' as const,
      label: 'Изменить проект',
      icon: <AssignmentIcon />,
      description: 'Установить новый проект для выбранного оборудования',
      requiresValue: true,
      valueOptions: availableProjects,
    },
    {
      type: 'rack' as const,
      label: 'Изменить стеллаж',
      icon: <AssignmentIcon />,
      description: 'Установить новый стеллаж для выбранного оборудования',
      requiresValue: true,
      valueOptions: availableShelves,
    },
    {
      type: 'comment' as const,
      label: 'Добавить в комментарий',
      icon: <CommentIcon />,
      description: 'Добавить текст в комментарий к выбранному оборудованию',
      requiresValue: true,
      valueOptions: [],
    },
    {
      type: 'assign' as const,
      label: 'Выдать',
      icon: <PersonIcon />,
      description: 'Назначить пользователя для выбранного оборудования',
      requiresValue: true,
      valueOptions: availableUsers,
    },
    {
      type: 'clear' as const,
      label: 'Очистить поля',
      icon: <ClearIcon />,
      description: 'Очистить выбранные поля у оборудования',
      requiresValue: false,
      valueOptions: [],
    },
    {
      type: 'export' as const,
      label: 'Экспортировать',
      icon: <AssignmentIcon />,
      description: 'Экспортировать данные выбранного оборудования',
      requiresValue: false,
      valueOptions: [],
    },
  ];

  const handleOperationSelect = (op: any) => {
    setOperation({
      type: op.type,
      description: op.description,
    });
  };

  const handleValueChange = (value: string) => {
    if (operation) {
      setOperation({ ...operation, value });
    }
  };

  const handleExecute = async () => {
    if (!operation) return;

    setIsProcessing(true);
    setSuccess(false);

    try {
      // Для операции очистки добавляем информацию о полях
      if (operation.type === 'clear') {
        operation.value = JSON.stringify(fieldsToClear);
      }
      
      await onBulkOperation(operation);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setOperation(null);
        setFieldsToClear([]);
      }, 2000);
    } catch (error) {
      console.error('Ошибка массовой операции:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getOperationIcon = (type: string) => {
    const op = operations.find(o => o.type === type);
    return op ? op.icon : <AssignmentIcon />;
  };

  const getOperationLabel = (type: string) => {
    const op = operations.find(o => o.type === type);
    return op ? op.label : 'Операция';
  };



  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Массовые операции
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Массовая операция успешно выполнена!
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Выбрано элементов: {selectedItems.length}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {selectedItems.slice(0, 5).map((item, index) => (
              <Chip
                key={index}
                label={item.name || `Элемент ${index + 1}`}
                size="small"
                variant="outlined"
              />
            ))}
            {selectedItems.length > 5 && (
              <Chip
                label={`+${selectedItems.length - 5} еще`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {!operation ? (
          // Выбор операции
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
              Выберите операцию
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
              {operations.map((op) => (
                <Button
                  key={op.type}
                  variant="outlined"
                  startIcon={op.icon}
                  onClick={() => handleOperationSelect(op)}
                  sx={{
                    p: 2,
                    height: 'auto',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                    },
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {op.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {op.description}
                  </Typography>
                </Button>
              ))}
            </Box>
          </Box>
        ) : (
          // Настройка операции
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {getOperationIcon(operation.type)}
              <Typography variant="subtitle1" sx={{ fontWeight: 600, ml: 1 }}>
                {getOperationLabel(operation.type)}
              </Typography>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {operation.description}
            </Typography>



            {operations.find(o => o.type === operation.type)?.requiresValue && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                {operation.type === 'comment' ? (
                  <>
                    <InputLabel>Текст комментария</InputLabel>
                    <TextField
                      multiline
                      rows={3}
                      value={operation.value || ''}
                      onChange={(e) => handleValueChange(e.target.value)}
                      label="Текст комментария"
                      placeholder="Введите текст для добавления в комментарий..."
                      fullWidth
                    />
                  </>
                ) : operation.type === 'clear' ? (
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                      Выберите поля для очистки:
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
                      {clearableFields.map((field) => (
                        <Button
                          key={field.key}
                          variant={fieldsToClear.includes(field.key) ? 'contained' : 'outlined'}
                          size="small"
                          onClick={() => {
                            if (fieldsToClear.includes(field.key)) {
                              setFieldsToClear(prev => prev.filter(f => f !== field.key));
                            } else {
                              setFieldsToClear(prev => [...prev, field.key]);
                            }
                          }}
                          sx={{ justifyContent: 'flex-start' }}
                        >
                          {field.label}
                        </Button>
                      ))}
                    </Box>
                  </>
                ) : (
                  <>
                    <InputLabel>
                      {operation.type === 'status' && 'Новый статус'}
                      {operation.type === 'location' && 'Новое местоположение'}
                      {operation.type === 'assign' && 'Пользователь'}
                    </InputLabel>
                    <Select
                      value={operation.value || ''}
                      onChange={(e) => handleValueChange(e.target.value)}
                      label={
                        operation.type === 'status' ? 'Новый статус' :
                        operation.type === 'location' ? 'Новое местоположение' :
                        operation.type === 'assign' ? 'Пользователь' : 'Значение'
                      }
                    >
                      {operations.find(o => o.type === operation.type)?.valueOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </>
                )}
              </FormControl>
            )}

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Элементы для обработки:
              </Typography>
              <List dense sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {selectedItems.map((item, index) => (
                  <ListItem key={index} sx={{ py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Checkbox checked disabled />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.name || `Элемент ${index + 1}`}
                      secondary={item.category || item.location || 'Без дополнительной информации'}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {isProcessing && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Выполнение операции... Пожалуйста, подождите.
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {operation && (
          <Button
            onClick={() => setOperation(null)}
            disabled={isProcessing}
            startIcon={<ClearIcon />}
          >
            Назад
          </Button>
        )}
        <Button onClick={onClose} disabled={isProcessing}>
          Отмена
        </Button>
        {operation && (
          <Button
            onClick={handleExecute}
            variant="contained"
            color="primary"
            disabled={isProcessing || (operations.find(o => o.type === operation.type)?.requiresValue && !operation.value)}
            startIcon={getOperationIcon(operation.type)}
          >
            {isProcessing ? 'Выполнение...' : `Выполнить ${getOperationLabel(operation.type).toLowerCase()}`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default BulkOperations;
