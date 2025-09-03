-- Автоматически сгенерированный SQL скрипт для загрузки данных в Supabase
-- Создан: 2025-09-03T11:55:18.112Z
-- Количество записей: 28 групп, 13 предметов, 9 преподавателей, 8 ассистентов, 9 аудиторий, 14 уроков

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
('31b5fa14-255d-4804-b196-556f4072273e', 'ШАХМАТЫ', '#8B4513'),
('54a47e32-1a56-4ca2-af13-06f5c6f2a082', 'АРТ', '#FF6B6B'),
('3064e781-590f-48b2-8e76-64d5512d2861', 'Логика', '#4ECDC4'),
('9efb5095-023a-4e41-915f-953c4080d90d', 'Музыка', '#45B7D1'),
('487e6b93-cfad-4d92-9e13-767221deb06d', 'Русский', '#96CEB4'),
('05275ad0-482b-4bfd-b957-65c3d2e8c262', 'РО', '#FECA57'),
('7f8050d7-8803-47c7-918a-d21dacb33d31', 'Математика', '#FF9FF3'),
('d3a1d447-6cde-415b-a902-62013eaba539', 'Младшая Драма', '#A8E6CF'),
('51859aa7-cd2b-466a-a4b1-c4a7bb3b9821', 'Муз драма', '#DDA0DD'),
('subj1', 'Математика', '#667eea'),
('subj2', 'Физика', '#f093fb'),
('subj3', 'Химия', '#4facfe'),
('subj4', 'Биология', '#43e97b')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  color = EXCLUDED.color,
  updated_at = NOW();

-- Вставка преподавателей
INSERT INTO teachers (id, name) VALUES
('30343da4-7293-4a36-895b-60f52d08955e', 'Матфей'),
('f05d5a2e-90ee-4306-b512-9a6f060ce7ea', 'Ира Г/Лиза Ш'),
('7b43cbd5-35cf-49eb-8861-31be9bcde6c9', 'Аня Вин'),
('b3596323-cb83-4fdf-9782-fd0afa9f546a', 'Алина'),
('6cf639d1-a98b-4040-9161-0cf9749fa00f', 'Света Ю'),
('168e11fd-8e6c-48d3-bcc9-00ffcd205dd7', 'Саша Г'),
('teach1', 'Иванов И.И.'),
('teach2', 'Петров П.П.'),
('teach3', 'Сидоров С.С.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Вставка ассистентов
INSERT INTO assistants (id, name) VALUES
('assist1', 'Смирнова А.В.'),
('assist2', 'Козлов Д.И.'),
('assist3', 'Петрова Е.С.'),
('assist4', 'Морозов К.А.'),
('assist5', 'Волкова М.Н.'),
('assist6', 'Соколов Р.П.'),
('assist7', 'Новикова Т.В.'),
('assist8', 'Лебедев А.М.')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Вставка аудиторий
INSERT INTO rooms (id, name) VALUES
('6074dd80-b99d-41c7-b4e3-4d215b4b54dd', 'Арт 2'),
('e1156aad-54fa-4989-a758-2b93b951b405', '108'),
('f18781a8-3acf-46e5-a8db-244455ac11c0', '110'),
('b28b415a-c923-430a-a3a9-48bc1bfa7ca1', '109'),
('ccbcad00-8748-4c13-9dd6-e165634886c3', '207'),
('room1', 'Аудитория 101'),
('room2', 'Аудитория 102'),
('room3', 'Лаборатория 201'),
('room4', 'Лаборатория 202')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Вставка уроков
INSERT INTO lessons (id, group_id, time_slot, subject_id, teacher_id, assistant_id, room_id, duration, color, comment) VALUES
('4a324424-2282-4898-9121-fb9025d5632d', 'group1', '1', 'subj1', 'teach1', 'assist1', 'room1', 45, '#667eea', NULL),
('df12e906-3ab9-4ae5-8316-3ee31a88d888', 'c2035142', '1', 'subj4', 'teach1', 'assist2', 'room1', 45, '#43e97b', NULL),
('46bcd05c-458f-42c6-8157-f6c687bdcaa2', 'a66d4573-df8c-4eb3-9ca7-9933511da44a', '13', '9efb5095-023a-4e41-915f-953c4080d90d', 'b3596323-cb83-4fdf-9782-fd0afa9f546a', 'assist6', 'e1156aad-54fa-4989-a758-2b93b951b405', 25, '#45B7D1', NULL),
('90ec6ac0-0ff7-4cfa-bd66-68431cfb35c9', '3fc5ce07-0618-4204-a60f-a4d5ab99b95d', '19', '31b5fa14-255d-4804-b196-556f4072273e', 'teach1', 'assist1', 'room1', 90, '#8B4513', ''),
('0ab392eb-8621-4079-83a0-017103bef328', 'a66d4573', '2', '3064e781-590f-48b2-8e76-64d5512d2861', '7b43cbd5-35cf-49eb-8861-31be9bcde6c9', 'assist5', 'e1156aad-54fa-4989-a758-2b93b951b405', 25, '#4ECDC4', NULL),
('30071185-07c6-4821-8398-44723c5b58b0', 'c2035142-5d91-4e45-8587-2c4cc1f1fe37', '25', '31b5fa14-255d-4804-b196-556f4072273e', '30343da4-7293-4a36-895b-60f52d08955e', 'assist5', '6074dd80-b99d-41c7-b4e3-4d215b4b54dd', 45, '#8B4513', ''),
('5a542a30-e6af-43a6-96bc-8d597b7423b3', 'group2', '31', 'subj1', 'teach2', 'assist3', 'room2', 60, '#667eea', NULL),
('577f7a50-edbe-454f-9829-d3cc27666216', '5719a13d-7f4c-405d-a8e0-addabc996eb9', '39', '05275ad0-482b-4bfd-b957-65c3d2e8c262', '168e11fd-8e6c-48d3-bcc9-00ffcd205dd7', 'assist7', 'e1156aad-54fa-4989-a758-2b93b951b405', 25, '#FECA57', NULL),
('7d4328f5-4c4d-4c2b-84a3-269ef1a657d2', 'group3', '42', 'subj3', 'teach3', 'assist2', 'room3', 90, '#4facfe', NULL),
('5397468c-c9a7-4ab2-a17c-1e66b4cf5aab', 'a66d4573-df8c-4eb3-9ca7-9933511da44a', '48', 'subj2', 'teach3', 'assist3', 'room3', 90, '#f093fb', NULL),
('f7b01921-5326-4e57-bf4f-340448daf0d3', '978a32c5-16b8-4538-b7ae-2ddb3441c73b', '71', '487e6b93-cfad-4d92-9e13-767221deb06d', '6cf639d1-a98b-4040-9161-0cf9749fa00f', 'assist6', 'f18781a8-3acf-46e5-a8db-244455ac11c0', 25, '#96CEB4', ''),
('2a7249cf-cc9c-459f-a2df-978a5005b2da', 'group1', '73', 'subj3', 'teach1', 'assist4', 'room1', 45, '#4facfe', NULL),
('1959e505-759f-429e-9de1-5e56dd27a939', 'group2', '85', 'subj4', 'teach2', 'assist4', 'room2', 60, '#43e97b', NULL),
('70831550-73e1-46d6-8c37-08781fc2e5fb', 'group1', '98', 'subj2', 'teach2', 'assist1', 'room2', 60, '#f093fb', NULL)
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

