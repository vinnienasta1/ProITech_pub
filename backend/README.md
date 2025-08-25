# ProITech Backend API

Backend API сервер для системы управления IT-оборудованием ProITech.

## 🚀 Возможности

- **RESTful API** для управления оборудованием
- **MySQL база данных** с автоматической инициализацией
- **JWT аутентификация** (готово к реализации)
- **Валидация данных** с express-validator
- **Логирование действий** с возможностью отмены
- **Оптимизированные запросы** с индексами

## 🛠 Технологии

- **Node.js** 18+
- **Express.js** - веб-фреймворк
- **MySQL2** - драйвер для MySQL
- **JWT** - аутентификация
- **bcryptjs** - хеширование паролей
- **Helmet** - безопасность
- **CORS** - кросс-доменные запросы

## 📊 Структура базы данных

### Основные таблицы:
- `equipment` - основная таблица оборудования
- `equipment_types` - типы оборудования
- `departments` - департаменты
- `statuses` - статусы оборудования
- `users` - пользователи
- `locations` - местоположения
- `suppliers` - поставщики
- `projects` - проекты
- `shelves` - стеллажи
- `action_logs` - лог действий

## 🔧 Установка и запуск

### Локальная разработка

```bash
cd backend
npm install
npm run dev
```

### Через Docker

```bash
# Из корневой папки проекта
./deploy.sh start
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

## 🔐 Аутентификация

Система готова к реализации JWT аутентификации. В файле `config.env` настройте:

```env
JWT_SECRET=your_secret_key_here
```

## 📝 Переменные окружения

Создайте файл `config.env`:

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

## 🐳 Docker

Backend автоматически запускается в Docker контейнере с MySQL базой данных.

### Команды управления:

```bash
./deploy.sh start      # Запуск всего проекта
./deploy.sh stop       # Остановка
./deploy.sh restart    # Перезапуск
./deploy.sh status     # Статус
./deploy.sh logs       # Логи
./deploy.sh mysql      # Подключение к MySQL
./deploy.sh backup     # Резервная копия БД
```

## 🔍 Мониторинг

- **Логи**: `./deploy.sh logs`
- **Статус**: `./deploy.sh status`
- **MySQL**: `./deploy.sh mysql`

## 📚 Документация API

API автоматически создает и инициализирует базу данных при первом запуске.

### Примеры запросов:

```bash
# Проверка здоровья API
curl http://localhost:5000/api/health

# Получение списка оборудования
curl http://localhost:5000/api/equipment

# Получение типов оборудования
curl http://localhost:5000/api/equipment-types
```

## 🚨 Безопасность

- **Helmet** для защиты заголовков
- **CORS** настройки
- **Валидация** входящих данных
- **Подготовленные запросы** для SQL инъекций

## 🔧 Разработка

### Добавление новых маршрутов:

1. Создайте новый маршрут в `server.js`
2. Добавьте валидацию данных
3. Обновите документацию

### Тестирование:

```bash
npm test
```

---

**ProITech Backend** - Надежный API для управления IT-оборудованием! 🚀
