# 🚀 ProITech с MySQL - Инструкция по развертыванию

## 📋 Описание

ProITech - система управления IT-оборудованием, переведенная с localStorage на MySQL базу данных. Проект включает:

- **Frontend**: React приложение на порту 3000
- **Backend**: Node.js API на порту 5000  
- **База данных**: MySQL 8.0 на порту 3307
- **Контейнеризация**: Docker + Docker Compose

## 🛠 Технологии

- **Frontend**: React 18 + TypeScript + Material-UI
- **Backend**: Node.js + Express + MySQL2
- **База данных**: MySQL 8.0
- **Контейнеризация**: Docker + Docker Compose
- **API**: RESTful API с автоматической инициализацией БД

## 📊 Структура базы данных

### Основные таблицы:
- `equipment` - основная таблица оборудования
- `equipment_types` - типы оборудования (Компьютер, Монитор, Устройство)
- `departments` - департаменты (IT отдел, Бухгалтерия, Отдел продаж)
- `statuses` - статусы (В работе, В резерве, На ремонте, Списано)
- `users` - пользователи
- `locations` - местоположения (Главный офис, Склад)
- `suppliers` - поставщики
- `projects` - проекты
- `shelves` - стеллажи (A0-A5, B0-B5)
- `action_logs` - лог действий с возможностью отмены

## 🚀 Быстрое развертывание

### 1. Предварительные требования

```bash
# Установка Docker (если не установлен)
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
# Перезапустите сессию или выполните: newgrp docker
```

### 2. Клонирование и запуск

```bash
# Клонирование репозитория
git clone https://github.com/vinnienasta1/ProITech_pub.git
cd ProITech_pub

# Запуск проекта
./deploy.sh start
```

### 3. Проверка работы

```bash
# Статус контейнеров
./deploy.sh status

# Тестирование API
./test-api.sh

# Проверка в браузере
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000/api
```

## 🔧 Управление проектом

### Основные команды

```bash
./deploy.sh start        # Запуск проекта
./deploy.sh stop         # Остановка
./deploy.sh restart      # Перезапуск
./deploy.sh status       # Статус контейнеров
./deploy.sh logs         # Просмотр логов
./deploy.sh clean        # Очистка Docker ресурсов
./deploy.sh update       # Обновление и перезапуск
./deploy.sh build        # Пересборка
```

### Работа с базой данных

```bash
./deploy.sh mysql        # Подключение к MySQL
./deploy.sh mysql-root   # Подключение как root
./deploy.sh backup       # Создание резервной копии
./deploy.sh restore <file> # Восстановление из файла
```

### Ручное управление Docker

```bash
# Запуск
sudo docker-compose up -d

# Остановка
sudo docker-compose down

# Просмотр логов
sudo docker-compose logs -f

# Пересборка
sudo docker-compose up --build -d
```

## 📡 API Endpoints

### Проверка здоровья
- `GET /api/health` - статус API

### Оборудование
- `GET /api/equipment` - список всего оборудования
- `POST /api/equipment` - добавление оборудования

### Справочники
- `GET /api/equipment-types` - типы оборудования
- `GET /api/departments` - департаменты
- `GET /api/statuses` - статусы
- `GET /api/locations` - местоположения
- `GET /api/users` - пользователи
- `GET /api/suppliers` - поставщики
- `GET /api/projects` - проекты
- `GET /api/shelves` - стеллажи

## 🔐 Доступ к базе данных

### Параметры подключения
- **Хост**: localhost
- **Порт**: 3307
- **База данных**: proitech_db
- **Пользователь**: proitech_user
- **Пароль**: proitech_password
- **Root пароль**: proitech_root_password

### Подключение через командную строку

```bash
# Как пользователь приложения
mysql -h localhost -P 3307 -u proitech_user -p proitech_password proitech_db

# Как root
mysql -h localhost -P 3307 -u root -p
```

### Подключение через Docker

```bash
# Как пользователь приложения
docker exec -it proitech-mysql mysql -u proitech_user -pproitech_password proitech_db

# Как root
docker exec -it proitech-mysql mysql -u root -p
```

## 📊 Мониторинг

### Статус контейнеров
```bash
./deploy.sh status
```

### Логи в реальном времени
```bash
./deploy.sh logs
```

### Использование ресурсов
```bash
sudo docker stats
```

### Информация о контейнерах
```bash
sudo docker inspect proitech-mysql
sudo docker inspect proitech-backend
sudo docker inspect proitech-app
```

## 🔧 Разработка

### Локальная разработка backend

```bash
cd backend
npm install
npm run dev
```

### Локальная разработка frontend

```bash
npm install
npm start
```

### Переменные окружения

Создайте файл `backend/config.env`:

```env
NODE_ENV=production
PORT=5000
DB_HOST=mysql
DB_PORT=3306
DB_NAME=proitech_db
DB_USER=proitech_user
DB_PASSWORD=proitech_password
JWT_SECRET=your_jwt_secret_key_here
```

## 🚨 Устранение неполадок

### Проблемы с портами

```bash
# Проверка занятых портов
ss -tlnp | grep :3000
ss -tlnp | grep :5000
ss -tlnp | grep :3307

# Если порт 3306 занят MySQL на сервере
# Измените порт в docker-compose.yml на 3307
```

### Проблемы с базой данных

```bash
# Проверка логов MySQL
docker logs proitech-mysql

# Проверка подключения
docker exec -it proitech-mysql mysql -u proitech_user -pproitech_password proitech_db -e "SHOW TABLES;"

# Пересоздание базы
./deploy.sh clean
./deploy.sh start
```

### Проблемы с backend

```bash
# Проверка логов
docker logs proitech-backend

# Пересборка
./deploy.sh build
```

### Проблемы с frontend

```bash
# Проверка логов
docker logs proitech-app

# Проверка доступности
curl -I http://localhost:3000
```

## 📈 Производительность

### Оптимизация MySQL

- Созданы индексы для основных полей
- Используется пул соединений
- Настроены таймауты и переподключения

### Мониторинг ресурсов

```bash
# Использование CPU и памяти
sudo docker stats

# Размер базы данных
docker exec -it proitech-mysql mysql -u proitech_user -pproitech_password proitech_db -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.tables WHERE table_schema = 'proitech_db' GROUP BY table_schema;"
```

## 🔄 Обновление

### Обновление кода

```bash
git pull origin main
./deploy.sh update
```

### Обновление зависимостей

```bash
cd backend
npm update
cd ..
./deploy.sh build
```

## 📚 Дополнительные ресурсы

- [Основной README.md](README.md)
- [QUICK_DEPLOY.md](QUICK_DEPLOY.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [Backend README](backend/README.md)

## 🆘 Поддержка

При возникновении проблем:

1. Проверьте логи: `./deploy.sh logs`
2. Проверьте статус: `./deploy.sh status`
3. Создайте Issue в GitHub
4. Обратитесь к команде разработки

---

**ProITech с MySQL** - Надежное управление IT-оборудованием! 🚀

**Статус**: ✅ Готово к продакшену
**Последнее обновление**: 25 августа 2025
**Версия**: 1.0.0
