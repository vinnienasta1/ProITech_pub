import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
  IconButton,
  Drawer,
  Divider,
  Button,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

export interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationSystemProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll,
}) => {
  const [open, setOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <SuccessIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'error':
        return <ErrorIcon color="error" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      default:
        return 'info';
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.action) {
      notification.action.onClick();
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

  return (
    <>
      {/* Кнопка уведомлений */}
      <IconButton
        color="inherit"
        onClick={() => setOpen(true)}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Панель уведомлений */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{
          sx: { width: 400, p: 2 },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Уведомления
          </Typography>
          <Box>
            {unreadCount > 0 && (
              <Button
                size="small"
                onClick={onClearAll}
                sx={{ mr: 1 }}
              >
                Отметить все как прочитанные
              </Button>
            )}
            <IconButton size="small" onClick={() => setOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography color="text.secondary">
              У вас пока нет уведомлений
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  mb: 1,
                  borderRadius: 2,
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  border: `1px solid ${notification.read ? 'transparent' : 'primary.light'}`,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {getNotificationIcon(notification.type)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: notification.read ? 400 : 600,
                          color: notification.read ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(notification.timestamp)}
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
                        {notification.message}
                      </Typography>
                      {notification.action && (
                        <Button
                          size="small"
                          variant="outlined"
                          color={getNotificationColor(notification.type)}
                          onClick={(e) => {
                            e.stopPropagation();
                            notification.action!.onClick();
                          }}
                        >
                          {notification.action.label}
                        </Button>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Drawer>

      {/* Всплывающие уведомления */}
      {currentNotification && (
        <Snackbar
          open={Boolean(currentNotification)}
          autoHideDuration={6000}
          onClose={() => setCurrentNotification(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setCurrentNotification(null)}
            severity={currentNotification.type}
            sx={{ width: '100%' }}
          >
            <AlertTitle>{currentNotification.title}</AlertTitle>
            {currentNotification.message}
          </Alert>
        </Snackbar>
      )}
    </>
  );
};

export default NotificationSystem;
