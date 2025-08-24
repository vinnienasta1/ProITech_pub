const ADMIN_PASSWORD_KEY = 'admin_master_password';
const DEFAULT_PASSWORD = '1';

export interface AdminPassword {
  password: string;
  lastChanged: Date;
}

export const getAdminPassword = (): AdminPassword => {
  try {
    const stored = localStorage.getItem(ADMIN_PASSWORD_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        password: parsed.password,
        lastChanged: new Date(parsed.lastChanged)
      };
    }
  } catch (error) {
    console.error('Ошибка загрузки мастер-пароля:', error);
  }
  
  // Возвращаем пароль по умолчанию, если ничего не сохранено
  return {
    password: DEFAULT_PASSWORD,
    lastChanged: new Date()
  };
};

export const saveAdminPassword = (password: string): void => {
  try {
    const adminPassword: AdminPassword = {
      password,
      lastChanged: new Date()
    };
    localStorage.setItem(ADMIN_PASSWORD_KEY, JSON.stringify(adminPassword));
  } catch (error) {
    console.error('Ошибка сохранения мастер-пароля:', error);
  }
};

export const verifyAdminPassword = (inputPassword: string): boolean => {
  const adminPassword = getAdminPassword();
  return adminPassword.password === inputPassword;
};

export const changeAdminPassword = (oldPassword: string, newPassword: string): boolean => {
  if (verifyAdminPassword(oldPassword)) {
    saveAdminPassword(newPassword);
    return true;
  }
  return false;
};
