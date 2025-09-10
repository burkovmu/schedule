# 📋 Руководство по бэкапу базы данных Supabase

## 🚨 ВАЖНО: Сделайте бэкап перед миграцией!

### 🎯 Основные таблицы для бэкапа:
- `groups` - группы
- `subjects` - предметы  
- `teachers` - преподаватели
- `assistants` - ассистенты
- `rooms` - аудитории
- `lessons` - уроки (самая важная таблица)

### 🚀 Метод 1: Создание бэкапа через SQL Editor (Рекомендуется)

#### Шаг 1: Откройте Supabase Dashboard
1. Перейдите на [supabase.com](https://supabase.com)
2. Войдите в свой аккаунт
3. Выберите ваш проект

#### Шаг 2: Создайте бэкап всех таблиц
В **SQL Editor** выполните следующий скрипт:

```sql
-- Создаем бэкап всех основных таблиц
CREATE TABLE groups_backup AS SELECT * FROM groups;
CREATE TABLE subjects_backup AS SELECT * FROM subjects;
CREATE TABLE teachers_backup AS SELECT * FROM teachers;
CREATE TABLE assistants_backup AS SELECT * FROM assistants;
CREATE TABLE rooms_backup AS SELECT * FROM rooms;
CREATE TABLE lessons_backup AS SELECT * FROM lessons;

-- Проверяем, что бэкапы созданы и содержат данные
SELECT 
    'groups' as table_name, 
    COUNT(*) as original_count,
    (SELECT COUNT(*) FROM groups_backup) as backup_count
FROM groups
UNION ALL
SELECT 
    'subjects' as table_name, 
    COUNT(*) as original_count,
    (SELECT COUNT(*) FROM subjects_backup) as backup_count
FROM subjects
UNION ALL
SELECT 
    'teachers' as table_name, 
    COUNT(*) as original_count,
    (SELECT COUNT(*) FROM teachers_backup) as backup_count
FROM teachers
UNION ALL
SELECT 
    'assistants' as table_name, 
    COUNT(*) as original_count,
    (SELECT COUNT(*) FROM assistants_backup) as backup_count
FROM assistants
UNION ALL
SELECT 
    'rooms' as table_name, 
    COUNT(*) as original_count,
    (SELECT COUNT(*) FROM rooms_backup) as backup_count
FROM rooms
UNION ALL
SELECT 
    'lessons' as table_name, 
    COUNT(*) as original_count,
    (SELECT COUNT(*) FROM lessons_backup) as backup_count
FROM lessons;
```

#### Шаг 3: Проверьте результат
После выполнения скрипта вы должны увидеть таблицу с результатами, показывающую количество записей в оригинальных таблицах и их бэкапах. Все числа должны совпадать.

### 📥 Метод 2: Экспорт данных в файлы

#### Экспорт через Table Editor:
1. В левом меню нажмите **"Table Editor"**
2. Для каждой таблицы бэкапа (`groups_backup`, `subjects_backup`, и т.д.):
   - Нажмите на таблицу
   - Нажмите **"Export"** → **"CSV"**
   - Скачайте файл

#### Экспорт через SQL:
```sql
-- Экспорт всех бэкапов в CSV (если поддерживается)
COPY groups_backup TO '/tmp/groups_backup.csv' WITH CSV HEADER;
COPY subjects_backup TO '/tmp/subjects_backup.csv' WITH CSV HEADER;
COPY teachers_backup TO '/tmp/teachers_backup.csv' WITH CSV HEADER;
COPY assistants_backup TO '/tmp/assistants_backup.csv' WITH CSV HEADER;
COPY rooms_backup TO '/tmp/rooms_backup.csv' WITH CSV HEADER;
COPY lessons_backup TO '/tmp/lessons_backup.csv' WITH CSV HEADER;
```

### 🔍 Проверка бэкапа

#### Проверка целостности данных:
```sql
-- Проверяем, что все данные на месте
SELECT 
    'groups' as table_name,
    COUNT(*) as records,
    MIN(created_at) as oldest_record,
    MAX(updated_at) as newest_update
FROM groups_backup
UNION ALL
SELECT 
    'lessons' as table_name,
    COUNT(*) as records,
    MIN(created_at) as oldest_record,
    MAX(updated_at) as newest_update
FROM lessons_backup
UNION ALL
SELECT 
    'subjects' as table_name,
    COUNT(*) as records,
    MIN(created_at) as oldest_record,
    MAX(updated_at) as newest_update
FROM subjects_backup;
```

#### Проверка связей между таблицами:
```sql
-- Проверяем, что все уроки имеют корректные связи
SELECT 
    l.id,
    l.time_slot,
    g.name as group_name,
    s.name as subject_name,
    t.name as teacher_name,
    r.name as room_name
FROM lessons_backup l
JOIN groups_backup g ON l.group_id = g.id
JOIN subjects_backup s ON l.subject_id = s.id
JOIN teachers_backup t ON l.teacher_id = t.id
JOIN rooms_backup r ON l.room_id = r.id
LIMIT 10;
```

### 📝 Пошаговый план миграции

### 1. Подготовка
- [ ] Сделайте бэкап таблицы `lessons`
- [ ] Скачайте файл `lessons_backup.csv`
- [ ] Убедитесь, что у вас есть доступ к SQL Editor

### 2. Выполнение миграции
- [ ] Откройте файл `migrate-time-slots-8-30.sql`
- [ ] Скопируйте содержимое в SQL Editor
- [ ] Выполните скрипт по частям (рекомендуется)
- [ ] Проверьте результат

### 3. Проверка
- [ ] Убедитесь, что все уроки сохранили свое время
- [ ] Проверьте, что новые слоты 08:30-09:00 доступны
- [ ] Протестируйте создание нового урока

### 4. Обновление кода
- [ ] Обновите код сервера с новой функцией `generateTimeSlots()`
- [ ] Перезапустите сервер
- [ ] Проверьте работу API

### 🆘 Восстановление из бэкапа (если что-то пошло не так):

```sql
-- Восстановление из бэкапа (выполняйте только в случае проблем!)
DELETE FROM lessons;
INSERT INTO lessons SELECT * FROM lessons_backup;

DELETE FROM groups;
INSERT INTO groups SELECT * FROM groups_backup;

-- И так далее для всех таблиц...
```

Теперь у вас есть полный бэкап всех данных! Выполните первый SQL-скрипт в Supabase Dashboard, и вы получите резервные копии всех таблиц с проверкой целостности данных.

### ️ Очистка бэкапов (после успешной миграции)

Когда убедитесь, что миграция прошла успешно, можете удалить бэкапы:

```sql
-- Удаляем таблицы бэкапа (выполняйте только после успешной миграции!)
DROP TABLE IF EXISTS groups_backup;
DROP TABLE IF EXISTS subjects_backup;
DROP TABLE IF EXISTS teachers_backup;
DROP TABLE IF EXISTS assistants_backup;
DROP TABLE IF EXISTS rooms_backup;
DROP TABLE IF EXISTS lessons_backup;
```

### ⚠️ Важные замечания:

1. **Всегда делайте бэкап** перед любыми изменениями в базе данных
2. **Проверяйте количество записей** - оно должно совпадать в оригинале и бэкапе
3. **Сохраняйте файлы бэкапа** в безопасном месте
4. **Тестируйте восстановление** на копии данных перед продакшеном

## 🔄 Восстановление из бэкапа

### Если что-то пошло не так:

#### Восстановление из таблицы lessons_backup:
```sql
-- Удаляем поврежденные данные
DELETE FROM lessons;

-- Восстанавливаем из бэкапа
INSERT INTO lessons 
SELECT * FROM lessons_backup;

-- Проверяем восстановление
SELECT COUNT(*) FROM lessons;
```

#### Восстановление из CSV файла:
1. В Table Editor нажмите **"Import"**
2. Выберите файл `lessons_backup.csv`
3. Выберите таблицу `lessons`
4. Нажмите **"Import"**

## 📞 Поддержка

Если у вас возникли проблемы:
- Проверьте [документацию Supabase](https://supabase.com/docs)
- Обратитесь в [сообщество Supabase](https://github.com/supabase/supabase/discussions)
- Создайте issue в репозитории проекта
