# 🚀 Быстрый старт ProITech

## ✅ Что уже готово

- ✅ Проект скопирован на локальный диск
- ✅ Зависимости установлены
- ✅ Docker конфигурация создана
- ✅ GitHub Actions настроены
- ✅ Скрипты автоматизации готовы

## 🎯 Следующие шаги

### 1. Запуск проекта (уже работает!)

Проект должен быть доступен по адресу: **http://localhost:3000**

### 2. Установка Git

```bash
# Скачайте Git с https://git-scm.com/
# После установки запустите:
.\setup-github.ps1
```

### 3. Создание GitHub репозитория

1. Перейдите на https://github.com/new
2. Название: `proitech`
3. Описание: `IT Equipment Management System`
4. Сделайте публичным
5. НЕ инициализируйте с README

### 4. Настройка удаленного репозитория

```bash
git remote add origin https://github.com/YOUR_USERNAME/proitech.git
git branch -M main
git push -u origin main
```

### 5. Запуск через Docker

```bash
# Быстрый запуск
.\docker-run.ps1

# Или вручную
docker-compose up --build -d
```

## 🐳 Docker команды

```bash
# Сборка и запуск
docker-compose up --build

# Только запуск
docker-compose up -d

# Остановка
docker-compose down

# Логи
docker-compose logs -f

# Статус
docker-compose ps
```

## 📁 Структура проекта

```
ProITech/
├── src/                    # Исходный код
├── public/                 # Статические файлы
├── Dockerfile             # Docker конфигурация
├── docker-compose.yml     # Docker Compose
├── nginx.conf            # Nginx конфигурация
├── .github/              # GitHub Actions
├── setup-github.ps1      # Скрипт настройки GitHub
├── docker-run.ps1        # Скрипт запуска Docker
├── Makefile              # Команды для Unix
├── README.md             # Документация проекта
├── DEPLOYMENT.md         # Инструкция по развертыванию
└── QUICK_START.md        # Этот файл
```

## 🔄 CI/CD Pipeline

После настройки GitHub:
1. При каждом push в main ветку
2. Автоматически запускаются тесты
3. Собирается Docker образ
4. Образ публикуется в Docker Hub

## 🚨 Устранение неполадок

### Проект не запускается
```bash
# Проверьте порт
netstat -ano | findstr :3000

# Перезапустите
npm start
```

### Docker ошибки
```bash
# Проверьте Docker Desktop
docker --version

# Очистите Docker
docker system prune -a
```

### Git проблемы
```bash
# Проверьте Git
git --version

# Если не установлен, скачайте с https://git-scm.com/
```

## 📞 Поддержка

- 📖 Полная документация: `README.md`
- 🚀 Развертывание: `DEPLOYMENT.md`
- 🐳 Docker: `docker-run.ps1`
- 🔧 GitHub: `setup-github.ps1`

---

**ProITech готов к работе! 🎉**

Откройте http://localhost:3000 и наслаждайтесь!

