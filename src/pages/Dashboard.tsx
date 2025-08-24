import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import { getEquipment } from '../storage/equipmentStorage';
import { getEntities } from '../storage/entitiesStorage';
import { getDashboardConfig, saveDashboardConfig } from '../storage/dashboardStorage';
import DashboardConstructor, { DashboardButton } from '../components/DashboardConstructor';

const Dashboard = () => {
  const navigate = useNavigate();
  const [constructorOpen, setConstructorOpen] = useState(false);
  const [dashboardButtons, setDashboardButtons] = useState<DashboardButton[]>([]);

  // Загружаем конфигурацию дашборда
  useEffect(() => {
    const config = getDashboardConfig();
    setDashboardButtons(config);
  }, []);

  // Получаем реальные данные
  const equipment = useMemo(() => getEquipment(), []);
  const entities = useMemo(() => getEntities(), []);

  // Подсчитываем статистику на основе реальных данных
  const totalEquipment = equipment.length;
  const activeEquipment = equipment.filter(e => e.status === 'Активно').length;
  const repairEquipment = equipment.filter(e => e.status === 'Ремонт').length;
  const maintenanceEquipment = equipment.filter(e => e.status === 'На обслуживании').length;
  const writtenOffEquipment = equipment.filter(e => e.status === 'Списано').length;
  const reserveEquipment = equipment.filter(e => e.status === 'Резерв').length;

  // Функция для получения иконки по имени
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactElement } = {
      inventory: <InventoryIcon sx={{ fontSize: 40 }} />,
      check: <CheckCircleIcon sx={{ fontSize: 40 }} />,
      warning: <WarningIcon sx={{ fontSize: 40 }} />,
      schedule: <ScheduleIcon sx={{ fontSize: 40 }} />,
      location: <LocationIcon sx={{ fontSize: 40 }} />,
      person: <PersonIcon sx={{ fontSize: 40 }} />,
      business: <BusinessIcon sx={{ fontSize: 40 }} />,
      category: <CategoryIcon sx={{ fontSize: 40 }} />,
    };
    return iconMap[iconName] || <InventoryIcon sx={{ fontSize: 40 }} />;
  };

  // Обработчик клика по кнопке дашборда
  const handleButtonClick = (button: DashboardButton) => {
    switch (button.type) {
      case 'navigation':
        navigate(button.target);
        break;
      case 'filter':
        if (button.filters && button.filters.length > 0) {
          // Строим строку запроса для фильтров
          const queryParams = new URLSearchParams();
          button.filters.forEach((filter, index) => {
            queryParams.append(`filter${index}.field`, filter.field);
            queryParams.append(`filter${index}.operator`, filter.operator);
            queryParams.append(`filter${index}.value`, filter.value);
            if (button.filters && index < button.filters.length - 1) {
              queryParams.append(`filter${index}.operatorBetween`, filter.operatorBetween);
            }
          });
          navigate(`${button.target}?${queryParams.toString()}`);
        } else {
          navigate(button.target);
        }
        break;
      case 'action':
        // Здесь можно добавить логику для действий
        console.log('Action:', button.actionType);
        break;
    }
  };

  // Сохранение конфигурации дашборда
  const handleSaveDashboard = (buttons: DashboardButton[]) => {
    setDashboardButtons(buttons);
    saveDashboardConfig(buttons);
  };

  // Получение значения для кнопки
  const getButtonValue = (button: DashboardButton): string => {
    // Для стандартных кнопок используем предопределенные значения
    switch (button.id) {
      case 'btn_total':
        return totalEquipment.toString();
      case 'btn_active':
        return activeEquipment.toString();
      case 'btn_repair':
        return repairEquipment.toString();
      case 'btn_maintenance':
        return maintenanceEquipment.toString();
      case 'btn_written_off':
        return writtenOffEquipment.toString();
      case 'btn_reserve':
        return reserveEquipment.toString();
      default:
        // Для пользовательских кнопок с фильтрами подсчитываем количество
        if (button.type === 'filter' && button.filters && button.filters.length > 0) {
          const filteredCount = equipment.filter(item => {
            // Применяем все фильтры с учетом логических связок
            let result = true;
            
            for (let i = 0; i < button.filters!.length; i++) {
              const filter = button.filters![i];
              const fieldValue = item[filter.field as keyof typeof item];
              
              if (!fieldValue) {
                result = false;
                break;
              }
              
              let matches = false;
              const stringValue = String(fieldValue);
              const filterValue = filter.value;
              
              switch (filter.operator) {
                case 'equals':
                  matches = stringValue === filterValue;
                  break;
                case 'not_equals':
                  matches = stringValue !== filterValue;
                  break;
                case 'contains':
                  matches = stringValue.toLowerCase().includes(filterValue.toLowerCase());
                  break;
                case 'starts_with':
                  matches = stringValue.toLowerCase().startsWith(filterValue.toLowerCase());
                  break;
                case 'ends_with':
                  matches = stringValue.toLowerCase().endsWith(filterValue.toLowerCase());
                  break;
                case 'greater_than':
                  if (['cost', 'warrantyMonths'].includes(filter.field)) {
                    matches = parseFloat(stringValue) > parseFloat(filterValue);
                  }
                  break;
                case 'less_than':
                  if (['cost', 'warrantyMonths'].includes(filter.field)) {
                    matches = parseFloat(stringValue) < parseFloat(filterValue);
                  }
                  break;
                default:
                  matches = true;
              }
              
              // Применяем логическую связку с предыдущим результатом
              if (i === 0) {
                result = matches;
              } else {
                const prevFilter = button.filters![i - 1];
                if (prevFilter.operatorBetween === 'AND') {
                  result = result && matches;
                } else { // OR
                  result = result || matches;
                }
              }
              
              // Если результат уже false для AND, можно прервать
              if (!result && i < button.filters!.length - 1 && button.filters![i].operatorBetween === 'AND') {
                break;
              }
            }
            
            return result;
          }).length;
          
          return filteredCount.toString();
        }
        
        // Для кнопок навигации и действий возвращаем 0
        return '0';
    }
  };

  // Получение цвета для кнопки
  const getButtonColor = (button: DashboardButton): string => {
    return button.color;
  };

  // Недавно добавленное оборудование (последние 5)
  const recentEquipment = useMemo(() => {
    return equipment
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 5);
  }, [equipment]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
          Дашборд
        </Typography>
        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={() => setConstructorOpen(true)}
          sx={{ borderRadius: 2 }}
        >
          Конструктор
        </Button>
      </Box>

      {/* Статистика */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {dashboardButtons.map((button) => (
          <Box sx={{ flex: '1 1 250px', minWidth: 0 }} key={button.id}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${getButtonColor(button)}15 0%, ${getButtonColor(button)}05 100%)`,
                border: `1px solid ${getButtonColor(button)}20`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 25px ${getButtonColor(button)}20`,
                },
              }}
              onClick={() => handleButtonClick(button)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: getButtonColor(button) }}>
                    {getIconComponent(button.icon)}
                  </Box>
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: getButtonColor(button) }}>
                      {getButtonValue(button)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {button.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Дополнительная статистика */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, mb: 4 }}>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="error.main" sx={{ fontWeight: 700 }}>
            {writtenOffEquipment}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Списано
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="secondary.main" sx={{ fontWeight: 700 }}>
            {reserveEquipment}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Резерв
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="info.main" sx={{ fontWeight: 700 }}>
            {entities?.departments?.length || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Департаментов
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="success.main" sx={{ fontWeight: 700 }}>
            {entities?.users?.length || 0}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Пользователей
          </Typography>
        </Paper>
      </Box>

      {/* Недавнее оборудование */}
      <Box>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Недавно добавленное
          </Typography>
          {recentEquipment.length > 0 ? (
            <List>
              {recentEquipment.map((item, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon>
                    <LocationIcon color="action" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.name}
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Chip
                          label={item.status}
                          size="small"
                          color={item.status === 'Активно' ? 'success' : 
                                 item.status === 'Ремонт' ? 'warning' : 
                                 item.status === 'Списано' ? 'error' : 'default'}
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary">
                          {item.location || 'Местоположение не указано'}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
              Оборудование не найдено
            </Typography>
          )}
        </Paper>
      </Box>

      {/* Конструктор дашборда */}
      <DashboardConstructor
        open={constructorOpen}
        onClose={() => setConstructorOpen(false)}
        onSave={handleSaveDashboard}
        currentButtons={dashboardButtons}
      />
    </Box>
  );
};

export default Dashboard;
