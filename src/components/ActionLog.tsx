import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Drawer,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import {
  Undo as UndoIcon,
  History as HistoryIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Edit as EditIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
} from '@mui/icons-material';

export interface ActionLogItem {
  id: string;
  type: 'create' | 'update' | 'delete' | 'bulk' | 'import' | 'export';
  description: string;
  timestamp: Date;
  entityType: string;
  entityId: string;
  oldData?: any;
  newData?: any;
  canUndo: boolean;
}

interface ActionLogProps {
  actions: ActionLogItem[];
  onUndo: (action: ActionLogItem) => void;
  onClearHistory: () => void;
}

const ActionLog: React.FC<ActionLogProps> = ({
  actions,
  onUndo,
  onClearHistory,
}) => {
  const [open, setOpen] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const getActionIcon = (type: ActionLogItem['type']) => {
    switch (type) {
      case 'create':
        return <AddIcon color="success" />;
      case 'update':
        return <EditIcon color="primary" />;
      case 'delete':
        return <RemoveIcon color="error" />;
      case 'bulk':
        return <EditIcon color="info" />;
      case 'import':
        return <AddIcon color="success" />;
      case 'export':
        return <SuccessIcon color="success" />;
      default:
        return <HistoryIcon />;
    }
  };

  const getActionColor = (type: ActionLogItem['type']) => {
    switch (type) {
      case 'create':
        return 'success';
      case 'update':
        return 'primary';
      case 'delete':
        return 'error';
      case 'bulk':
        return 'info';
      case 'import':
        return 'success';
      case 'export':
        return 'success';
      default:
        return 'default';
    }
  };

  const getActionLabel = (type: ActionLogItem['type']) => {
    switch (type) {
      case 'create':
        return 'Создание';
      case 'update':
        return 'Изменение';
      case 'delete':
        return 'Удаление';
      case 'bulk':
        return 'Массовое изменение';
      case 'import':
        return 'Импорт';
      case 'export':
        return 'Экспорт';
      default:
        return 'Действие';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин назад`;
    if (hours < 24) return `${hours} ч назад`;
    return `${days} дн назад`;
  };

  const handleClearHistory = () => {
    onClearHistory();
    setClearDialogOpen(false);
  };

  return (
    <>
      {/* Кнопка лога действий */}
      <IconButton
        color="inherit"
        onClick={() => setOpen(true)}
        sx={{ 
          position: 'fixed',
          top: 20,
          right: 20,
          zIndex: 1200,
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            backgroundColor: 'action.hover',
          }
        }}
      >
        <UndoIcon />
      </IconButton>

      {/* Панель лога действий */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: 450, p: 2 },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Лог действий
          </Typography>
          <IconButton size="small" onClick={() => setOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {actions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">
              История действий пуста
            </Typography>
          </Box>
        ) : (
          <>
            <List sx={{ p: 0, mb: 2 }}>
              {actions.map((action) => (
                <ListItem
                  key={action.id}
                  sx={{
                    mb: 1,
                    borderRadius: 2,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {getActionIcon(action.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip
                            label={getActionLabel(action.type)}
                            size="small"
                            color={getActionColor(action.type) as any}
                            variant="outlined"
                          />
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {action.entityType}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(action.timestamp)}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 1 }}
                        >
                          {action.description}
                        </Typography>
                        {action.canUndo && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            startIcon={<UndoIcon />}
                            onClick={() => onUndo(action)}
                          >
                            Отменить
                          </Button>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>

            <Divider sx={{ mb: 2 }} />

            <Button
              fullWidth
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setClearDialogOpen(true)}
            >
              Очистить историю
            </Button>
          </>
        )}
      </Drawer>

      {/* Диалог подтверждения очистки истории */}
      <Dialog
        open={clearDialogOpen}
        onClose={() => setClearDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Очистить историю действий</DialogTitle>
        <DialogContent>
          <Typography>
            Вы уверены, что хотите очистить всю историю действий? Это действие нельзя отменить.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClearDialogOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleClearHistory} color="error" variant="contained">
            Очистить
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ActionLog;
