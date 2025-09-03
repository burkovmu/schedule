# Быстрый старт - Деплой на Vercel + Supabase

## 🚀 Быстрая настройка (5 минут)

### 1. Supabase (2 минуты)
```bash
# 1. Создайте проект на supabase.com
# 2. Выполните SQL из backend/supabase-schema.sql
# 3. Скопируйте URL и anon key
```

### 2. Переменные окружения (1 минута)
Создайте `.env` в корне проекта:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Установка зависимостей (1 минута)
```bash
npm run install-all
```

### 4. Локальный запуск (1 минута)
```bash
# Терминал 1 - Backend
cd backend && npm run dev

# Терминал 2 - Frontend  
cd frontend && npm start
```

## 🌐 Деплой на Vercel

### Автоматический деплой через GitHub:
1. Загрузите код в GitHub
2. Подключите репозиторий к Vercel
3. Добавьте переменные окружения в Vercel:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
4. Деплой готов! 🎉

### Ручной деплой через CLI:
```bash
npm i -g vercel
vercel login
vercel
# Добавьте переменные окружения в панели Vercel
```

## 📁 Структура проекта

```
rasp2/
├── frontend/          # React приложение
├── backend/           # Express API
│   ├── server.js      # SQLite версия
│   └── server-supabase.js  # Supabase версия
├── vercel.json        # Конфигурация Vercel
└── DEPLOYMENT.md      # Подробные инструкции
```

## 🔧 Команды

```bash
# Установка всех зависимостей
npm run install-all

# Локальная разработка (Supabase)
npm run dev

# Локальная разработка (SQLite)
cd backend && npm run dev-sqlite

# Сборка для продакшена
npm run build
```

## ⚡ Что изменилось

- ✅ Добавлена поддержка Supabase
- ✅ Настроен деплой на Vercel
- ✅ Созданы конфигурационные файлы
- ✅ Обновлены переменные окружения
- ✅ Добавлены инструкции по деплою

## 🆘 Нужна помощь?

Смотрите подробные инструкции в [DEPLOYMENT.md](./DEPLOYMENT.md)
