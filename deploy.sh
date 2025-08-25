    #!/bin/bash

# Скрипт для управления ProITech проектом с MySQL
# Использование: ./deploy.sh [start|stop|restart|status|logs|update|build|mysql]

PROJECT_NAME="ProITech"
COMPOSE_FILE="docker-compose.yml"

case "$1" in
    start)
        echo "🚀 Запуск $PROJECT_NAME с MySQL..."
        echo "📊 Инициализация базы данных..."
        sudo docker-compose up -d mysql
        echo "⏳ Ожидание готовности MySQL..."
        sleep 30
        echo "🔧 Запуск backend API..."
        sudo docker-compose up -d backend
        echo "⏳ Ожидание готовности backend..."
        sleep 15
        echo "🌐 Запуск frontend..."
        sudo docker-compose up -d proitech-app
        echo "✅ Проект запущен!"
        echo "🌐 Frontend: http://localhost:3000"
        echo "🔧 Backend API: http://localhost:5000/api"
        echo "📊 MySQL: localhost:3307"
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
        echo ""
        echo "📊 Использование ресурсов:"
        sudo docker stats --no-stream
        ;;
    logs)
        echo "📋 Логи $PROJECT_NAME:"
        sudo docker-compose logs -f
        ;;
    mysql)
        echo "🐬 Подключение к MySQL..."
        sudo docker exec -it proitech-mysql mysql -u proitech_user -p proitech_password proitech_db
        ;;
    mysql-root)
        echo "🐬 Подключение к MySQL как root..."
        sudo docker exec -it proitech-mysql mysql -u root -p
        ;;
    backup)
        echo "💾 Создание резервной копии базы данных..."
        BACKUP_FILE="proitech_backup_$(date +%Y%m%d_%H%M%S).sql"
        sudo docker exec proitech-mysql mysqldump -u proitech_user -pproitech_password proitech_db > "$BACKUP_FILE"
        echo "✅ Резервная копия создана: $BACKUP_FILE"
        ;;
    restore)
        if [ -z "$2" ]; then
            echo "❌ Укажите файл для восстановления: ./deploy.sh restore <backup_file>"
            exit 1
        fi
        echo "🔄 Восстановление базы данных из $2..."
        sudo docker exec -i proitech-mysql mysql -u proitech_user -pproitech_password proitech_db < "$2"
        echo "✅ База данных восстановлена"
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
    clean)
        echo "🧹 Очистка Docker ресурсов..."
        sudo docker-compose down -v
        sudo docker system prune -f
        echo "✅ Очистка завершена"
        ;;
    *)
        echo "❓ Использование: $0 {start|stop|restart|status|logs|update|build|clean|mysql|mysql-root|backup|restore}"
        echo ""
        echo "Команды:"
        echo "  start        - Запустить проект с MySQL"
        echo "  stop         - Остановить проект"
        echo "  restart      - Перезапустить проект"
        echo "  status       - Показать статус"
        echo "  logs         - Показать логи"
        echo "  update       - Обновить и перезапустить"
        echo "  build        - Собрать и запустить"
        echo "  clean        - Очистить Docker ресурсы"
        echo "  mysql        - Подключиться к MySQL"
        echo "  mysql-root   - Подключиться к MySQL как root"
        echo "  backup       - Создать резервную копию БД"
        echo "  restore <file> - Восстановить БД из файла"
        exit 1
        ;;
esac
