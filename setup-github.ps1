# Скрипт для настройки GitHub репозитория ProITech
# Запустите этот скрипт после установки Git

Write-Host "🚀 Настройка GitHub репозитория ProITech..." -ForegroundColor Green

# Проверяем наличие Git
try {
    $gitVersion = git --version
    Write-Host "✅ Git найден: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git не установлен. Установите Git с https://git-scm.com/" -ForegroundColor Red
    exit 1
}

# Инициализируем Git репозиторий
Write-Host "📁 Инициализация Git репозитория..." -ForegroundColor Yellow
git init

# Добавляем все файлы
Write-Host "📝 Добавление файлов в Git..." -ForegroundColor Yellow
git add .

# Первый коммит
Write-Host "💾 Создание первого коммита..." -ForegroundColor Yellow
git commit -m "Initial commit: ProITech IT Equipment Management System"

Write-Host "✅ Git репозиторий настроен!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Следующие шаги:" -ForegroundColor Cyan
Write-Host "1. Создайте репозиторий на GitHub: https://github.com/new" -ForegroundColor White
Write-Host "2. Добавьте удаленный репозиторий: git remote add origin https://github.com/YOUR_USERNAME/proitech.git" -ForegroundColor White
Write-Host "3. Отправьте код: git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Или используйте GitHub CLI: gh repo create proitech --public --source=. --remote=origin --push" -ForegroundColor Cyan

