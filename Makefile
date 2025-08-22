.PHONY: help install start build test clean docker-build docker-run docker-stop docker-logs

# Переменные
APP_NAME = proitech
DOCKER_IMAGE = proitech
DOCKER_CONTAINER = proitech-app
PORT = 3000

# Помощь
help:
	@echo "🚀 ProITech - Система управления IT-оборудованием"
	@echo ""
	@echo "Доступные команды:"
	@echo "  install      - Установка зависимостей"
	@echo "  start        - Запуск в режиме разработки"
	@echo "  build        - Сборка для продакшена"
	@echo "  test         - Запуск тестов"
	@echo "  clean        - Очистка проекта"
	@echo "  docker-build - Сборка Docker образа"
	@echo "  docker-run   - Запуск Docker контейнера"
	@echo "  docker-stop  - Остановка Docker контейнера"
	@echo "  docker-logs  - Просмотр Docker логов"
	@echo "  deploy       - Полное развертывание"

# Установка зависимостей
install:
	@echo "📦 Установка зависимостей..."
	npm install

# Запуск в режиме разработки
start:
	@echo "🚀 Запуск в режиме разработки..."
	npm start

# Сборка для продакшена
build:
	@echo "🔨 Сборка для продакшена..."
	npm run build

# Запуск тестов
test:
	@echo "🧪 Запуск тестов..."
	npm test

# Очистка проекта
clean:
	@echo "🧹 Очистка проекта..."
	rm -rf node_modules build dist .cache
	npm cache clean --force

# Сборка Docker образа
docker-build:
	@echo "🐳 Сборка Docker образа..."
	docker build -t $(DOCKER_IMAGE) .

# Запуск Docker контейнера
docker-run:
	@echo "🚀 Запуск Docker контейнера..."
	docker-compose up -d

# Остановка Docker контейнера
docker-stop:
	@echo "⏹️ Остановка Docker контейнера..."
	docker-compose down

# Просмотр Docker логов
docker-logs:
	@echo "📋 Docker логи..."
	docker-compose logs -f

# Полное развертывание
deploy: docker-build docker-run
	@echo "✅ Развертывание завершено!"
	@echo "🌐 Откройте http://localhost:$(PORT) в браузере"

# Проверка статуса
status:
	@echo "📊 Статус проекта..."
	@echo "Node.js: $(shell node --version)"
	@echo "npm: $(shell npm --version)"
	@echo "Docker: $(shell docker --version)"
	@docker-compose ps 2>/dev/null || echo "Docker контейнеры не запущены"

# Обновление зависимостей
update:
	@echo "🔄 Обновление зависимостей..."
	npm update
	npm audit fix

# Создание production сборки
prod: build
	@echo "🏭 Production сборка готова в папке build/"

# Запуск production сервера
serve:
	@echo "🌐 Запуск production сервера..."
	npx serve -s build -l $(PORT)

