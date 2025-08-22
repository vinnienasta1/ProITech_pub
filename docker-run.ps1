# Скрипт для запуска ProITech в Docker
# Убедитесь, что Docker Desktop запущен

Write-Host "🐳 Запуск ProITech в Docker..." -ForegroundColor Green

# Проверяем наличие Docker
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker найден: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker не установлен или не запущен. Запустите Docker Desktop" -ForegroundColor Red
    exit 1
}

# Проверяем, запущен ли Docker
try {
    docker ps > $null 2>&1
    Write-Host "✅ Docker запущен" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker не запущен. Запустите Docker Desktop" -ForegroundColor Red
    exit 1
}

Write-Host "🔨 Сборка Docker образа..." -ForegroundColor Yellow
docker-compose build

Write-Host "🚀 Запуск контейнера..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "✅ ProITech запущен в Docker!" -ForegroundColor Green
Write-Host "🌐 Откройте http://localhost:3000 в браузере" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Полезные команды:" -ForegroundColor Yellow
Write-Host "• Остановить: docker-compose down" -ForegroundColor White
Write-Host "• Логи: docker-compose logs -f" -ForegroundColor White
Write-Host "• Перезапуск: docker-compose restart" -ForegroundColor White
Write-Host "• Статус: docker-compose ps" -ForegroundColor White

