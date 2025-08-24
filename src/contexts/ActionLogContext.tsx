import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ActionLogItem } from '../components/ActionLog';

interface ActionLogContextType {
  actions: ActionLogItem[];
  addAction: (action: Omit<ActionLogItem, 'id' | 'timestamp'>) => void;
  undoAction: (action: ActionLogItem) => void;
  clearHistory: () => void;
}

const ActionLogContext = createContext<ActionLogContextType | undefined>(undefined);

export const useActionLog = () => {
  const context = useContext(ActionLogContext);
  if (!context) {
    throw new Error('useActionLog must be used within an ActionLogProvider');
  }
  return context;
};

interface ActionLogProviderProps {
  children: ReactNode;
}

export const ActionLogProvider: React.FC<ActionLogProviderProps> = ({ children }) => {
  // Загружаем действия из localStorage при инициализации
  const [actions, setActions] = useState<ActionLogItem[]>(() => {
    try {
      const saved = localStorage.getItem('action_log');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Преобразуем строки дат обратно в объекты Date
        return parsed.map((action: any) => ({
          ...action,
          timestamp: new Date(action.timestamp)
        }));
      }
    } catch (error) {
      console.error('Ошибка при загрузке лога действий:', error);
    }
    return [];
  });

  // Сохраняем действия в localStorage при каждом изменении
  React.useEffect(() => {
    try {
      localStorage.setItem('action_log', JSON.stringify(actions));
    } catch (error) {
      console.error('Ошибка при сохранении лога действий:', error);
    }
  }, [actions]);

  const addAction = useCallback((action: Omit<ActionLogItem, 'id' | 'timestamp'>) => {
    const newAction: ActionLogItem = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date(),
      user: action.user || 'Система', // По умолчанию "Система" если пользователь не указан
    };
    setActions(prev => [newAction, ...prev]);
  }, []);

  const undoAction = useCallback((action: ActionLogItem) => {
    try {
      if (action.oldData && action.newData) {
        // Восстанавливаем старые данные
        if (action.entityType === 'Оборудование') {
          const { updateEquipmentByInventoryNumber } = require('../storage/equipmentStorage');
          
          // Проверяем, что oldData содержит валидные данные
          if (action.oldData.inventoryNumber) {
            const restored = updateEquipmentByInventoryNumber(action.oldData.inventoryNumber, action.oldData);
            if (restored) {
              // Показываем уведомление об успешной отмене
              if (window.notificationSystem) {
                window.notificationSystem.addNotification({
                  type: 'success',
                  title: 'Отменено',
                  message: `Действие "${action.description}" успешно отменено`,
                });
              }
              
              // Удаляем действие из лога только после успешной отмены
              setActions(prev => prev.filter(a => a.id !== action.id));
              return;
            }
          }
        }
      }
      
      // Если не удалось отменить, показываем ошибку
      if (window.notificationSystem) {
        window.notificationSystem.addNotification({
          type: 'error',
          title: 'Ошибка',
          message: 'Не удалось отменить действие - данные не найдены',
        });
      }
    } catch (error) {
      console.error('Ошибка при отмене действия:', error);
      if (window.notificationSystem) {
        window.notificationSystem.addNotification({
          type: 'error',
          title: 'Ошибка',
          message: 'Не удалось отменить действие',
        });
      }
    }
  }, []);

  const clearHistory = useCallback(() => {
    setActions([]);
  }, []);

  const value: ActionLogContextType = {
    actions,
    addAction,
    undoAction,
    clearHistory,
  };

  return (
    <ActionLogContext.Provider value={value}>
      {children}
    </ActionLogContext.Provider>
  );
};
