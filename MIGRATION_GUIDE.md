# Руководство по миграции с SQLite на Supabase

## 📋 Что было сделано

### 1. Созданы новые файлы:
- `vercel.json` - конфигурация для Vercel
- `frontend/vercel.json` - настройки frontend для Vercel
- `backend/server-supabase.js` - новый сервер с поддержкой Supabase
- `backend/supabase-schema.sql` - SQL схема для Supabase
- `env.example` - пример переменных окружения
- `backend/env.example` - пример переменных для backend
- `DEPLOYMENT.md` - подробные инструкции по деплою
- `QUICK_START.md` - быстрый старт
- `MIGRATION_GUIDE.md` - это руководство

### 2. Обновлены существующие файлы:
- `backend/package.json` - добавлены зависимости Supabase
- `frontend/src/utils/api.ts` - поддержка переменных окружения
- `backend/package.json` - обновлены скрипты запуска

## 🔄 Миграция данных

### Если у вас есть данные в SQLite:

1. **Экспорт данных из SQLite:**
```bash
# Создайте скрипт для экспорта данных
sqlite3 backend/raspisanie.db ".dump" > data_export.sql
```

2. **Адаптация данных для Supabase:**
   - Удалите SQLite-специфичные команды
   - Оставьте только INSERT команды
   - Убедитесь, что ID соответствуют UUID формату

3. **Импорт в Supabase:**
   - Выполните SQL скрипт в Supabase SQL Editor
   - Или используйте Supabase CLI для миграции

## 🚀 Переключение между SQLite и Supabase

### Для разработки с SQLite:
```bash
cd backend
npm run dev-sqlite
```

### Для разработки с Supabase:
```bash
cd backend
npm run dev
```

### Для продакшена:
- Используйте только Supabase версию
- Vercel автоматически использует `server-supabase.js`

## 🔧 Настройка переменных окружения

### Локальная разработка:
Создайте `.env` в корне проекта:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
REACT_APP_API_URL=http://localhost:5000/api
```

### Vercel (продакшен):
Добавьте в настройках Vercel:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `NODE_ENV=production`

## 📊 Сравнение SQLite vs Supabase

| Функция | SQLite | Supabase |
|---------|--------|----------|
| Локальная разработка | ✅ | ✅ |
| Облачное хранение | ❌ | ✅ |
| Масштабируемость | ❌ | ✅ |
| Резервное копирование | ❌ | ✅ |
| Реальное время | ❌ | ✅ |
| Аутентификация | ❌ | ✅ |
| Простота настройки | ✅ | ⚠️ |

## 🛠️ Отладка

### Проблемы с подключением к Supabase:
1. Проверьте переменные окружения
2. Убедитесь, что SQL схема выполнена
3. Проверьте RLS политики
4. Посмотрите логи в Supabase Dashboard

### Проблемы с Vercel:
1. Проверьте переменные окружения в Vercel
2. Убедитесь, что `vercel.json` настроен правильно
3. Проверьте логи сборки в Vercel Dashboard

## 🔄 Откат к SQLite

Если нужно вернуться к SQLite:

1. **Обновите package.json:**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

2. **Удалите Supabase зависимости:**
```bash
cd backend
npm uninstall @supabase/supabase-js dotenv
```

3. **Восстановите оригинальный server.js**

## 📈 Следующие шаги

После успешной миграции рассмотрите:

1. **Аутентификация пользователей** - Supabase Auth
2. **Реальное время** - Supabase Realtime
3. **Файловое хранилище** - Supabase Storage
4. **Edge Functions** - Supabase Edge Functions
5. **Мониторинг** - Supabase Analytics

## 🆘 Поддержка

- **Документация Supabase:** https://supabase.com/docs
- **Документация Vercel:** https://vercel.com/docs
- **Проблемы с проектом:** Создайте issue в репозитории

## ✅ Чек-лист миграции

- [ ] Создан проект в Supabase
- [ ] Выполнен SQL скрипт схемы
- [ ] Настроены переменные окружения
- [ ] Протестирована локальная разработка
- [ ] Настроен деплой на Vercel
- [ ] Добавлены переменные в Vercel
- [ ] Протестирован продакшен деплой
- [ ] Мигрированы данные (если есть)
- [ ] Обновлена документация
- [ ] Команда обучена новому процессу
