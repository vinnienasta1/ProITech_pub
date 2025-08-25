-- Инициализация базы данных ProITech
-- Этот скрипт выполняется автоматически при первом запуске MySQL контейнера

USE proitech_db;

-- Создание таблиц (если не существуют)
CREATE TABLE IF NOT EXISTS equipment_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#1976d2',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) UNIQUE,
  manager VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  contact VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20) UNIQUE,
  status ENUM('active', 'completed', 'on-hold') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS locations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  parent_id INT NULL,
  full_path TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES locations(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS shelves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  department VARCHAR(100),
  position VARCHAR(100),
  phone VARCHAR(20),
  location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS statuses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  color VARCHAR(7) DEFAULT '#1976d2',
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipment (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type_id INT NOT NULL,
  department_id INT NOT NULL,
  status_id INT NOT NULL,
  user_id INT NULL,
  location_id INT NOT NULL,
  manufacturer VARCHAR(100),
  model VARCHAR(100),
  inventory_number VARCHAR(100) UNIQUE NOT NULL,
  serial_number VARCHAR(100),
  comment TEXT,
  purchase_date DATE,
  supplier_id INT NULL,
  invoice_number VARCHAR(100),
  contract_number VARCHAR(100),
  cost DECIMAL(10,2),
  project_id INT NULL,
  warranty_months INT,
  rack_id INT NULL,
  description TEXT,
  tags JSON,
  ip_address VARCHAR(45),
  mac_address VARCHAR(17),
  os VARCHAR(100),
  last_maintenance DATE,
  next_maintenance DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id) REFERENCES equipment_types(id),
  FOREIGN KEY (department_id) REFERENCES departments(id),
  FOREIGN KEY (status_id) REFERENCES statuses(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (location_id) REFERENCES locations(id),
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (rack_id) REFERENCES shelves(id)
);

CREATE TABLE IF NOT EXISTS action_logs (
  id VARCHAR(36) PRIMARY KEY,
  type ENUM('create', 'update', 'delete', 'bulk', 'import', 'export') NOT NULL,
  description TEXT NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(36) NOT NULL,
  old_data JSON,
  new_data JSON,
  can_undo BOOLEAN DEFAULT FALSE,
  user_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Вставка базовых данных
INSERT IGNORE INTO equipment_types (name, description, color) VALUES 
('Компьютер', 'Персональный компьютер или рабочая станция', '#1976d2'),
('Монитор', 'Монитор или дисплей', '#388e3c'),
('Устройство', 'Периферийное устройство', '#f57c00');

INSERT IGNORE INTO departments (name, code, manager) VALUES 
('IT отдел', 'IT', 'IT Менеджер'),
('Бухгалтерия', 'BUH', 'Главный бухгалтер'),
('Отдел продаж', 'SALES', 'Руководитель отдела продаж');

INSERT IGNORE INTO statuses (name, color, description) VALUES 
('В работе', '#388e3c', 'Оборудование активно используется'),
('В резерве', '#1976d2', 'Оборудование в резерве'),
('На ремонте', '#f57c00', 'Оборудование находится в ремонте'),
('Списано', '#d32f2f', 'Оборудование списано');

INSERT IGNORE INTO locations (name, full_path, description) VALUES 
('Главный офис', 'Главный офис', 'Основное здание компании'),
('Склад', 'Склад', 'Складское помещение');

INSERT IGNORE INTO shelves (name) VALUES 
('A0'), ('A1'), ('A2'), ('A3'), ('A4'), ('A5'),
('B0'), ('B1'), ('B2'), ('B3'), ('B4'), ('B5');

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_equipment_inventory_number ON equipment(inventory_number);
CREATE INDEX IF NOT EXISTS idx_equipment_serial_number ON equipment(serial_number);
CREATE INDEX IF NOT EXISTS idx_equipment_type_id ON equipment(type_id);
CREATE INDEX IF NOT EXISTS idx_equipment_department_id ON equipment(department_id);
CREATE INDEX IF NOT EXISTS idx_equipment_status_id ON equipment(status_id);
CREATE INDEX IF NOT EXISTS idx_equipment_user_id ON equipment(user_id);
CREATE INDEX IF NOT EXISTS idx_equipment_location_id ON equipment(location_id);

-- Создание пользователя для приложения (если нужно)
-- INSERT IGNORE INTO users (name, email, department, position) VALUES 
-- ('Системный администратор', 'admin@proitech.local', 'IT отдел', 'Системный администратор');

COMMIT;
