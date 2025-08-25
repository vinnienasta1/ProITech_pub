const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Создание пула соединений MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'proitech_user',
  password: process.env.DB_PASSWORD || 'proitech_password',
  database: process.env.DB_NAME || 'proitech_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Проверка подключения к базе данных
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Подключение к MySQL успешно установлено');
    connection.release();
  } catch (error) {
    console.error('❌ Ошибка подключения к MySQL:', error.message);
    process.exit(1);
  }
}

// Инициализация базы данных
async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Проверяем, есть ли уже данные в таблицах
    const [types] = await connection.execute('SELECT COUNT(*) as count FROM equipment_types');
    if (types[0].count > 0) {
      connection.release();
      console.log('✅ База данных уже инициализирована');
      return;
    }
    
    // Создание таблиц
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS equipment_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        color VARCHAR(7) DEFAULT '#1976d2',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS departments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        code VARCHAR(20) UNIQUE,
        manager VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        contact VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        code VARCHAR(20) UNIQUE,
        status ENUM('active', 'completed', 'on-hold') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS locations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        parent_id INT NULL,
        full_path TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (parent_id) REFERENCES locations(id) ON DELETE SET NULL
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS shelves (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(20) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
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
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS statuses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        color VARCHAR(7) DEFAULT '#1976d2',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
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
      )
    `);

    await connection.execute(`
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
      )
    `);

    // Вставка базовых данных
    await connection.execute(`
      INSERT INTO equipment_types (name, description, color) VALUES 
      ('Компьютер', 'Персональный компьютер или рабочая станция', '#1976d2'),
      ('Монитор', 'Монитор или дисплей', '#388e3c'),
      ('Устройство', 'Периферийное устройство', '#f57c00')
    `);

    await connection.execute(`
      INSERT INTO departments (name, code, manager) VALUES 
      ('IT отдел', 'IT', 'IT Менеджер'),
      ('Бухгалтерия', 'BUH', 'Главный бухгалтер'),
      ('Отдел продаж', 'SALES', 'Руководитель отдела продаж')
    `);

    await connection.execute(`
      INSERT INTO statuses (name, color, description) VALUES 
      ('В работе', '#388e3c', 'Оборудование активно используется'),
      ('В резерве', '#1976d2', 'Оборудование в резерве'),
      ('На ремонте', '#f57c00', 'Оборудование находится в ремонте'),
      ('Списано', '#d32f2f', 'Оборудование списано')
    `);

    await connection.execute(`
      INSERT INTO locations (name, full_path, description) VALUES 
      ('Главный офис', 'Главный офис', 'Основное здание компании'),
      ('Склад', 'Склад', 'Складское помещение')
    `);

    await connection.execute(`
      INSERT INTO shelves (name) VALUES 
      ('A0'), ('A1'), ('A2'), ('A3'), ('A4'), ('A5'),
      ('B0'), ('B1'), ('B2'), ('B3'), ('B4'), ('B5')
    `);

    connection.release();
    console.log('✅ База данных инициализирована');
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error);
    throw error;
  }
}

// Маршруты API
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ProITech Backend API работает',
    timestamp: new Date().toISOString(),
    database: 'MySQL'
  });
});

// Маршруты для оборудования
app.get('/api/equipment', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(`
      SELECT 
        e.*,
        et.name as type_name,
        d.name as department_name,
        s.name as status_name,
        u.name as user_name,
        l.full_path as location_path,
        sup.name as supplier_name,
        p.name as project_name,
        sh.name as shelf_name
      FROM equipment e
      LEFT JOIN equipment_types et ON e.type_id = et.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN statuses s ON e.status_id = s.id
      LEFT JOIN users u ON e.user_id = u.id
      LEFT JOIN locations l ON e.location_id = l.id
      LEFT JOIN suppliers sup ON e.supplier_id = sup.id
      LEFT JOIN projects p ON e.project_id = p.id
      LEFT JOIN shelves sh ON e.rack_id = sh.id
      ORDER BY e.created_at DESC
    `);
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Ошибка получения оборудования:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.post('/api/equipment', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const equipment = req.body;
    
    // Генерируем UUID
    const id = require('crypto').randomUUID();
    
    const [result] = await connection.execute(`
      INSERT INTO equipment (
        id, name, type_id, department_id, status_id, user_id, location_id,
        manufacturer, model, inventory_number, serial_number, comment,
        purchase_date, supplier_id, invoice_number, contract_number,
        cost, project_id, warranty_months, rack_id, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id, equipment.name, equipment.type_id, equipment.department_id,
      equipment.status_id, equipment.user_id, equipment.location_id,
      equipment.manufacturer, equipment.model, equipment.inventory_number,
      equipment.serial_number, equipment.comment, equipment.purchase_date,
      equipment.supplier_id, equipment.invoice_number, equipment.contract_number,
      equipment.cost, equipment.project_id, equipment.warranty_months,
      equipment.rack_id, equipment.description
    ]);
    
    connection.release();
    res.status(201).json({ id, message: 'Оборудование добавлено' });
  } catch (error) {
    console.error('Ошибка добавления оборудования:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Маршруты для справочников
app.get('/api/equipment-types', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM equipment_types ORDER BY name');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Ошибка получения типов оборудования:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/departments', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM departments ORDER BY name');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Ошибка получения департаментов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/statuses', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM statuses ORDER BY name');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Ошибка получения статусов:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/locations', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM locations ORDER BY full_path');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Ошибка получения местоположений:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT * FROM users ORDER BY name');
    connection.release();
    res.json(rows);
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// 404 для несуществующих маршрутов
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Запуск сервера
async function startServer() {
  try {
    await testConnection();
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 ProITech Backend API запущен на порту ${PORT}`);
      console.log(`📊 База данных: MySQL`);
      console.log(`🌐 API доступен по адресу: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

startServer();
