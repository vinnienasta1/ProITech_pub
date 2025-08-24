import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import EquipmentForm from './pages/EquipmentForm';
import EquipmentDetail from './pages/EquipmentDetail';
import Administration from './pages/Administration';
import Inventory from './pages/Inventory';
import Users from './pages/Users';
import Printers from './pages/Printers';
import ActionLog from './components/ActionLog';
import { ActionLogProvider, useActionLog } from './contexts/ActionLogContext';
import { NotificationContext } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';

// Компонент для отображения ActionLog
const ActionLogWrapper = () => {
  const { actions, undoAction, clearHistory } = useActionLog();
  
  return (
    <ActionLog
      actions={actions}
      onUndo={undoAction}
      onClearHistory={clearHistory}
    />
  );
};

function App() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const addNotification = useCallback((notification: any) => {
    const newNotification = {
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
      <AuthProvider>
        <ActionLogProvider>
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
                    <Route path="/equipment/edit/:inventoryNumber" element={<EquipmentForm />} />
                    <Route path="/equipment/:inventoryNumber" element={<EquipmentDetail />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/admin" element={<Inventory />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/printers" element={<Printers />} />
                    <Route path="/administration" element={<Administration />} />
                  </Routes>
                </Box>
                <ActionLogWrapper />
              </Box>
            </Router>
          </NotificationContext.Provider>
        </ActionLogProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
