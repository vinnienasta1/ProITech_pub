import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Inventory as InventoryIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Assignment as AssignmentIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { getUsers } from '../storage/entitiesStorage';
import { getEquipment } from '../storage/equipmentStorage';
import { getStatusColor } from '../utils/statusUtils';

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
  phone?: string;
  location?: string;
}

// Интерфейс Equipment используется в getUserEquipment
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Equipment {
  id: string;
  name: string;
  type: string;
  inventoryNumber: string;
  status: string;
  user: string;
  department: string;
  location: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  warrantyMonths: number;
  cost?: number;
  comment?: string;
}

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetailsOpen, setUserDetailsOpen] = useState(false);

  // Получаем данные
  const users = useMemo(() => getUsers(), []);
  const equipment = useMemo(() => getEquipment(), []);

  // Фильтруем пользователей по поиску
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    
    return users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.position.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);

  // Получаем технику для конкретного пользователя
  const getUserEquipment = useCallback((userName: string) => {
    return equipment.filter(item => item.user === userName);
  }, [equipment]);

  // Получаем статистику по пользователю
  const getUserStats = (userName: string) => {
    const userEquipment = getUserEquipment(userName);
    const total = userEquipment.length;
    const active = userEquipment.filter(item => item.status === 'Активно').length;
    const repair = userEquipment.filter(item => item.status === 'Ремонт').length;
    const maintenance = userEquipment.filter(item => item.status === 'На обслуживании').length;
    
    return { total, active, repair, maintenance };
  };

  // Получаем общую статистику
  const totalStats = useMemo(() => {
    const totalUsers = users.length;
    const usersWithEquipment = users.filter(user => getUserEquipment(user.name).length > 0).length;
    const totalEquipment = equipment.filter(item => item.user).length;
    
    return { totalUsers, usersWithEquipment, totalEquipment };
  }, [users, equipment, getUserEquipment]);

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setUserDetailsOpen(false);
    setSelectedUser(null);
  };

  return (
    <Box>
      {/* Заголовок страницы */}
      <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
        <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
        Пользователи
      </Typography>

      {/* Статистика */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 4 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                  {totalStats.totalUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Всего пользователей
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InventoryIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                  {totalStats.usersWithEquipment}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  С выданной техникой
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                  {totalStats.totalEquipment}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Выдано единиц техники
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
        
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BusinessIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
              <Box>
                <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                  {users.filter(u => u.department).length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Департаментов
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Поиск */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Поиск по имени, email, департаменту или должности..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      {/* Таблица пользователей */}
      <Paper sx={{ width: '100%' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Пользователь</TableCell>
                <TableCell>Департамент</TableCell>
                <TableCell>Должность</TableCell>
                <TableCell>Техника</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers.map((user) => {
                const stats = getUserStats(user.name);
                const hasEquipment = stats.total > 0;
                
                return (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <EmailIcon sx={{ fontSize: 14, mr: 0.5 }} />
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Chip 
                        label={user.department} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2">
                        {user.position}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      {hasEquipment ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {stats.total} ед.
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                            {stats.active > 0 && (
                              <Chip 
                                label={`${stats.active} активн.`} 
                                size="small" 
                                color="success" 
                                variant="outlined"
                              />
                            )}
                            {stats.repair > 0 && (
                              <Chip 
                                label={`${stats.repair} ремонт`} 
                                size="small" 
                                color="warning" 
                                variant="outlined"
                              />
                            )}
                            {stats.maintenance > 0 && (
                              <Chip 
                                label={`${stats.maintenance} обслуж.`} 
                                size="small" 
                                color="info" 
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          Нет техники
                        </Typography>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {hasEquipment ? (
                        <Chip 
                          label="Активен" 
                          size="small" 
                          color="success" 
                        />
                      ) : (
                        <Chip 
                          label="Неактивен" 
                          size="small" 
                          color="default" 
                        />
                      )}
                    </TableCell>
                    
                                         <TableCell>
                       <Tooltip title="Просмотр деталей">
                         <IconButton 
                           size="small" 
                           onClick={() => handleUserClick(user)}
                           color="primary"
                         >
                           <VisibilityIcon />
                         </IconButton>
                       </Tooltip>
                     </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Диалог с деталями пользователя */}
      <Dialog 
        open={userDetailsOpen} 
        onClose={handleCloseDetails} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
              {selectedUser?.name.charAt(0)}
            </Avatar>
            <Typography variant="h6">
              {selectedUser?.name}
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedUser && (
            <Box>
              {/* Информация о пользователе */}
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3, mb: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Информация о пользователе
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {selectedUser.email}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {selectedUser.department}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AssignmentIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {selectedUser.position}
                        </Typography>
                      </Box>
                      {selectedUser.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {selectedUser.phone}
                          </Typography>
                        </Box>
                      )}
                      {selectedUser.location && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {selectedUser.location}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
                
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      Статистика по технике
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Всего единиц:</Typography>
                        <Chip label={getUserStats(selectedUser.name).total} color="primary" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Активная:</Typography>
                        <Chip label={getUserStats(selectedUser.name).active} color="success" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">В ремонте:</Typography>
                        <Chip label={getUserStats(selectedUser.name).repair} color="warning" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">На обслуживании:</Typography>
                        <Chip label={getUserStats(selectedUser.name).maintenance} color="info" />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Box>

              {/* Список выданной техники */}
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Выданная техника
                    </Typography>
                    {getUserEquipment(selectedUser.name).length > 0 && (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          const userEquipment = getUserEquipment(selectedUser.name);
                          const equipmentText = userEquipment.map((item) => 
                            `• ${item.name} (${item.type})\n  Производитель: ${item.manufacturer} ${item.model}\n  Инв. №: ${item.inventoryNumber}\n  Серийный: ${item.serialNumber}\n  Статус: ${item.status}`
                          ).join('\n\n');
                          
                          const fullText = `Техника пользователя: ${selectedUser.name}\n\n${equipmentText}`;
                          
                          navigator.clipboard.writeText(fullText).then(() => {
                            // Показываем уведомление об успехе
                            console.log('Данные скопированы в буфер обмена');
                          }).catch(() => {
                            console.error('Ошибка копирования');
                          });
                        }}
                        sx={{ 
                          minWidth: 'auto',
                          px: 2,
                          py: 0.5,
                          fontSize: '0.75rem'
                        }}
                      >
                        Скопировать данные о технике
                      </Button>
                    )}
                  </Box>
                  
                  {getUserEquipment(selectedUser.name).length > 0 ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {getUserEquipment(selectedUser.name).map((item, index) => (
                        <Box 
                          key={item.id} 
                          sx={{ 
                            p: 2.5, 
                            border: '1px solid', 
                            borderColor: 'divider', 
                            borderRadius: 2,
                            backgroundColor: 'background.paper',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              borderColor: 'primary.main',
                              backgroundColor: 'action.hover',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {item.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {item.type} • {item.manufacturer} {item.model}
                              </Typography>
                            </Box>
                            <Chip 
                              label={item.status} 
                              size="small" 
                              color={getStatusColor(item.status) as any}
                              sx={{ ml: 1, flexShrink: 0 }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, fontSize: '0.75rem' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Инв. №:
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                {item.inventoryNumber}
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Серийный:
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 500 }}>
                                {item.serialNumber}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      border: '2px dashed',
                      borderColor: 'divider',
                      borderRadius: 2,
                      backgroundColor: 'action.hover'
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        Пользователю не выдана техника
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDetails} variant="outlined">
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
