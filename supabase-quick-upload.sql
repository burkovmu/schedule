-- Быстрая загрузка данных в Supabase
-- Выполните этот скрипт в SQL Editor Supabase

-- Очистка существующих данных (опционально)
-- TRUNCATE TABLE lessons, groups, subjects, teachers, assistants, rooms RESTART IDENTITY CASCADE;

-- Вставка всех данных одной командой
-- Группы (28 записей)
INSERT INTO groups (id, name, display_order) VALUES
('c2035142-5d91-4e45-8587-2c4cc1f1fe37', 'Альфа 0', 1),
('group1', 'Группа А', 1),
('0b47b40f-ae9d-4994-8737-ac75ed69b523', 'Альфа 1', 2),
('group2', 'Группа Б', 2),
('a66d4573-df8c-4eb3-9ca7-9933511da44a', 'Альфа 2', 3),
('group3', 'Группа В', 3),
('978a32c5-16b8-4538-b7ae-2ddb3441c73b', 'Альфа 3', 4),
('5719a13d-7f4c-405d-a8e0-addabc996eb9', 'Бета 1', 5),
('6c301bfb-8280-47e9-9812-58e91dd6c920', 'Бета 2', 6),
('8826afe7-fe53-4e66-ac43-36526da93fb3', 'Бета 4', 7),
('3fc5ce07-0618-4204-a60f-a4d5ab99b95d', 'Гамма 1', 8),
('5a03814a-8226-4540-9369-ca3d7c5cd504', 'Гамма 2', 9),
('03589669-9ab2-4586-9e46-709699a82206', 'Гамма 4', 10),
('df7c6e15-2ac9-4fe1-b311-e7f6ee941ec2', 'Дельта 1', 11),
('6f3a5606-8a71-4a6c-b165-a5f5713bdc30', 'Дельта 2', 12),
('acb8f5cd-1fbf-45d4-8486-ef84c192522f', 'Дельта 4', 13),
('73c5c64a-4548-49a0-872e-ac1b40ce4c64', 'Эпсилон 1', 14),
('1007bdff-c93f-43e6-aa9b-b5a8ab78bc0b', 'Эпсилон 2', 15),
('d2502300-6cc0-4363-9814-5461f1770f84', 'Эпсилон 3', 16),
('eea5867b-4bd4-47c2-81c8-9a8c83a10152', 'Эпсилон 4', 17),
('4961fbdc-1288-474a-b774-10960aa7c6dd', 'Лямбда 1', 18),
('d31416ee-1b20-45bc-a434-5fef6d05031f', 'Лямбда 2', 19),
('79e7e3d1-d845-4ed7-b3d6-5f1b8d0ce54b', 'Лямбда 4', 20),
('09fcfa99-6434-44fa-b78f-9b1a589edb46', 'Лямбда 5', 21),
('f358e609-7302-435c-91e0-c82f9b2dfc71', 'Омикрон 1', 22),
('b16ce33a-6ec9-42a6-85ee-410f724f99c4', 'Омикрон 2', 23),
('4737dba5-c0d7-4768-9907-d44a846c69c4', 'Омикрон 3', 24),
('958e922a-34fe-4485-86b9-349a78e640fc', 'Омега', 25)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, display_order = EXCLUDED.display_order, updated_at = NOW();

-- Предметы (13 записей)
INSERT INTO subjects (id, name, color) VALUES
('31b5fa14-255d-4804-b196-556f4072273e', 'ШАХМАТЫ', '#8B4513'),
('54a47e32-1a56-4ca2-af13-06f5c6f2a082', 'АРТ', '#FF6B6B'),
('3064e781-590f-48b2-8e76-64d5512d2861', 'Логика', '#4ECDC4'),
('9efb5095-023a-4e41-915f-953c4080d90d', 'Музыка', '#45B7D1'),
('487e6b93-cfad-4d92-9e13-767221deb06d', 'Русский', '#96CEB4'),
('05275ad0-482b-4bfd-b957-65c3d2e8c262', 'РО', '#FECA57'),
('7f8050d7-8803-47c7-918a-d21dacb33d31', 'Математика', '#FF9FF3'),
('d3a1d447-6cde-415b-a902-62013eaba539', 'Младшая Драма', '#A8E6CF'),
('51859aa7-cd2b-466a-a4b1-c4a7bb3b9821', 'Муз драма', '#DDA0DD'),
('8b2c4e1f-9a3d-4e5f-8c7b-1d2e3f4a5b6c', 'Старшая Драма', '#FFB6C1'),
('9c3d5e2f-0a4e-5f6g-9d8c-2e3f4a5b6c7d', 'Английский', '#87CEEB'),
('ad4e6f3g-1b5f-6g7h-0e9d-3f4a5b6c7d8e', 'Физкультура', '#98FB98'),
('be5f7g4h-2c6g-7h8i-1f0e-4a5b6c7d8e9f', 'Информатика', '#F0E68C')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, color = EXCLUDED.color, updated_at = NOW();

-- Преподаватели (9 записей)
INSERT INTO teachers (id, name) VALUES
('teach1', 'Иванов И.И.'),
('teach2', 'Петров П.П.'),
('teach3', 'Сидоров С.С.'),
('teach4', 'Козлова К.К.'),
('teach5', 'Морозова М.М.'),
('teach6', 'Новикова Н.Н.'),
('teach7', 'Волкова В.В.'),
('teach8', 'Соколова С.С.'),
('teach9', 'Лебедева Л.Л.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();

-- Ассистенты (8 записей)
INSERT INTO assistants (id, name) VALUES
('assist1', 'Козлов К.К.'),
('assist2', 'Морозов М.М.'),
('assist3', 'Новиков Н.Н.'),
('assist4', 'Волков В.В.'),
('assist5', 'Соколов С.С.'),
('assist6', 'Лебедев Л.Л.'),
('assist7', 'Орлов О.О.'),
('assist8', 'Соколова С.С.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();

-- Аудитории (9 записей)
INSERT INTO rooms (id, name) VALUES
('room1', 'Аудитория 101'),
('room2', 'Аудитория 102'),
('room3', 'Лаборатория 201'),
('room4', 'Лаборатория 202'),
('room5', 'Аудитория 301'),
('room6', 'Аудитория 302'),
('room7', 'Лаборатория 401'),
('room8', 'Лаборатория 402'),
('room9', 'Компьютерный класс 501')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, updated_at = NOW();

-- Уроки (14 записей)
INSERT INTO lessons (id, group_id, time_slot, subject_id, teacher_id, assistant_id, room_id, duration, color, comment) VALUES
('lesson1', 'c2035142-5d91-4e45-8587-2c4cc1f1fe37', '09:00', '31b5fa14-255d-4804-b196-556f4072273e', 'teach1', 'assist1', 'room1', 45, '#8B4513', 'Шахматы для начинающих'),
('lesson2', '0b47b40f-ae9d-4994-8737-ac75ed69b523', '10:00', '54a47e32-1a56-4ca2-af13-06f5c6f2a082', 'teach2', 'assist2', 'room2', 45, '#FF6B6B', 'Арт-терапия'),
('lesson3', 'a66d4573-df8c-4eb3-9ca7-9933511da44a', '11:00', '3064e781-590f-48b2-8e76-64d5512d2861', 'teach3', 'assist3', 'room3', 45, '#4ECDC4', 'Развитие логического мышления'),
('lesson4', '978a32c5-16b8-4538-b7ae-2ddb3441c73b', '12:00', '9efb5095-023a-4e41-915f-953c4080d90d', 'teach4', 'assist4', 'room4', 45, '#45B7D1', 'Музыкальное развитие'),
('lesson5', '5719a13d-7f4c-405d-a8e0-addabc996eb9', '13:00', '487e6b93-cfad-4d92-9e13-767221deb06d', 'teach5', 'assist5', 'room5', 45, '#96CEB4', 'Русский язык'),
('lesson6', '6c301bfb-8280-47e9-9812-58e91dd6c920', '14:00', '05275ad0-482b-4bfd-b957-65c3d2e8c262', 'teach6', 'assist6', 'room6', 45, '#FECA57', 'Развивающие игры'),
('lesson7', '8826afe7-fe53-4e66-ac43-36526da93fb3', '15:00', '7f8050d7-8803-47c7-918a-d21dacb33d31', 'teach7', 'assist7', 'room7', 45, '#FF9FF3', 'Математика'),
('lesson8', '3fc5ce07-0618-4204-a60f-a4d5ab99b95d', '16:00', 'd3a1d447-6cde-415b-a902-62013eaba539', 'teach8', 'assist8', 'room8', 45, '#A8E6CF', 'Драматическое искусство'),
('lesson9', '5a03814a-8226-4540-9369-ca3d7c5cd504', '17:00', '51859aa7-cd2b-466a-a4b1-c4a7bb3b9821', 'teach9', 'assist1', 'room9', 45, '#DDA0DD', 'Музыкальная драма'),
('lesson10', '03589669-9ab2-4586-9e46-709699a82206', '18:00', '8b2c4e1f-9a3d-4e5f-8c7b-1d2e3f4a5b6c', 'teach1', 'assist2', 'room1', 45, '#FFB6C1', 'Старшая драма'),
('lesson11', 'df7c6e15-2ac9-4fe1-b311-e7f6ee941ec2', '09:30', '9c3d5e2f-0a4e-5f6g-9d8c-2e3f4a5b6c7d', 'teach2', 'assist3', 'room2', 45, '#87CEEB', 'Английский язык'),
('lesson12', '6f3a5606-8a71-4a6c-b165-a5f5713bdc30', '10:30', 'ad4e6f3g-1b5f-6g7h-0e9d-3f4a5b6c7d8e', 'teach3', 'assist4', 'room3', 45, '#98FB98', 'Физическая культура'),
('lesson13', 'acb8f5cd-1fbf-45d4-8486-ef84c192522f', '11:30', 'be5f7g4h-2c6g-7h8i-1f0e-4a5b6c7d8e9f', 'teach4', 'assist5', 'room4', 45, '#F0E68C', 'Основы программирования'),
('lesson14', '73c5c64a-4548-49a0-872e-ac1b40ce4c64', '12:30', '31b5fa14-255d-4804-b196-556f4072273e', 'teach5', 'assist6', 'room5', 45, '#8B4513', 'Продвинутые шахматы')
ON CONFLICT (id) DO UPDATE SET 
  group_id = EXCLUDED.group_id, 
  time_slot = EXCLUDED.time_slot, 
  subject_id = EXCLUDED.subject_id, 
  teacher_id = EXCLUDED.teacher_id, 
  assistant_id = EXCLUDED.assistant_id, 
  room_id = EXCLUDED.room_id, 
  duration = EXCLUDED.duration, 
  color = EXCLUDED.color, 
  comment = EXCLUDED.comment, 
  updated_at = NOW();

-- Проверка загруженных данных
SELECT 'Группы' as table_name, COUNT(*) as count FROM groups
UNION ALL
SELECT 'Предметы', COUNT(*) FROM subjects
UNION ALL
SELECT 'Преподаватели', COUNT(*) FROM teachers
UNION ALL
SELECT 'Ассистенты', COUNT(*) FROM assistants
UNION ALL
SELECT 'Аудитории', COUNT(*) FROM rooms
UNION ALL
SELECT 'Уроки', COUNT(*) FROM lessons;
