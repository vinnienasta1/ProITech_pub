# 🚀 Инструкция по развертыванию ProITech

## 📋 Предварительные требования

- **Node.js** 18+ и npm
- **Git** для управления версиями
- **Docker Desktop** для контейнеризации
- **GitHub аккаунт** для хостинга кода

## 🔧 Локальная разработка

### 1. Клонирование и настройка

```bash
# Клонирование репозитория
git clone https://github.com/YOUR_USERNAME/proitech.git
cd proitech

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start
```

### 2. Доступ к приложению

Откройте http://localhost:3000 в браузере

## 🐳 Развертывание через Docker

### 1. Быстрый запуск

```bash
# Запуск через скрипт (Windows PowerShell)
.\docker-run.ps1

# Или вручную
docker-compose up --build -d
```

### 2. Ручной запуск

```bash
# Сборка образа
docker build -t proitech .

# Запуск контейнера
docker run -p 3000:80 proitech

# Или через docker-compose
docker-compose up -d
```

### 3. Управление контейнером

```bash
# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Статус
docker-compose ps
```

## ☁️ Развертывание на сервере

### 1. Подготовка сервера

```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Развертывание

```bash
# Клонирование на сервер
git clone https://github.com/YOUR_USERNAME/proitech.git
cd proitech

# Запуск
docker-compose up -d

# Проверка статуса
docker-compose ps
```

### 3. Настройка Nginx (опционально)

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 🔄 CI/CD Pipeline

### 1. Настройка GitHub Secrets

В настройках репозитория добавьте:
- `DOCKER_USERNAME` - ваш Docker Hub логин
- `DOCKER_PASSWORD` - ваш Docker Hub токен

### 2. Автоматическая сборка

При каждом push в main ветку:
1. Запускаются тесты
2. Собирается Docker образ
3. Образ публикуется в Docker Hub
4. Выполняется деплой

### 3. Ручной деплой

```bash
# Скачивание последнего образа
docker pull YOUR_USERNAME/proitech:latest

# Запуск
docker run -p 3000:80 YOUR_USERNAME/proitech:latest
```

## 📊 Мониторинг и логи

### 1. Логи приложения

```bash
# Docker логи
docker-compose logs -f proitech-app

# Nginx логи
docker exec proitech-app tail -f /var/log/nginx/access.log
docker exec proitech-app tail -f /var/log/nginx/error.log
```

### 2. Мониторинг ресурсов

```bash
# Использование ресурсов
docker stats proitech-app

# Информация о контейнере
docker inspect proitech-app
```

## 🔒 Безопасность

### 1. Переменные окружения

Создайте `.env` файл:
```env
NODE_ENV=production
REACT_APP_API_URL=https://api.your-domain.com
```

### 2. HTTPS

Для продакшена настройте SSL сертификат:
```bash
# Let's Encrypt
sudo certbot --nginx -d your-domain.com
```

## 🚨 Устранение неполадок

### 1. Порт занят

```bash
# Поиск процесса
netstat -ano | findstr :3000

# Остановка процесса
taskkill /PID <PID> /F
```

### 2. Docker ошибки

```bash
# Очистка Docker
docker system prune -a

# Перезапуск Docker Desktop
```

### 3. Проблемы с зависимостями

```bash
# Очистка npm кэша
npm cache clean --force

# Переустановка зависимостей
rm -rf node_modules package-lock.json
npm install
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose logs -f`
2. Создайте Issue в GitHub
3. Обратитесь к команде разработки

---

**ProITech** - Простое развертывание, надежная работа! 🚀

