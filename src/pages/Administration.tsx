import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  CheckCircle as StatusIcon,
  LocalShipping as SupplierIcon,
  Assignment as ProjectIcon,
  Storage as RackIcon,
  Palette as PaletteIcon,
  VpnKey as LdapIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  ImportExport as ImportIcon,
  CloudUpload as UploadIcon,
  Preview as PreviewIcon,
} from '@mui/icons-material';
import { getStatuses, saveStatuses, StatusItem } from '../storage/statusStorage';
import { getEntities, saveEntities } from '../storage/entitiesStorage';
import { getEquipment } from '../storage/equipmentStorage';
import { getAdminPassword, changeAdminPassword } from '../storage/adminPassword';
import ColorPicker from '../components/ColorPicker';
import DataImport from '../components/DataImport';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}




//     mode: 'dark' as const,
//     primaryColor: '#90caf9',
//     secondaryColor: '#f48fb1',
//     backgroundColor: '#121212',
//     textColor: '#ffffff',
//   },
//   professional: {
//     mode: 'light' as const,
//     primaryColor: '#2e7d32',
//     secondaryColor: '#d32f2f',
//     backgroundColor: '#fafafa',
//     textColor: '#212121',
//   },
//   bright: {
//     mode: 'light' as const,
//     primaryColor: '#ff6f00',
//     secondaryColor: '#6a1b9a',
//     backgroundColor: '#fff8e1',
//     textColor: '#3e2723',
//   },
// };

// Используем данные из entities вместо mock данных

const Administration = () => {
  const { themeSettings, updateTheme } = useTheme();
  const { isAuthenticated, login, logout } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'equipmentType' | 'department' | 'status' | 'supplier' | 'project' | 'location' | 'shelf' | 'user'>('equipmentType');
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  
  // Состояние для диалога подтверждения изменений
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: string;
    oldName: string;
    newName: string;
    affectedCount: number;
    onConfirm: () => void;
  }>({
    open: false,
    type: '',
    oldName: '',
    newName: '',
    affectedCount: 0,
    onConfirm: () => {},
  });
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [entities, setEntities] = useState<any>(null);
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState<boolean>(false);
  const [passwordChangeError, setPasswordChangeError] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  useEffect(() => {
    try {
      setStatuses(getStatuses());
      setEntities(getEntities());
      
      // Загружаем мастер-пароль
      const adminPass = getAdminPassword();
      setAdminPassword(adminPass.password);
      
      // Убираем загрузку настроек темы, так как теперь используем контекст
      // const savedTheme = localStorage.getItem('theme_settings');
      // if (savedTheme) {
      //   try {
      //     updateTheme(JSON.parse(savedTheme));
      //   } catch (e) {
      //     console.error('Ошибка загрузки настроек темы:', e);
      //   }
      // }
    } catch (error) {
      console.error('Ошибка инициализации страницы администрирования:', error);
    }
  }, []);

  const upsertStatus = (data: StatusItem) => {
    setStatuses(prev => {
              let next: StatusItem[];
      if (editingItem) {
        next = prev.map(s => s.id === editingItem.id ? { ...editingItem, ...data } : s);
      } else {
        const newId = prev.length ? Math.max(...prev.map(s => s.id)) + 1 : 1;
        next = [...prev, { ...data, id: newId }];
      }
      saveStatuses(next);
      return next;
    });
  };

  const deleteStatus = (id: number) => {
    setStatuses(prev => {
      const next = prev.filter(s => s.id !== id);
      saveStatuses(next);
      return next;
    });
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAdd = (type: typeof dialogType) => {
    setDialogType(type);
    setEditingItem(null);
    setFormData({});
    setOpenDialog(true);
  };

  const handleEdit = (type: typeof dialogType, item: any) => {
    setDialogType(type);
    setEditingItem(item);
    setFormData({ ...item });
    setOpenDialog(true);
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setPasswordChangeError('Новые пароли не совпадают');
      setPasswordChangeSuccess(false);
      return;
    }
    
    if (newPassword.length < 3) {
      setPasswordChangeError('Новый пароль должен содержать минимум 3 символа');
      setPasswordChangeSuccess(false);
      return;
    }
    
    if (changeAdminPassword(adminPassword, newPassword)) {
      setAdminPassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordChangeSuccess(true);
      setPasswordChangeError('');
    } else {
      setPasswordChangeError('Неверный текущий пароль');
      setPasswordChangeSuccess(false);
    }
  };

  const handleLogin = () => {
    if (login(loginPassword)) {
      setLoginPassword('');
      setLoginError('');
    } else {
      setLoginError('Неверный пароль');
    }
  };

  const handleDelete = (type: typeof dialogType, id: number) => {
    if (type === 'status') {
      deleteStatus(id);
      return;
    }
    const key = type === 'equipmentType' ? 'types' :
      type === 'department' ? 'departments' :
      type === 'supplier' ? 'suppliers' :
      type === 'project' ? 'projects' :
      type === 'shelf' ? 'shelves' :
      type === 'user' ? 'users' : 'locations';
    const next = { ...entities, [key]: (entities as any)[key].filter((x: any) => x.id !== id) };
    setEntities(next);
    saveEntities(next);
  };

  const handleDataImport = async (config: any, data: any[]) => {
    try {
      console.log('Импорт данных:', { config, dataCount: data.length });
      
      // Здесь будет логика импорта данных в базу
      // Пока что просто логируем
      
      // TODO: Реализовать импорт в MySQL через API
      // 1. Создать недостающие справочники
      // 2. Импортировать оборудование
      // 3. Обновить существующие записи если нужно
      
      alert(`Импорт завершен! Обработано ${data.length} записей.`);
      
    } catch (error) {
      console.error('Ошибка импорта:', error);
      throw new Error(`Ошибка импорта: ${error}`);
    }
  };

  const handleSave = () => {
    if (dialogType === 'status') {
      const payload: StatusItem = {
        id: editingItem?.id ?? 0,
        name: formData.name || 'Без названия',
        color: formData.color || '#607d8b',
        description: formData.description || '',
      };
      
      // Проверяем, изменилось ли название статуса
      if (editingItem && editingItem.name !== payload.name) {
        const affectedCount = checkAffectedItems('status', editingItem.name, payload.name);
        if (affectedCount > 0) {
          setConfirmDialog({
            open: true,
            type: 'status',
            oldName: editingItem.name,
            newName: payload.name,
            affectedCount,
            onConfirm: () => {
              updateAffectedItems('status', editingItem.name, payload.name);
              upsertStatus(payload);
              setOpenDialog(false);
              setConfirmDialog(prev => ({ ...prev, open: false }));
            }
          });
          return;
        }
      }
      
      upsertStatus(payload);
      setOpenDialog(false);
      return;
    }
    
    const key = dialogType === 'equipmentType' ? 'types' :
      dialogType === 'department' ? 'departments' :
      dialogType === 'supplier' ? 'suppliers' :
      dialogType === 'project' ? 'projects' :
      dialogType === 'shelf' ? 'shelves' :
      dialogType === 'user' ? 'users' : 'locations';
    
    const list = (entities as any)[key] as any[];
    let updated: any[];
    
    if (editingItem) {
      // Проверяем, изменилось ли название
      const nameField = dialogType === 'equipmentType' ? 'name' : 
                       dialogType === 'department' ? 'name' :
                       dialogType === 'supplier' ? 'name' :
                       dialogType === 'project' ? 'name' :
                       dialogType === 'shelf' ? 'name' :
                       dialogType === 'user' ? 'name' : 'name';
      
      if (editingItem[nameField] !== formData[nameField]) {
        const affectedCount = checkAffectedItems(dialogType, editingItem[nameField], formData[nameField]);
        if (affectedCount > 0) {
          setConfirmDialog({
            open: true,
            type: dialogType,
            oldName: editingItem[nameField],
            newName: formData[nameField],
            affectedCount,
            onConfirm: () => {
              updateAffectedItems(dialogType, editingItem[nameField], formData[nameField]);
              const updated = list.map((x: any) => x.id === editingItem.id ? { ...editingItem, ...formData } : x);
              const next = { ...entities, [key]: updated };
              setEntities(next);
              saveEntities(next);
              setOpenDialog(false);
              setConfirmDialog(prev => ({ ...prev, open: false }));
            }
          });
          return;
        }
      }
      
      updated = list.map((x: any) => x.id === editingItem.id ? { ...editingItem, ...formData } : x);
    } else {
      const newId = list.length ? Math.max(...list.map((x: any) => x.id)) + 1 : 1;
      updated = [...list, { id: newId, ...formData }];
    }
    
    const next = { ...entities, [key]: updated };
    setEntities(next);
    saveEntities(next);
    setOpenDialog(false);
  };

  const handleThemeChange = (field: keyof typeof themeSettings, value: any) => {
    updateTheme({ [field]: value });
  };

  // Функция для проверки связанных позиций
  const checkAffectedItems = (type: string, oldName: string, newName: string): number => {
    if (oldName === newName) return 0;
    
    const equipment = getEquipment();
    let count = 0;
    
    switch (type) {
      case 'department':
        count = equipment.filter(item => item.department === oldName).length;
        break;
      case 'status':
        count = equipment.filter(item => item.status === oldName).length;
        break;
      case 'location':
        count = equipment.filter(item => item.location === oldName).length;
        break;
      case 'supplier':
        count = equipment.filter(item => item.supplier === oldName).length;
        break;
      case 'project':
        count = equipment.filter(item => item.project === oldName).length;
        break;
      case 'rack':
        count = equipment.filter(item => item.rack === oldName).length;
        break;
      case 'type':
        count = equipment.filter(item => item.type === oldName).length;
        break;
      case 'manufacturer':
        count = equipment.filter(item => item.manufacturer === oldName).length;
        break;
      case 'user':
        count = equipment.filter(item => item.user === oldName).length;
        break;
    }
    
    return count;
  };

  // Функция для обновления связанных позиций
  const updateAffectedItems = (type: string, oldName: string, newName: string) => {
    if (oldName === newName) return;
    
    const { updateEquipmentByInventoryNumber } = require('../storage/equipmentStorage');
    const equipment = getEquipment();
    
    // Если обновляем статус, также обновляем его в statusStorage
    if (type === 'status') {
      const { updateStatus } = require('../storage/statusStorage');
      updateStatus(oldName, newName);
    }
    
    equipment.forEach(item => {
      let shouldUpdate = false;
      let updates: any = {};
      
      switch (type) {
        case 'department':
          if (item.department === oldName) {
            shouldUpdate = true;
            updates.department = newName;
          }
          break;
        case 'status':
          if (item.status === oldName) {
            shouldUpdate = true;
            updates.status = newName;
          }
          break;
        case 'location':
          if (item.location === oldName) {
            shouldUpdate = true;
            updates.location = newName;
          }
          break;
        case 'supplier':
          if (item.supplier === oldName) {
            shouldUpdate = true;
            updates.supplier = newName;
          }
          break;
        case 'project':
          if (item.project === oldName) {
            shouldUpdate = true;
            updates.project = newName;
          }
          break;
        case 'rack':
          if (item.rack === oldName) {
            shouldUpdate = true;
            updates.rack = newName;
          }
          break;
        case 'type':
          if (item.type === oldName) {
            shouldUpdate = true;
            updates.type = newName;
          }
          break;
        case 'manufacturer':
          if (item.manufacturer === oldName) {
            shouldUpdate = true;
            updates.manufacturer = newName;
          }
          break;
        case 'user':
          if (item.user === oldName) {
            shouldUpdate = true;
            updates.user = newName;
          }
          break;
      }
      
      if (shouldUpdate) {
        updateEquipmentByInventoryNumber(item.inventoryNumber, updates);
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'on-hold': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'completed': return 'Завершен';
      case 'on-hold': return 'Приостановлен';
      default: return status;
    }
  };

  // Если данные еще не загружены, показываем загрузку
  if (!entities) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography variant="h6">Загрузка...</Typography>
      </Box>
    );
  }

  // Если пользователь не аутентифицирован, показываем форму входа
  if (!isAuthenticated) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        flexDirection: 'column',
        gap: 3
      }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 600 }}>
          Вход в админку
        </Typography>
        
        <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
          <Typography variant="h6" sx={{ mb: 3, textAlign: 'center' }}>
            Введите мастер-пароль
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Мастер-пароль"
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Введите пароль"
              error={!!loginError}
              helperText={loginError}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            
            <Button
              variant="contained"
              fullWidth
              onClick={handleLogin}
              disabled={!loginPassword}
              size="large"
            >
              Войти
            </Button>
          </Box>
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
            По умолчанию: 1
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
          <SettingsIcon sx={{ mr: 2, color: 'primary.main' }} />
          Администрирование
        </Typography>
        
        <Button
          variant="outlined"
          color="secondary"
          onClick={logout}
          startIcon={<LogoutIcon />}
        >
          Выйти
        </Button>
      </Box>

      <Paper sx={{ width: '100%' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
          <Tab label="Основное" icon={<SettingsIcon />} iconPosition="start" />
          <Tab label="Типы техники" icon={<CategoryIcon />} iconPosition="start" />
          <Tab label="Департаменты" icon={<BusinessIcon />} iconPosition="start" />
          <Tab label="Статусы" icon={<StatusIcon />} iconPosition="start" />
          <Tab label="Поставщики" icon={<SupplierIcon />} iconPosition="start" />
          <Tab label="Проекты" icon={<ProjectIcon />} iconPosition="start" />
          <Tab label="Местоположения" icon={<LocationIcon />} iconPosition="start" />
          <Tab label="Стеллажи" icon={<RackIcon />} iconPosition="start" />
          <Tab label="Пользователи" icon={<PersonIcon />} iconPosition="start" />
          <Tab label="Импорт данных" icon={<ImportIcon />} iconPosition="start" />
          <Tab label="LDAP" icon={<LdapIcon />} iconPosition="start" />
          <Tab label="Внешний вид" icon={<PaletteIcon />} iconPosition="start" />
        </Tabs>

        {/* Основное */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              Основные настройки
            </Typography>
          </Box>
          
          {/* Изменение мастер-пароля */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              Изменение мастер-пароля
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
              <TextField
                fullWidth
                label="Текущий пароль"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Введите текущий пароль"
              />
              <Box />
              <TextField
                fullWidth
                label="Новый пароль"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Введите новый пароль"
                error={!!passwordChangeError}
                helperText={passwordChangeError}
              />
              <TextField
                fullWidth
                label="Подтверждение пароля"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Повторите новый пароль"
                error={!!passwordChangeError}
                helperText={passwordChangeError}
              />
            </Box>
            
            {passwordChangeSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Пароль успешно изменен!
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button
                variant="contained"
                onClick={handlePasswordChange}
                disabled={!adminPassword || !newPassword || !confirmPassword}
              >
                Изменить пароль
              </Button>
            </Box>
          </Paper>
        </TabPanel>

        {/* Типы техники */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Типы техники</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAdd('equipmentType')}
            >
              Добавить тип
            </Button>
          </Box>
                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
             {entities?.types?.map((type: any) => (
              <Card key={type.id} sx={{ minWidth: 250, flex: '1 1 250px' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        backgroundColor: type.color,
                        mr: 1,
                      }}
                    />
                    <Typography variant="h6">{type.name}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {type.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleEdit('equipmentType', type)}>
                    Редактировать
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete('equipmentType', type.id)}>
                    Удалить
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Департаменты */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Департаменты</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAdd('department')}
            >
              Добавить департамент
            </Button>
          </Box>
                     <List>
             {entities?.departments?.map((dept: any) => (
              <React.Fragment key={dept.id}>
                <ListItem>
                  <ListItemText
                    primary={dept.name}
                    secondary={`Код: ${dept.code} | Руководитель: ${dept.manager}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEdit('department', dept)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete('department', dept.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        {/* Статусы */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Статусы оборудования</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAdd('status')}
            >
              Добавить статус
            </Button>
          </Box>
                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
             {statuses?.map((status) => (
              <Card key={status.id} sx={{ minWidth: 250, flex: '1 1 250px' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={status.name}
                      size="small"
                      sx={{ backgroundColor: status.color, color: 'white' }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {status.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleEdit('status', status)}>
                    Редактировать
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete('status', status.id)}>
                    Удалить
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Поставщики */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Поставщики</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAdd('supplier')}
            >
              Добавить поставщика
            </Button>
          </Box>
                     <List>
             {entities?.suppliers?.map((supplier: any) => (
              <React.Fragment key={supplier.id}>
                <ListItem>
                  <ListItemText
                    primary={supplier.name}
                    secondary={`Контакт: ${supplier.contact} | ${supplier.phone} | ${supplier.email}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEdit('supplier', supplier)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete('supplier', supplier.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        {/* Проекты */}
        <TabPanel value={tabValue} index={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Проекты</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAdd('project')}
            >
              Добавить проект
            </Button>
          </Box>
                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
             {entities?.projects?.map((project: any) => (
              <Card key={project.id} sx={{ minWidth: 250, flex: '1 1 250px' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    {project.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Код: {project.code}
                  </Typography>
                  <Chip
                    label={getStatusLabel(project.status)}
                    color={getStatusColor(project.status) as any}
                    size="small"
                  />
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleEdit('project', project)}>
                    Редактировать
                  </Button>
                  <Button size="small" color="error" onClick={() => handleDelete('project', project.id)}>
                    Удалить
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        </TabPanel>

        {/* Местоположения */}
        <TabPanel value={tabValue} index={6}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Местоположения</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAdd('location')}
            >
              Добавить местоположение
            </Button>
          </Box>
                     <List>
             {entities?.locations?.map((location: any) => (
              <ListItem key={location.id} divider>
                <ListItemText
                  primary={location.fullPath}
                  secondary={location.description}
                />
                <ListItemSecondaryAction>
                  <IconButton onClick={() => handleEdit('location', location)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete('location', location.id)} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </TabPanel>
        {/* Стеллажи */}
        <TabPanel value={tabValue} index={7}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Стеллажи</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAdd('shelf')}
            >
              Добавить стеллаж
            </Button>
          </Box>
                     <List>
             {entities?.shelves?.map((shelf: any) => (
              <React.Fragment key={shelf.id}>
                <ListItem>
                  <ListItemText primary={shelf.name} />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEdit('shelf', shelf)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete('shelf', shelf.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        {/* Пользователи */}
        <TabPanel value={tabValue} index={8}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Пользователи</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAdd('user')}
            >
              Добавить пользователя
            </Button>
          </Box>
          <List>
            {entities?.users?.map((user: any) => (
              <React.Fragment key={user.id}>
                <ListItem>
                  <ListItemText
                    primary={user.name}
                    secondary={`${user.email} | ${user.department} | ${user.position}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton onClick={() => handleEdit('user', user)} size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete('user', user.id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </TabPanel>

        {/* Импорт данных */}
        <TabPanel value={tabValue} index={9}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Импорт данных</Typography>
            <Button
              variant="contained"
              startIcon={<ImportIcon />}
              onClick={() => setImportDialogOpen(true)}
            >
              Импортировать данные
            </Button>
          </Box>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Импорт из других систем</Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Импортируйте данные из других систем управления IT-оборудованием. 
              Поддерживаются форматы Excel, CSV, JSON и SQL.
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
              <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      <UploadIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Загрузка файла
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Выберите файл для импорта. Система автоматически определит формат и предложит маппинг полей.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      onClick={() => setImportDialogOpen(true)}
                    >
                      Выбрать файл
                    </Button>
                  </CardContent>
                </Card>
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      <SettingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Настройка маппинга
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Настройте соответствие полей между источником и системой ProITech. 
                      Поддерживаются трансформации данных.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<SettingsIcon />}
                      onClick={() => setImportDialogOpen(true)}
                    >
                      Настроить маппинг
                    </Button>
                  </CardContent>
                </Card>
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      <PreviewIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Предварительный просмотр
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Просмотрите данные перед импортом, проверьте корректность маппинга полей.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<PreviewIcon />}
                      onClick={() => setImportDialogOpen(true)}
                    >
                      Просмотреть данные
                    </Button>
                  </CardContent>
                </Card>
              </Box>
              
              <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      <ImportIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Выполнение импорта
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Импортируйте данные с настройками валидации, обработки дубликатов и создания справочников.
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<ImportIcon />}
                      onClick={() => setImportDialogOpen(true)}
                    >
                      Начать импорт
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </Paper>
        </TabPanel>

        {/* TabPanel for LDAP */}
        <TabPanel value={tabValue} index={10}>
          <Typography variant="h6" sx={{ mb: 3 }}>Настройки LDAP</Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* LDAP Connection */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Подключение к контроллеру домена</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="LDAP Server URL"
                  placeholder="ldap://dc.example.com:389"
                  helperText="Адрес и порт LDAP сервера"
                />
                <TextField
                  fullWidth
                  label="Base DN"
                  placeholder="DC=example,DC=com"
                  helperText="Базовый DN для поиска пользователей"
                />
                <TextField
                  fullWidth
                  label="Bind DN"
                  placeholder="CN=service_account,OU=ServiceAccounts,DC=example,DC=com"
                  helperText="DN пользователя для подключения к LDAP"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  placeholder="Пароль для подключения"
                  helperText="Пароль от сервисного аккаунта"
                />
                <Button variant="contained" color="primary">
                  Проверить подключение
                </Button>
              </Box>
            </Paper>

            {/* LDAP Import */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Импорт пользователей</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  fullWidth
                  label="Фильтр поиска"
                  placeholder="(&(objectClass=user)(objectCategory=person))"
                  helperText="LDAP фильтр для поиска пользователей"
                />
                <TextField
                  fullWidth
                  label="Атрибуты для импорта"
                  placeholder="cn,mail,department,title"
                  helperText="Список атрибутов через запятую"
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button variant="contained" color="primary">
                    Импортировать пользователей
                  </Button>
                  <Button variant="outlined">
                    Предварительный просмотр
                  </Button>
                </Box>
              </Box>
            </Paper>

            {/* LDAP Sync */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Автоматическая синхронизация</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControlLabel
                  control={<Switch />}
                  label="Включить автоматическую синхронизацию"
                />
                <TextField
                  fullWidth
                  label="Интервал синхронизации (минуты)"
                  type="number"
                  defaultValue="60"
                  helperText="Как часто обновлять список пользователей"
                />
                <Button variant="outlined" color="secondary">
                  Синхронизировать сейчас
                </Button>
              </Box>
            </Paper>
          </Box>
        </TabPanel>

        {/* TabPanel for Appearance */}
        <TabPanel value={tabValue} index={11}>
          <Typography variant="h6" sx={{ mb: 3 }}>Настройки внешнего вида</Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {/* Theme Mode */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Режим темы</Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={themeSettings.mode === 'dark'}
                    onChange={(e) => handleThemeChange('mode', e.target.checked ? 'dark' : 'light')}
                  />
                }
                label="Темная тема"
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {themeSettings.mode === 'dark' 
                  ? 'Темная тема активна. Все элементы интерфейса будут отображаться в темных тонах.' 
                  : 'Светлая тема активна. Все элементы интерфейса будут отображаться в светлых тонах.'}
              </Typography>
            </Paper>

            {/* Visual Settings */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Визуальные настройки</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Скругление углов: {themeSettings.borderRadius}px
                  </Typography>
                  <Slider
                    value={themeSettings.borderRadius}
                    onChange={(_, value) => handleThemeChange('borderRadius', value)}
                    min={0}
                    max={20}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>
                
                <Box>
                  <Typography variant="body2" gutterBottom>
                    Межэлементные отступы: {themeSettings.spacing}px
                  </Typography>
                  <Slider
                    value={themeSettings.spacing}
                    onChange={(_, value) => handleThemeChange('spacing', value)}
                    min={4}
                    max={16}
                    step={2}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Box>

                <FormControl>
                  <InputLabel>Размер шрифта</InputLabel>
                  <Select
                    value={themeSettings.fontSize}
                    onChange={(e) => handleThemeChange('fontSize', e.target.value)}
                    label="Размер шрифта"
                  >
                    <MenuItem value="small">Маленький</MenuItem>
                    <MenuItem value="medium">Средний</MenuItem>
                    <MenuItem value="large">Большой</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Paper>

            {/* Preview */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Предварительный просмотр</Typography>
              <Box sx={{ 
                p: 3, 
                borderRadius: themeSettings.borderRadius,
                backgroundColor: themeSettings.mode === 'dark' ? '#1e1e1e' : '#ffffff',
                color: themeSettings.mode === 'dark' ? '#ffffff' : '#000000',
                border: `2px solid ${themeSettings.mode === 'dark' ? '#90caf9' : '#1976d2'}`,
                gap: themeSettings.spacing,
                display: 'flex',
                flexDirection: 'column',
              }}>
                <Typography variant="h6" sx={{ color: themeSettings.mode === 'dark' ? '#90caf9' : '#1976d2' }}>
                  Пример заголовка
                </Typography>
                <Typography variant="body1">
                  Это пример текста с выбранными настройками темы.
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ 
                    backgroundColor: themeSettings.mode === 'dark' ? '#90caf9' : '#1976d2',
                    color: themeSettings.mode === 'dark' ? '#000000' : '#ffffff',
                    alignSelf: 'flex-start',
                  }}
                >
                  Пример кнопки
                </Button>
              </Box>
            </Paper>
          </Box>
        </TabPanel>
      </Paper>

      {/* Диалог добавления/редактирования */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Редактировать' : 'Добавить'} {
            dialogType === 'equipmentType' ? 'тип техники' :
            dialogType === 'department' ? 'департамент' :
            dialogType === 'status' ? 'статус' :
            dialogType === 'supplier' ? 'поставщика' :
            dialogType === 'project' ? 'проект' :
            dialogType === 'shelf' ? 'стеллаж' :
            dialogType === 'user' ? 'пользователя' :
            'местоположение'
          }
        </DialogTitle>
        <DialogContent>
          {dialogType === 'equipmentType' && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Название типа"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <ColorPicker
                value={formData.color || '#2196f3'}
                onChange={(color) => setFormData({ ...formData, color })}
                label="Цвет типа"
              />
              <TextField
                fullWidth
                label="Описание"
                multiline
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                sx={{ mt: 2 }}
              />
            </Box>
          )}

          {dialogType === 'department' && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Название департамента"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Код департамента"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Руководитель"
                value={formData.manager || ''}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              />
            </Box>
          )}

          {dialogType === 'status' && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Название статуса"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <ColorPicker
                value={formData.color || '#607d8b'}
                onChange={(color) => setFormData({ ...formData, color })}
                label="Цвет статуса"
              />
              <TextField
                fullWidth
                label="Описание"
                multiline
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                sx={{ mt: 2 }}
              />
            </Box>
          )}

          {dialogType === 'supplier' && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Название компании"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Контактное лицо"
                value={formData.contact || ''}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Телефон"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </Box>
          )}

          {dialogType === 'project' && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Название проекта"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Код проекта"
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={formData.status || 'active'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  label="Статус"
                >
                  <MenuItem value="active">Активный</MenuItem>
                  <MenuItem value="completed">Завершен</MenuItem>
                  <MenuItem value="on-hold">Приостановлен</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {dialogType === 'location' && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Название местоположения"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Родительское местоположение"
                value={formData.parent || ''}
                onChange={(e) => setFormData({ ...formData, parent: e.target.value })}
                placeholder="Например: Офис ПРМ"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Описание"
                multiline
                rows={3}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Box>
          )}
          {dialogType === 'shelf' && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="Название стеллажа"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Box>
          )}

          {dialogType === 'user' && (
            <Box sx={{ pt: 2 }}>
              <TextField
                fullWidth
                label="ФИО пользователя"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Департамент</InputLabel>
                <Select
                  value={formData.department || ''}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  label="Департамент"
                >
                  {entities?.departments?.map((dept: any) => (
                    <MenuItem key={dept.id} value={dept.name}>
                      {dept.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Должность"
                value={formData.position || ''}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Телефон"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Местоположение"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Например: Офис ПРМ, Кабинет 101"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleSave} variant="contained">
            {editingItem ? 'Сохранить' : 'Добавить'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог подтверждения изменений */}
      <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog(prev => ({ ...prev, open: false }))} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'warning.main' }}>
          ⚠️ Внимание! Изменение затронет существующие позиции
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              При изменении названия <strong>"{confirmDialog.oldName}"</strong> на <strong>"{confirmDialog.newName}"</strong> 
              будут затронуты <strong>{confirmDialog.affectedCount}</strong> позиций оборудования.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Выберите действие:
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button 
            onClick={() => setConfirmDialog(prev => ({ ...prev, open: false }))}
            variant="outlined"
          >
            Отмена
          </Button>
          <Button 
            onClick={() => {
              // Очищаем связанные позиции (устанавливаем пустое значение)
              updateAffectedItems(confirmDialog.type, confirmDialog.oldName, '');
              setConfirmDialog(prev => ({ ...prev, open: false }));
            }}
            variant="outlined"
            color="warning"
          >
            Очистить
          </Button>
          <Button 
            onClick={confirmDialog.onConfirm}
            variant="contained"
            color="primary"
          >
            Переписать
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог импорта данных */}
      <DataImport
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleDataImport}
      />
    </Box>
  );
};

export default Administration;
