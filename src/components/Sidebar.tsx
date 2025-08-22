import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  Add as AddIcon,
  Settings as SettingsIcon,
  Assignment as InventoryCheckIcon,
  Print as PrintIcon,
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const drawerWidth = 280;

const menuItems = [
  { text: 'Дашборд', icon: <DashboardIcon />, path: '/' },
  { text: 'Оборудование', icon: <InventoryIcon />, path: '/equipment' },
  { text: 'Инвентаризация', icon: <InventoryCheckIcon />, path: '/inventory' },
  { text: 'Принтеры', icon: <PrintIcon />, path: '/printers' },
  { text: 'Администрирование', icon: <SettingsIcon />, path: '/administration' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeSettings, toggleTheme } = useTheme();

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: 'primary.main',
            fontWeight: 700,
            textAlign: 'center',
            mb: 1,
          }}
        >
          ProITech
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            mb: 3,
          }}
        >
          Система управления оборудованием
        </Typography>
        
        {/* Кнопка переключения темы */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <IconButton
            onClick={toggleTheme}
            color="inherit"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              p: 1,
            }}
          >
            {themeSettings.mode === 'dark' ? <LightIcon /> : <DarkIcon />}
          </IconButton>
        </Box>
      </Box>

      <Divider />

      <List sx={{ px: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{
                borderRadius: 2,
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: 'primary.main',
                  },
                },
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? 'inherit' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiTypography-root': {
                    fontWeight: location.pathname === item.path ? 600 : 400,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 2 }}>
        <ListItemButton
          onClick={() => navigate('/equipment/new')}
          sx={{
            borderRadius: 2,
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'inherit' }}>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Добавить оборудование" />
        </ListItemButton>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
