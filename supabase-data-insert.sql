-- Загрузка данных в Supabase
-- Выполните этот скрипт в SQL Editor Supabase

-- Очистка существующих данных (опционально)
-- DELETE FROM lessons;
-- DELETE FROM groups;
-- DELETE FROM subjects;
-- DELETE FROM teachers;
-- DELETE FROM assistants;
-- DELETE FROM rooms;

-- Вставка групп
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
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  display_order = EXCLUDED.display_order,
  updated_at = NOW();

-- Вставка предметов
INSERT INTO subjects (id, name, color) VALUES
('subj1', 'Математика', '#667eea'),
('subj2', 'Физика', '#f093fb'),
('subj3', 'Химия', '#4facfe'),
('subj4', 'Биология', '#43e97b'),
('subj5', 'Информатика', '#fa709a'),
('subj6', 'Английский язык', '#ffecd2'),
('subj7', 'Русский язык', '#a8edea'),
('subj8', 'История', '#d299c2'),
('subj9', 'География', '#fad0c4'),
('subj10', 'Литература', '#ffd1ff')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  color = EXCLUDED.color,
  updated_at = NOW();

-- Вставка преподавателей
INSERT INTO teachers (id, name) VALUES
('teach1', 'Иванов И.И.'),
('teach2', 'Петров П.П.'),
('teach3', 'Сидоров С.С.'),
('teach4', 'Козлова К.К.'),
('teach5', 'Морозова М.М.'),
('teach6', 'Новикова Н.Н.'),
('teach7', 'Волкова В.В.'),
('teach8', 'Соколова С.С.'),
('teach9', 'Лебедева Л.Л.'),
('teach10', 'Орлова О.О.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Вставка ассистентов
INSERT INTO assistants (id, name) VALUES
('assist1', 'Козлов К.К.'),
('assist2', 'Морозов М.М.'),
('assist3', 'Новиков Н.Н.'),
('assist4', 'Волков В.В.'),
('assist5', 'Соколов С.С.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Вставка аудиторий
INSERT INTO rooms (id, name) VALUES
('room1', 'Аудитория 101'),
('room2', 'Аудитория 102'),
('room3', 'Лаборатория 201'),
('room4', 'Лаборатория 202'),
('room5', 'Аудитория 301'),
('room6', 'Аудитория 302'),
('room7', 'Лаборатория 401'),
('room8', 'Лаборатория 402'),
('room9', 'Компьютерный класс 501'),
('room10', 'Компьютерный класс 502')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();
