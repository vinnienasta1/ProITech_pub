#!/bin/bash

# Скрипт для управления ProITech проектом
# Использование: ./deploy.sh [start|stop|restart|status|logs|update]

PROJECT_NAME="ProITech"
COMPOSE_FILE="docker-compose.yml"

case "$1" in
    start)
        echo "🚀 Запуск $PROJECT_NAME..."
        sudo docker-compose up -d
        echo "✅ Проект запущен на http://localhost:3000"
        ;;
    stop)
        echo "🛑 Остановка $PROJECT_NAME..."
        sudo docker-compose down
        echo "✅ Проект остановлен"
        ;;
    restart)
        echo "🔄 Перезапуск $PROJECT_NAME..."
        sudo docker-compose down
        sudo docker-compose up -d
        echo "✅ Проект перезапущен"
        ;;
    status)
        echo "📊 Статус $PROJECT_NAME:"
        sudo docker-compose ps
        ;;
    logs)
        echo "📋 Логи $PROJECT_NAME:"
        sudo docker-compose logs -f
        ;;
    update)
        echo "📥 Обновление $PROJECT_NAME..."
        git pull origin main
        sudo docker-compose down
        sudo docker-compose up --build -d
        echo "✅ Проект обновлен и перезапущен"
        ;;
    build)
        echo "🔨 Сборка $PROJECT_NAME..."
        sudo docker-compose down
        sudo docker-compose up --build -d
        echo "✅ Проект собран и запущен"
        ;;
    *)
        echo "❓ Использование: $0 {start|stop|restart|status|logs|update|build}"
        echo ""
        echo "Команды:"
        echo "  start   - Запустить проект"
        echo "  stop    - Остановить проект"
        echo "  restart - Перезапустить проект"
        echo "  status  - Показать статус"
        echo "  logs    - Показать логи"
        echo "  update  - Обновить и перезапустить"
        echo "  build   - Собрать и запустить"
        exit 1
        ;;
esac
