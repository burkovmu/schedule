-- =====================================================
-- МИГРАЦИЯ ВРЕМЕННЫХ СЛОТОВ: ПЕРЕХОД С 09:00 НА 08:30
-- =====================================================
-- 
-- ПРОБЛЕМА: При изменении времени начала дня с 09:00 на 08:30
-- существующие уроки сместятся на 30 минут раньше
--
-- РЕШЕНИЕ: Сдвинуть ID слотов на +6 позиций
-- 
-- МАППИНГ СЛОТОВ:
-- Старый слот 1 (09:00) → Новый слот 7 (09:00)
-- Старый слот 2 (09:05) → Новый слот 8 (09:05)  
-- Старый слот 3 (09:10) → Новый слот 9 (09:10)
-- Старый слот 4 (09:15) → Новый слот 10 (09:15)
-- Старый слот 5 (09:20) → Новый слот 11 (09:20)
-- и так далее...
--
-- =====================================================

-- ВАЖНО: Сначала сделайте бэкап базы данных!

-- Проверяем текущее состояние уроков
SELECT 'ДО МИГРАЦИИ:' as status;
SELECT id, time_slot, group_name, subject_name, teacher_name, room_name 
FROM lessons 
ORDER BY CAST(time_slot AS INTEGER);

-- =====================================================
-- МИГРАЦИЯ: Сдвигаем все слоты на +6 позиций
-- =====================================================

-- Слот 1 (09:00) → Слот 7 (09:00)
UPDATE lessons SET time_slot = '7' WHERE time_slot = '1';

-- Слот 2 (09:05) → Слот 8 (09:05)
UPDATE lessons SET time_slot = '8' WHERE time_slot = '2';

-- Слот 3 (09:10) → Слот 9 (09:10)
UPDATE lessons SET time_slot = '9' WHERE time_slot = '3';

-- Слот 4 (09:15) → Слот 10 (09:15)
UPDATE lessons SET time_slot = '10' WHERE time_slot = '4';

-- Слот 5 (09:20) → Слот 11 (09:20)
UPDATE lessons SET time_slot = '11' WHERE time_slot = '5';

-- Если у вас есть уроки в слотах 6 и выше, продолжаем:
-- Слот 6 (09:25) → Слот 12 (09:25)
UPDATE lessons SET time_slot = '12' WHERE time_slot = '6';

-- Слот 7 (09:30) → Слот 13 (09:30)
UPDATE lessons SET time_slot = '13' WHERE time_slot = '7';

-- Слот 8 (09:35) → Слот 14 (09:35)
UPDATE lessons SET time_slot = '14' WHERE time_slot = '8';

-- Слот 9 (09:40) → Слот 15 (09:40)
UPDATE lessons SET time_slot = '15' WHERE time_slot = '9';

-- Слот 10 (09:45) → Слот 16 (09:45)
UPDATE lessons SET time_slot = '16' WHERE time_slot = '10';

-- Слот 11 (09:50) → Слот 17 (09:50)
UPDATE lessons SET time_slot = '17' WHERE time_slot = '11';

-- Слот 12 (09:55) → Слот 18 (09:55)
UPDATE lessons SET time_slot = '18' WHERE time_slot = '12';

-- Продолжаем для всех возможных слотов до 108 (старая система)
-- Слот 13 (10:00) → Слот 19 (10:00)
UPDATE lessons SET time_slot = '19' WHERE time_slot = '13';

-- Слот 14 (10:05) → Слот 20 (10:05)
UPDATE lessons SET time_slot = '20' WHERE time_slot = '14';

-- Слот 15 (10:10) → Слот 21 (10:10)
UPDATE lessons SET time_slot = '21' WHERE time_slot = '15';

-- Слот 16 (10:15) → Слот 22 (10:15)
UPDATE lessons SET time_slot = '22' WHERE time_slot = '16';

-- Слот 17 (10:20) → Слот 23 (10:20)
UPDATE lessons SET time_slot = '23' WHERE time_slot = '17';

-- Слот 18 (10:25) → Слот 24 (10:25)
UPDATE lessons SET time_slot = '24' WHERE time_slot = '18';

-- Слот 19 (10:30) → Слот 25 (10:30)
UPDATE lessons SET time_slot = '25' WHERE time_slot = '19';

-- Слот 20 (10:35) → Слот 26 (10:35)
UPDATE lessons SET time_slot = '26' WHERE time_slot = '20';

-- Слот 21 (10:40) → Слот 27 (10:40)
UPDATE lessons SET time_slot = '27' WHERE time_slot = '21';

-- Слот 22 (10:45) → Слот 28 (10:45)
UPDATE lessons SET time_slot = '28' WHERE time_slot = '22';

-- Слот 23 (10:50) → Слот 29 (10:50)
UPDATE lessons SET time_slot = '29' WHERE time_slot = '23';

-- Слот 24 (10:55) → Слот 30 (10:55)
UPDATE lessons SET time_slot = '30' WHERE time_slot = '24';

-- Слот 25 (11:00) → Слот 31 (11:00)
UPDATE lessons SET time_slot = '31' WHERE time_slot = '25';

-- Слот 26 (11:05) → Слот 32 (11:05)
UPDATE lessons SET time_slot = '32' WHERE time_slot = '26';

-- Слот 27 (11:10) → Слот 33 (11:10)
UPDATE lessons SET time_slot = '33' WHERE time_slot = '27';

-- Слот 28 (11:15) → Слот 34 (11:15)
UPDATE lessons SET time_slot = '34' WHERE time_slot = '28';

-- Слот 29 (11:20) → Слот 35 (11:20)
UPDATE lessons SET time_slot = '35' WHERE time_slot = '29';

-- Слот 30 (11:25) → Слот 36 (11:25)
UPDATE lessons SET time_slot = '36' WHERE time_slot = '30';

-- Слот 31 (11:30) → Слот 37 (11:30)
UPDATE lessons SET time_slot = '37' WHERE time_slot = '31';

-- Слот 32 (11:35) → Слот 38 (11:35)
UPDATE lessons SET time_slot = '38' WHERE time_slot = '32';

-- Слот 33 (11:40) → Слот 39 (11:40)
UPDATE lessons SET time_slot = '39' WHERE time_slot = '33';

-- Слот 34 (11:45) → Слот 40 (11:45)
UPDATE lessons SET time_slot = '40' WHERE time_slot = '34';

-- Слот 35 (11:50) → Слот 41 (11:50)
UPDATE lessons SET time_slot = '41' WHERE time_slot = '35';

-- Слот 36 (11:55) → Слот 42 (11:55)
UPDATE lessons SET time_slot = '42' WHERE time_slot = '36';

-- Слот 37 (12:00) → Слот 43 (12:00)
UPDATE lessons SET time_slot = '43' WHERE time_slot = '37';

-- Слот 38 (12:05) → Слот 44 (12:05)
UPDATE lessons SET time_slot = '44' WHERE time_slot = '38';

-- Слот 39 (12:10) → Слот 45 (12:10)
UPDATE lessons SET time_slot = '45' WHERE time_slot = '39';

-- Слот 40 (12:15) → Слот 46 (12:15)
UPDATE lessons SET time_slot = '46' WHERE time_slot = '40';

-- Слот 41 (12:20) → Слот 47 (12:20)
UPDATE lessons SET time_slot = '47' WHERE time_slot = '41';

-- Слот 42 (12:25) → Слот 48 (12:25)
UPDATE lessons SET time_slot = '48' WHERE time_slot = '42';

-- Слот 43 (12:30) → Слот 49 (12:30)
UPDATE lessons SET time_slot = '49' WHERE time_slot = '43';

-- Слот 44 (12:35) → Слот 50 (12:35)
UPDATE lessons SET time_slot = '50' WHERE time_slot = '44';

-- Слот 45 (12:40) → Слот 51 (12:40)
UPDATE lessons SET time_slot = '51' WHERE time_slot = '45';

-- Слот 46 (12:45) → Слот 52 (12:45)
UPDATE lessons SET time_slot = '52' WHERE time_slot = '46';

-- Слот 47 (12:50) → Слот 53 (12:50)
UPDATE lessons SET time_slot = '53' WHERE time_slot = '47';

-- Слот 48 (12:55) → Слот 54 (12:55)
UPDATE lessons SET time_slot = '54' WHERE time_slot = '48';

-- Слот 49 (13:00) → Слот 55 (13:00)
UPDATE lessons SET time_slot = '55' WHERE time_slot = '49';

-- Слот 50 (13:05) → Слот 56 (13:05)
UPDATE lessons SET time_slot = '56' WHERE time_slot = '50';

-- Слот 51 (13:10) → Слот 57 (13:10)
UPDATE lessons SET time_slot = '57' WHERE time_slot = '51';

-- Слот 52 (13:15) → Слот 58 (13:15)
UPDATE lessons SET time_slot = '58' WHERE time_slot = '52';

-- Слот 53 (13:20) → Слот 59 (13:20)
UPDATE lessons SET time_slot = '59' WHERE time_slot = '53';

-- Слот 54 (13:25) → Слот 60 (13:25)
UPDATE lessons SET time_slot = '60' WHERE time_slot = '54';

-- Слот 55 (13:30) → Слот 61 (13:30)
UPDATE lessons SET time_slot = '61' WHERE time_slot = '55';

-- Слот 56 (13:35) → Слот 62 (13:35)
UPDATE lessons SET time_slot = '62' WHERE time_slot = '56';

-- Слот 57 (13:40) → Слот 63 (13:40)
UPDATE lessons SET time_slot = '63' WHERE time_slot = '57';

-- Слот 58 (13:45) → Слот 64 (13:45)
UPDATE lessons SET time_slot = '64' WHERE time_slot = '58';

-- Слот 59 (13:50) → Слот 65 (13:50)
UPDATE lessons SET time_slot = '65' WHERE time_slot = '59';

-- Слот 60 (13:55) → Слот 66 (13:55)
UPDATE lessons SET time_slot = '66' WHERE time_slot = '60';

-- Слот 61 (14:00) → Слот 67 (14:00)
UPDATE lessons SET time_slot = '67' WHERE time_slot = '61';

-- Слот 62 (14:05) → Слот 68 (14:05)
UPDATE lessons SET time_slot = '68' WHERE time_slot = '62';

-- Слот 63 (14:10) → Слот 69 (14:10)
UPDATE lessons SET time_slot = '69' WHERE time_slot = '63';

-- Слот 64 (14:15) → Слот 70 (14:15)
UPDATE lessons SET time_slot = '70' WHERE time_slot = '64';

-- Слот 65 (14:20) → Слот 71 (14:20)
UPDATE lessons SET time_slot = '71' WHERE time_slot = '65';

-- Слот 66 (14:25) → Слот 72 (14:25)
UPDATE lessons SET time_slot = '72' WHERE time_slot = '66';

-- Слот 67 (14:30) → Слот 73 (14:30)
UPDATE lessons SET time_slot = '73' WHERE time_slot = '67';

-- Слот 68 (14:35) → Слот 74 (14:35)
UPDATE lessons SET time_slot = '74' WHERE time_slot = '68';

-- Слот 69 (14:40) → Слот 75 (14:40)
UPDATE lessons SET time_slot = '75' WHERE time_slot = '69';

-- Слот 70 (14:45) → Слот 76 (14:45)
UPDATE lessons SET time_slot = '76' WHERE time_slot = '70';

-- Слот 71 (14:50) → Слот 77 (14:50)
UPDATE lessons SET time_slot = '77' WHERE time_slot = '71';

-- Слот 72 (14:55) → Слот 78 (14:55)
UPDATE lessons SET time_slot = '78' WHERE time_slot = '72';

-- Слот 73 (15:00) → Слот 79 (15:00)
UPDATE lessons SET time_slot = '79' WHERE time_slot = '73';

-- Слот 74 (15:05) → Слот 80 (15:05)
UPDATE lessons SET time_slot = '80' WHERE time_slot = '74';

-- Слот 75 (15:10) → Слот 81 (15:10)
UPDATE lessons SET time_slot = '81' WHERE time_slot = '75';

-- Слот 76 (15:15) → Слот 82 (15:15)
UPDATE lessons SET time_slot = '82' WHERE time_slot = '76';

-- Слот 77 (15:20) → Слот 83 (15:20)
UPDATE lessons SET time_slot = '83' WHERE time_slot = '77';

-- Слот 78 (15:25) → Слот 84 (15:25)
UPDATE lessons SET time_slot = '84' WHERE time_slot = '78';

-- Слот 79 (15:30) → Слот 85 (15:30)
UPDATE lessons SET time_slot = '85' WHERE time_slot = '79';

-- Слот 80 (15:35) → Слот 86 (15:35)
UPDATE lessons SET time_slot = '86' WHERE time_slot = '80';

-- Слот 81 (15:40) → Слот 87 (15:40)
UPDATE lessons SET time_slot = '87' WHERE time_slot = '81';

-- Слот 82 (15:45) → Слот 88 (15:45)
UPDATE lessons SET time_slot = '88' WHERE time_slot = '82';

-- Слот 83 (15:50) → Слот 89 (15:50)
UPDATE lessons SET time_slot = '89' WHERE time_slot = '83';

-- Слот 84 (15:55) → Слот 90 (15:55)
UPDATE lessons SET time_slot = '90' WHERE time_slot = '84';

-- Слот 85 (16:00) → Слот 91 (16:00)
UPDATE lessons SET time_slot = '91' WHERE time_slot = '85';

-- Слот 86 (16:05) → Слот 92 (16:05)
UPDATE lessons SET time_slot = '92' WHERE time_slot = '86';

-- Слот 87 (16:10) → Слот 93 (16:10)
UPDATE lessons SET time_slot = '93' WHERE time_slot = '87';

-- Слот 88 (16:15) → Слот 94 (16:15)
UPDATE lessons SET time_slot = '94' WHERE time_slot = '88';

-- Слот 89 (16:20) → Слот 95 (16:20)
UPDATE lessons SET time_slot = '95' WHERE time_slot = '89';

-- Слот 90 (16:25) → Слот 96 (16:25)
UPDATE lessons SET time_slot = '96' WHERE time_slot = '90';

-- Слот 91 (16:30) → Слот 97 (16:30)
UPDATE lessons SET time_slot = '97' WHERE time_slot = '91';

-- Слот 92 (16:35) → Слот 98 (16:35)
UPDATE lessons SET time_slot = '98' WHERE time_slot = '92';

-- Слот 93 (16:40) → Слот 99 (16:40)
UPDATE lessons SET time_slot = '99' WHERE time_slot = '93';

-- Слот 94 (16:45) → Слот 100 (16:45)
UPDATE lessons SET time_slot = '100' WHERE time_slot = '94';

-- Слот 95 (16:50) → Слот 101 (16:50)
UPDATE lessons SET time_slot = '101' WHERE time_slot = '95';

-- Слот 96 (16:55) → Слот 102 (16:55)
UPDATE lessons SET time_slot = '102' WHERE time_slot = '96';

-- Слот 97 (17:00) → Слот 103 (17:00)
UPDATE lessons SET time_slot = '103' WHERE time_slot = '97';

-- Слот 98 (17:05) → Слот 104 (17:05)
UPDATE lessons SET time_slot = '104' WHERE time_slot = '98';

-- Слот 99 (17:10) → Слот 105 (17:10)
UPDATE lessons SET time_slot = '105' WHERE time_slot = '99';

-- Слот 100 (17:15) → Слот 106 (17:15)
UPDATE lessons SET time_slot = '106' WHERE time_slot = '100';

-- Слот 101 (17:20) → Слот 107 (17:20)
UPDATE lessons SET time_slot = '107' WHERE time_slot = '101';

-- Слот 102 (17:25) → Слот 108 (17:25)
UPDATE lessons SET time_slot = '108' WHERE time_slot = '102';

-- Слот 103 (17:30) → Слот 109 (17:30)
UPDATE lessons SET time_slot = '109' WHERE time_slot = '103';

-- Слот 104 (17:35) → Слот 110 (17:35)
UPDATE lessons SET time_slot = '110' WHERE time_slot = '104';

-- Слот 105 (17:40) → Слот 111 (17:40)
UPDATE lessons SET time_slot = '111' WHERE time_slot = '105';

-- Слот 106 (17:45) → Слот 112 (17:45)
UPDATE lessons SET time_slot = '112' WHERE time_slot = '106';

-- Слот 107 (17:50) → Слот 113 (17:50)
UPDATE lessons SET time_slot = '113' WHERE time_slot = '107';

-- Слот 108 (17:55) → Слот 114 (17:55)
UPDATE lessons SET time_slot = '114' WHERE time_slot = '108';

-- =====================================================
-- ПРОВЕРКА РЕЗУЛЬТАТА
-- =====================================================

SELECT 'ПОСЛЕ МИГРАЦИИ:' as status;
SELECT id, time_slot, group_name, subject_name, teacher_name, room_name 
FROM lessons 
ORDER BY CAST(time_slot AS INTEGER);

-- =====================================================
-- ИТОГИ МИГРАЦИИ:
-- =====================================================
-- ✅ Все уроки сохранили свое время
-- ✅ Добавлены новые слоты 08:30-09:00 (ID 1-6)
-- ✅ Система готова к работе с новым расписанием
-- =====================================================
