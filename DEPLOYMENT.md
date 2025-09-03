# Инструкции по деплою на Vercel с Supabase

## Подготовка к деплою

### 1. Настройка Supabase

1. **Создайте проект в Supabase:**
   - Перейдите на [supabase.com](https://supabase.com)
   - Создайте новый проект
   - Дождитесь завершения инициализации

2. **Настройте базу данных:**
   - В панели Supabase перейдите в раздел "SQL Editor"
   - Выполните SQL скрипт из файла `backend/supabase-schema.sql`
   - Это создаст все необходимые таблицы и политики безопасности

3. **Получите ключи API:**
   - В разделе "Settings" → "API" найдите:
     - `Project URL` (SUPABASE_URL)
     - `anon public` ключ (SUPABASE_ANON_KEY)

### 2. Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# API Configuration (для локальной разработки)
REACT_APP_API_URL=http://localhost:5000/api
```

### 3. Установка зависимостей

```bash
# Установка зависимостей для всего проекта
npm run install-all

# Или по отдельности:
npm install
cd backend && npm install
cd ../frontend && npm install
```

## Деплой на Vercel

### 1. Подготовка к деплою

1. **Убедитесь, что у вас есть аккаунт на Vercel**
2. **Установите Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

### 2. Деплой через Vercel CLI

1. **Войдите в Vercel:**
   ```bash
   vercel login
   ```

2. **Деплой проекта:**
   ```bash
   vercel
   ```

3. **Настройте переменные окружения в Vercel:**
   - Перейдите в панель Vercel
   - Выберите ваш проект
   - Перейдите в "Settings" → "Environment Variables"
   - Добавьте переменные:
     - `SUPABASE_URL` = ваш URL проекта Supabase
     - `SUPABASE_ANON_KEY` = ваш anon ключ Supabase
     - `NODE_ENV` = production

### 3. Деплой через GitHub (рекомендуется)

1. **Подключите репозиторий к Vercel:**
   - Загрузите код в GitHub
   - В панели Vercel нажмите "New Project"
   - Подключите ваш GitHub репозиторий

2. **Настройте переменные окружения:**
   - В настройках проекта добавьте переменные окружения
   - Убедитесь, что они доступны для всех окружений (Production, Preview, Development)

3. **Настройте сборку:**
   - Vercel автоматически определит настройки сборки из `vercel.json`
   - Frontend будет собираться в папку `build`
   - Backend будет развернут как serverless функции

## Локальная разработка

### Запуск с Supabase

```bash
# Запуск backend с Supabase
cd backend
npm run dev

# В другом терминале - запуск frontend
cd frontend
npm start
```

### Запуск с SQLite (для тестирования)

```bash
# Запуск backend с SQLite
cd backend
npm run dev-sqlite

# В другом термине - запуск frontend
cd frontend
npm start
```

## Структура проекта после деплоя

```
vercel.com/your-project/
├── /api/*          # Backend API (serverless функции)
└── /*              # Frontend (React приложение)
```

## Проверка деплоя

1. **Проверьте работу API:**
   - `https://your-project.vercel.app/api/groups`
   - `https://your-project.vercel.app/api/lessons/time-slots/all`

2. **Проверьте работу frontend:**
   - Откройте `https://your-project.vercel.app`
   - Убедитесь, что данные загружаются из Supabase

## Возможные проблемы и решения

### 1. Ошибки CORS
- Убедитесь, что в backend включен CORS middleware
- Проверьте, что API URL правильно настроен в frontend

### 2. Ошибки подключения к Supabase
- Проверьте правильность URL и ключей API
- Убедитесь, что RLS политики настроены правильно
- Проверьте, что таблицы созданы в Supabase

### 3. Ошибки сборки
- Убедитесь, что все зависимости установлены
- Проверьте, что TypeScript компилируется без ошибок
- Проверьте логи сборки в Vercel

### 4. Проблемы с переменными окружения
- Убедитесь, что переменные добавлены в Vercel
- Проверьте, что переменные доступны для нужных окружений
- Перезапустите деплой после изменения переменных

## Мониторинг и логи

- **Vercel Dashboard:** Мониторинг деплоев и производительности
- **Supabase Dashboard:** Мониторинг базы данных и API запросов
- **Vercel Functions:** Логи serverless функций в реальном времени

## Обновление приложения

1. Внесите изменения в код
2. Загрузите изменения в GitHub
3. Vercel автоматически создаст новый деплой
4. После успешной сборки изменения будут доступны в production

## Резервное копирование

- **База данных:** Supabase автоматически создает резервные копии
- **Код:** Хранится в GitHub
- **Переменные окружения:** Сохраните их в безопасном месте

## Безопасность

- Используйте RLS политики в Supabase для контроля доступа
- Не храните секретные ключи в коде
- Регулярно обновляйте зависимости
- Используйте HTTPS (автоматически в Vercel)
