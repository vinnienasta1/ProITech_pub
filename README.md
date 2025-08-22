# ProITech - Система управления IT-оборудованием

Современное веб-приложение для управления IT-инвентарем, построенное на React с TypeScript.

## 🚀 Возможности

- **Управление оборудованием**: Добавление, редактирование, удаление IT-устройств
- **Инвентаризация**: Отслеживание состояния и местоположения оборудования
- **Экспорт данных**: Выгрузка информации в различные форматы
- **Администрирование**: Управление пользователями и правами доступа
- **Уведомления**: Система уведомлений о важных событиях
- **Адаптивный дизайн**: Современный UI на Material-UI

## 🛠 Технологии

- **Frontend**: React 18 + TypeScript
- **UI Framework**: Material-UI (MUI)
- **Стили**: CSS3 + Emotion
- **Маршрутизация**: React Router DOM
- **Сборка**: Create React App
- **Контейнеризация**: Docker + Nginx

## 📦 Установка и запуск

### Локальная разработка

```bash
# Клонирование репозитория
git clone https://github.com/yourusername/proitech.git
cd proitech

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm start
```

Приложение будет доступно по адресу: http://localhost:3000

### Сборка для продакшена

```bash
npm run build
```

### Запуск через Docker

```bash
# Сборка и запуск
docker-compose up --build

# Или только запуск (если образ уже собран)
docker-compose up

# Запуск в фоновом режиме
docker-compose up -d
```

### Docker команды

```bash
# Сборка образа
docker build -t proitech .

# Запуск контейнера
docker run -p 3000:80 proitech

# Остановка контейнера
docker stop proitech
```

## 🏗 Структура проекта

```
src/
├── components/          # Переиспользуемые компоненты
│   ├── AutocompleteSelect.tsx
│   ├── BulkOperations.tsx
│   ├── ColorPicker.tsx
│   ├── ExportData.tsx
│   ├── NotificationSystem.tsx
│   └── Sidebar.tsx
├── contexts/           # React контексты
│   ├── NotificationContext.tsx
│   └── ThemeContext.tsx
├── pages/              # Страницы приложения
│   ├── Administration.tsx
│   ├── Dashboard.tsx
│   ├── EquipmentDetail.tsx
│   ├── EquipmentForm.tsx
│   ├── EquipmentList.tsx
│   ├── Inventory.tsx
│   └── Printers.tsx
└── storage/            # Логика хранения данных
    ├── createStorage.ts
    ├── entitiesStorage.ts
    ├── statusStorage.ts
    └── userPrefs.ts
```

## 🔧 Скрипты

- `npm start` - Запуск в режиме разработки
- `npm run build` - Сборка для продакшена
- `npm test` - Запуск тестов
- `npm run eject` - Извлечение конфигурации CRA

## 📱 Поддерживаемые браузеры

- Chrome (последние версии)
- Firefox (последние версии)
- Safari (последние версии)
- Edge (последние версии)

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для новой функции (`git checkout -b feature/amazing-feature`)
3. Зафиксируйте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте в ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. См. файл `LICENSE` для получения дополнительной информации.

## 📞 Поддержка

Если у вас есть вопросы или предложения, создайте Issue в репозитории или свяжитесь с командой разработки.

---

**ProITech** - Управление IT-оборудованием стало проще! 🚀
