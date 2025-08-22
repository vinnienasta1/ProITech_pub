import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
} from '@mui/material';
import {
  Inventory as InventoryIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

// Импортируем mock данные для подсчета статистики
const mockEquipment = [
  { status: 'Активно' },
  { status: 'Активно' },
  { status: 'Ремонт' },
  { status: 'Активно' },
  { status: 'Активно' },
  { status: 'Активно' },
  { status: 'На обслуживании' },
  { status: 'Активно' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  // Подсчитываем статистику на основе mock данных
  const totalEquipment = mockEquipment.length;
  const activeEquipment = mockEquipment.filter(e => e.status === 'Активно').length;
  const repairEquipment = mockEquipment.filter(e => e.status === 'Ремонт').length;
  const maintenanceEquipment = mockEquipment.filter(e => e.status === 'На обслуживании').length;

  const stats = [
    {
      title: 'Всего оборудования',
      value: totalEquipment.toString(),
      icon: <InventoryIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main',
    },
    {
      title: 'Активное',
      value: activeEquipment.toString(),
      icon: <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main',
    },
    {
      title: 'Требует ремонта',
      value: repairEquipment.toString(),
      icon: <WarningIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.main',
    },
    {
      title: 'На обслуживании',
      value: maintenanceEquipment.toString(),
      icon: <ScheduleIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.main',
    },
  ];

  const handleStatClick = (index: number) => {
    switch (index) {
      case 0:
        navigate('/equipment');
        break;
      case 1:
        navigate('/equipment?status=Активно');
        break;
      case 2:
        navigate('/equipment?status=Ремонт');
        break;
      case 3:
        navigate('/equipment?status=На обслуживании');
        break;
      default:
        navigate('/equipment');
    }
  };

  const recentEquipment = [
    { name: 'Ноутбук Dell Latitude 5520', status: 'Активно', location: 'Офис ПРМ - Кабинет' },
    { name: 'Принтер HP LaserJet Pro', status: 'Активно', location: 'Офис ПРМ - Кабинет' },
    { name: 'Монитор Samsung 24"', status: 'Ремонт', location: 'Офис ПРМ - Серверная' },
    { name: 'Сетевое оборудование Cisco', status: 'Активно', location: 'Офис ПРМ - Серверная' },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 600 }}>
        Дашборд
      </Typography>

      {/* Статистика */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        {stats.map((stat, index) => (
          <Box sx={{ flex: '1 1 250px', minWidth: 0 }} key={index}>
            <Card
              sx={{
                height: '100%',
                background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}05 100%)`,
                border: `1px solid ${stat.color}20`,
                cursor: 'pointer',
              }}
              onClick={() => handleStatClick(index)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {stat.icon}
                  <Box sx={{ ml: 2 }}>
                    <Typography variant="h3" component="div" sx={{ fontWeight: 700, color: stat.color }}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Недавнее оборудование */}
      <Box>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Недавно добавленное
          </Typography>
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
                        color={item.status === 'Активно' ? 'success' : 'warning'}
                        variant="outlined"
                      />
                      <Typography variant="caption" color="text.secondary">
                        {item.location}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;
