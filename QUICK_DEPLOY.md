# 🚀 Быстрое развертывание ProITech

## Требования
- Ubuntu 20.04+ или аналогичный Linux
- Docker и Docker Compose
- Git

## Быстрая установка

### 1. Клонирование и настройка
```bash
git clone https://github.com/vinnienasta1/ProITech_pub.git
cd ProITech_pub
```

### 2. Установка Docker (если не установлен)
```bash
sudo apt update
sudo apt install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
# Перезапустите сессию или выполните: newgrp docker
```

### 3. Запуск проекта
```bash
# Используя скрипт (рекомендуется)
./deploy.sh start

# Или вручную
sudo docker-compose up -d
```

### 4. Проверка
```bash
# Статус
./deploy.sh status

# Логи
./deploy.sh logs

# Проверка доступности
curl http://localhost:3000
```

## Управление проектом

### Основные команды
```bash
./deploy.sh start    # Запуск
./deploy.sh stop     # Остановка
./deploy.sh restart  # Перезапуск
./deploy.sh status   # Статус
./deploy.sh logs     # Логи
./deploy.sh update   # Обновление
./deploy.sh build    # Пересборка
```

### Ручное управление
```bash
sudo docker-compose up -d        # Запуск
sudo docker-compose down         # Остановка
sudo docker-compose ps           # Статус
sudo docker-compose logs -f      # Логи
sudo docker-compose up --build   # Пересборка
```

## Доступ к приложению

- **Локально**: http://localhost:3000
- **Внешний IP**: http://YOUR_SERVER_IP:3000

## Структура проекта

```
ProITech_pub/
├── src/                    # Исходный код React
├── public/                 # Статические файлы
├── docker-compose.yml      # Конфигурация Docker
├── Dockerfile             # Образ Docker
├── nginx.conf             # Конфигурация Nginx
├── deploy.sh              # Скрипт управления
└── QUICK_DEPLOY.md        # Эта инструкция
```

## Устранение проблем

### Контейнер не запускается
```bash
./deploy.sh logs          # Посмотреть логи
sudo docker-compose down  # Остановить
sudo docker-compose up --build  # Пересобрать
```

### Порт занят
```bash
sudo netstat -tlnp | grep :3000  # Проверить порт
sudo docker-compose down          # Остановить проект
```

### Проблемы с правами
```bash
sudo chown -R $USER:$USER .      # Исправить права
sudo usermod -aG docker $USER    # Добавить в группу docker
```

## Обновление проекта

```bash
./deploy.sh update
```

## Мониторинг

```bash
# Статус контейнеров
sudo docker ps

# Использование ресурсов
sudo docker stats

# Логи в реальном времени
sudo docker-compose logs -f
```

---

**ProITech успешно развернут! 🎉**

Для получения дополнительной информации см. основной README.md
