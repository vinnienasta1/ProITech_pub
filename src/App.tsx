import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import EquipmentForm from './pages/EquipmentForm';
import EquipmentDetail from './pages/EquipmentDetail';
import Administration from './pages/Administration';
import Inventory from './pages/Inventory';
import Printers from './pages/Printers';
import NotificationSystem, { Notification } from './components/NotificationSystem';
import { NotificationContext } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Sidebar from './components/Sidebar';

function App() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'info',
      title: 'Добро пожаловать!',
      message: 'Система управления IT-инвентарем готова к работе',
      timestamp: new Date(),
      read: false,
    },
    {
      id: '2',
      type: 'warning',
      title: 'Гарантия истекает',
      message: 'У 3 единиц оборудования скоро истекает гарантия',
      timestamp: new Date(Date.now() - 3600000),
      read: false,
      action: {
        label: 'Просмотреть',
        onClick: () => console.log('Просмотр оборудования с истекающей гарантией'),
      },
    },
  ]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  // Создаем глобальную систему уведомлений
  useEffect(() => {
    window.notificationSystem = {
      addNotification: (notification: { type: 'success' | 'warning' | 'error' | 'info'; title: string; message: string }) => {
        addNotification(notification);
      }
    };
  }, [addNotification]);

  const notificationContextValue = {
    notifications,
    addNotification,
    markAsRead,
    clearAll,
  };

  return (
    <ThemeProvider>
      <CssBaseline />
      <NotificationContext.Provider value={notificationContextValue}>
        <Router>
          <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <Sidebar />
            <Box
              component="main"
              sx={{
                flexGrow: 1,
                p: 3,
                backgroundColor: 'background.default',
                minHeight: '100vh',
              }}
            >
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/equipment" element={<EquipmentList />} />
                <Route path="/equipment/new" element={<EquipmentForm />} />
                <Route path="/equipment/edit/:id" element={<EquipmentForm />} />
                <Route path="/equipment/:id" element={<EquipmentDetail />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/printers" element={<Printers />} />
                <Route path="/administration" element={<Administration />} />
              </Routes>
            </Box>
            <NotificationSystem
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onClearAll={clearAll}
            />
          </Box>
        </Router>
      </NotificationContext.Provider>
    </ThemeProvider>
  );
}

export default App;
