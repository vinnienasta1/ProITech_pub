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
  TextField,
  Typography,
  Chip,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
  Divider,
  IconButton,
} from '@mui/material';
import {
  SelectAll as SelectAllIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  OpenInNew as MoveIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export interface BulkOperation {
  type: 'status' | 'location' | 'category' | 'delete' | 'export';
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
  availableCategories: string[];
}

const BulkOperations: React.FC<BulkOperationsProps> = ({
  open,
  onClose,
  selectedItems,
  onBulkOperation,
  availableStatuses,
  availableLocations,
  availableCategories,
}) => {
  const [operation, setOperation] = useState<BulkOperation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

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
      type: 'location' as const,
      label: 'Переместить',
      icon: <MoveIcon />,
      description: 'Переместить оборудование в другое местоположение',
      requiresValue: true,
      valueOptions: availableLocations,
    },
    {
      type: 'category' as const,
      label: 'Изменить категорию',
      icon: <EditIcon />,
      description: 'Изменить категорию оборудования',
      requiresValue: true,
      valueOptions: availableCategories,
    },
    {
      type: 'delete' as const,
      label: 'Удалить',
      icon: <DeleteIcon />,
      description: 'Удалить выбранное оборудование (необратимо)',
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
      await onBulkOperation(operation);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setOperation(null);
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

  const isDeleteOperation = operation?.type === 'delete';

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

            {isDeleteOperation && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Внимание! Эта операция необратима.
                </Typography>
                <Typography variant="body2">
                  Выбранное оборудование будет удалено навсегда. Убедитесь, что это именно то, что нужно.
                </Typography>
              </Alert>
            )}

            {operations.find(o => o.type === operation.type)?.requiresValue && (
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>
                  {operation.type === 'status' && 'Новый статус'}
                  {operation.type === 'location' && 'Новое местоположение'}
                  {operation.type === 'category' && 'Новая категория'}
                </InputLabel>
                <Select
                  value={operation.value || ''}
                  onChange={(e) => handleValueChange(e.target.value)}
                  label={
                    operation.type === 'status' ? 'Новый статус' :
                    operation.type === 'location' ? 'Новое местоположение' :
                    operation.type === 'category' ? 'Новая категория' : 'Значение'
                  }
                >
                  {operations.find(o => o.type === operation.type)?.valueOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
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
            color={isDeleteOperation ? 'error' : 'primary'}
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
