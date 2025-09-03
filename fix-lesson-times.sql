-- Исправление временных слотов для уроков в Supabase
-- Выполните этот скрипт в SQL Editor Supabase

-- Обновляем временные слоты уроков, чтобы они соответствовали доступным слотам
UPDATE lessons SET time_slot = '09:00' WHERE id = 'lesson1';
UPDATE lessons SET time_slot = '09:30' WHERE id = 'lesson11';
UPDATE lessons SET time_slot = '10:00' WHERE id = 'lesson2';
UPDATE lessons SET time_slot = '10:30' WHERE id = 'lesson12';
UPDATE lessons SET time_slot = '11:00' WHERE id = 'lesson3';
UPDATE lessons SET time_slot = '11:30' WHERE id = 'lesson13';
UPDATE lessons SET time_slot = '12:00' WHERE id = 'lesson4';
UPDATE lessons SET time_slot = '12:30' WHERE id = 'lesson14';
UPDATE lessons SET time_slot = '13:00' WHERE id = 'lesson5';
UPDATE lessons SET time_slot = '14:00' WHERE id = 'lesson6';
UPDATE lessons SET time_slot = '15:00' WHERE id = 'lesson7';
UPDATE lessons SET time_slot = '16:00' WHERE id = 'lesson8';
UPDATE lessons SET time_slot = '17:00' WHERE id = 'lesson9';
UPDATE lessons SET time_slot = '18:00' WHERE id = 'lesson10';

-- Проверяем результат
SELECT id, time_slot, group_name, subject_name, teacher_name, room_name 
FROM lessons 
ORDER BY time_slot;
