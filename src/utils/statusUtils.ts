import { getStatuses } from '../storage/statusStorage';

/**
 * Получает цвет статуса в формате MUI
 * @param status - название статуса
 * @returns MUI цвет для использования в компонентах
 */
export const getStatusColor = (status: string): string => {
  const statuses = getStatuses();
  const statusInfo = statuses.find(s => s.name === status);
  
  if (statusInfo) {
    // Преобразуем hex цвет в MUI цвет
    const color = statusInfo.color;
    if (color === '#4caf50') return 'success';
    if (color === '#ff9800') return 'warning';
    if (color === '#f44336') return 'error';
    if (color === '#2196f3') return 'info';
    if (color === '#9c27b0') return 'secondary';
  }
  
  return 'default';
};
