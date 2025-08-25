#!/bin/bash

echo "🧪 Тестирование ProITech API..."
echo "=================================="

# Проверка здоровья API
echo "1. Проверка здоровья API:"
curl -s http://localhost:5000/api/health | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/health
echo ""

# Проверка типов оборудования
echo "2. Типы оборудования:"
curl -s http://localhost:5000/api/equipment-types | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/equipment-types
echo ""

# Проверка департаментов
echo "3. Департаменты:"
curl -s http://localhost:5000/api/departments | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/departments
echo ""

# Проверка статусов
echo "4. Статусы:"
curl -s http://localhost:5000/api/statuses | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/statuses
echo ""

# Проверка местоположений
echo "5. Местоположения:"
curl -s http://localhost:5000/api/locations | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/locations
echo ""

# Проверка пользователей
echo "6. Пользователи:"
curl -s http://localhost:5000/api/users | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/users
echo ""

# Проверка оборудования
echo "7. Оборудование:"
curl -s http://localhost:5000/api/equipment | jq '.' 2>/dev/null || curl -s http://localhost:5000/api/equipment
echo ""

echo "=================================="
echo "✅ Тестирование завершено!"
