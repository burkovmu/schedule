-- Добавление полей color и display_order в таблицу teachers в Supabase
-- Выполните этот скрипт в SQL Editor в Supabase Dashboard

-- Добавляем поле color в таблицу teachers
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#667eea';

-- Добавляем поле display_order в таблицу teachers
ALTER TABLE teachers ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Обновляем существующие записи, устанавливая цвет по умолчанию
UPDATE teachers SET color = '#667eea' WHERE color IS NULL;

-- Устанавливаем display_order для существующих записей (по порядку создания)
WITH numbered_teachers AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as new_order
  FROM teachers
)
UPDATE teachers 
SET display_order = numbered_teachers.new_order
FROM numbered_teachers
WHERE teachers.id = numbered_teachers.id;

-- Проверяем результат
SELECT id, name, color, display_order FROM teachers ORDER BY display_order LIMIT 5;
