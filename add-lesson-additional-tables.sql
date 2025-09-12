-- Добавление таблиц для дополнительных преподавателей и ассистентов в Supabase
-- Выполните этот скрипт в SQL Editor в Supabase Dashboard

-- Таблица дополнительных преподавателей для уроков
CREATE TABLE IF NOT EXISTS lesson_additional_teachers (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers (id) ON DELETE CASCADE
);

-- Таблица дополнительных ассистентов для уроков
CREATE TABLE IF NOT EXISTS lesson_additional_assistants (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    assistant_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE,
    FOREIGN KEY (assistant_id) REFERENCES assistants (id) ON DELETE CASCADE
);

-- Создание индексов для оптимизации
CREATE INDEX IF NOT EXISTS idx_lesson_additional_teachers_lesson_id ON lesson_additional_teachers(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_additional_teachers_teacher_id ON lesson_additional_teachers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lesson_additional_assistants_lesson_id ON lesson_additional_assistants(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_additional_assistants_assistant_id ON lesson_additional_assistants(assistant_id);

-- Включение Row Level Security (RLS)
ALTER TABLE lesson_additional_teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_additional_assistants ENABLE ROW LEVEL SECURITY;

-- Политики безопасности
CREATE POLICY "Allow all operations on lesson_additional_teachers" ON lesson_additional_teachers
    FOR ALL USING (true);

CREATE POLICY "Allow all operations on lesson_additional_assistants" ON lesson_additional_assistants
    FOR ALL USING (true);

-- Проверяем результат
SELECT 'lesson_additional_teachers' as table_name, COUNT(*) as count FROM lesson_additional_teachers
UNION ALL
SELECT 'lesson_additional_assistants' as table_name, COUNT(*) as count FROM lesson_additional_assistants;
