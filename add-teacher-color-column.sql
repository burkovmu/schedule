-- Добавление поля color в таблицу teachers в Supabase
-- Выполните этот скрипт в SQL Editor в Supabase Dashboard

-- Добавляем поле color в таблицу teachers
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#667eea';

-- Обновляем существующие записи, устанавливая цвет по умолчанию
UPDATE teachers SET color = '#667eea' WHERE color IS NULL;

-- Проверяем результат
SELECT id, name, color FROM teachers LIMIT 5;
