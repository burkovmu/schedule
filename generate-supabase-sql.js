const fs = require('fs');

// Читаем данные из JSON файлов
const groups = JSON.parse(fs.readFileSync('groups.json', 'utf8'));
const subjects = JSON.parse(fs.readFileSync('subjects.json', 'utf8'));
const teachers = JSON.parse(fs.readFileSync('teachers.json', 'utf8'));
const assistants = JSON.parse(fs.readFileSync('assistants.json', 'utf8'));
const rooms = JSON.parse(fs.readFileSync('rooms.json', 'utf8'));
const lessons = JSON.parse(fs.readFileSync('lessons.json', 'utf8'));

// Функция для экранирования строк
function escapeString(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${str.toString().replace(/'/g, "''")}'`;
}

// Генерируем SQL для групп
function generateGroupsSQL() {
  let sql = '-- Вставка групп\nINSERT INTO groups (id, name, display_order) VALUES\n';
  const values = groups.map(group => 
    `(${escapeString(group.id)}, ${escapeString(group.name)}, ${group.display_order || 0})`
  ).join(',\n');
  
  sql += values + '\nON CONFLICT (id) DO UPDATE SET\n';
  sql += '  name = EXCLUDED.name,\n';
  sql += '  display_order = EXCLUDED.display_order,\n';
  sql += '  updated_at = NOW();\n\n';
  
  return sql;
}

// Генерируем SQL для предметов
function generateSubjectsSQL() {
  let sql = '-- Вставка предметов\nINSERT INTO subjects (id, name, color) VALUES\n';
  const values = subjects.map(subject => 
    `(${escapeString(subject.id)}, ${escapeString(subject.name)}, ${escapeString(subject.color || '#667eea')})`
  ).join(',\n');
  
  sql += values + '\nON CONFLICT (id) DO UPDATE SET\n';
  sql += '  name = EXCLUDED.name,\n';
  sql += '  color = EXCLUDED.color,\n';
  sql += '  updated_at = NOW();\n\n';
  
  return sql;
}

// Генерируем SQL для преподавателей
function generateTeachersSQL() {
  let sql = '-- Вставка преподавателей\nINSERT INTO teachers (id, name) VALUES\n';
  const values = teachers.map(teacher => 
    `(${escapeString(teacher.id)}, ${escapeString(teacher.name)})`
  ).join(',\n');
  
  sql += values + '\nON CONFLICT (id) DO UPDATE SET\n';
  sql += '  name = EXCLUDED.name,\n';
  sql += '  updated_at = NOW();\n\n';
  
  return sql;
}

// Генерируем SQL для ассистентов
function generateAssistantsSQL() {
  let sql = '-- Вставка ассистентов\nINSERT INTO assistants (id, name) VALUES\n';
  const values = assistants.map(assistant => 
    `(${escapeString(assistant.id)}, ${escapeString(assistant.name)})`
  ).join(',\n');
  
  sql += values + '\nON CONFLICT (id) DO UPDATE SET\n';
  sql += '  name = EXCLUDED.name,\n';
  sql += '  updated_at = NOW();\n\n';
  
  return sql;
}

// Генерируем SQL для аудиторий
function generateRoomsSQL() {
  let sql = '-- Вставка аудиторий\nINSERT INTO rooms (id, name) VALUES\n';
  const values = rooms.map(room => 
    `(${escapeString(room.id)}, ${escapeString(room.name)})`
  ).join(',\n');
  
  sql += values + '\nON CONFLICT (id) DO UPDATE SET\n';
  sql += '  name = EXCLUDED.name,\n';
  sql += '  updated_at = NOW();\n\n';
  
  return sql;
}

// Генерируем SQL для уроков
function generateLessonsSQL() {
  let sql = '-- Вставка уроков\nINSERT INTO lessons (id, group_id, time_slot, subject_id, teacher_id, assistant_id, room_id, duration, color, comment) VALUES\n';
  const values = lessons.map(lesson => 
    `(${escapeString(lesson.id)}, ${escapeString(lesson.group_id)}, ${escapeString(lesson.time_slot)}, ${escapeString(lesson.subject_id)}, ${escapeString(lesson.teacher_id)}, ${escapeString(lesson.assistant_id)}, ${escapeString(lesson.room_id)}, ${lesson.duration || 45}, ${escapeString(lesson.color)}, ${escapeString(lesson.comment)})`
  ).join(',\n');
  
  sql += values + '\nON CONFLICT (id) DO UPDATE SET\n';
  sql += '  group_id = EXCLUDED.group_id,\n';
  sql += '  time_slot = EXCLUDED.time_slot,\n';
  sql += '  subject_id = EXCLUDED.subject_id,\n';
  sql += '  teacher_id = EXCLUDED.teacher_id,\n';
  sql += '  assistant_id = EXCLUDED.assistant_id,\n';
  sql += '  room_id = EXCLUDED.room_id,\n';
  sql += '  duration = EXCLUDED.duration,\n';
  sql += '  color = EXCLUDED.color,\n';
  sql += '  comment = EXCLUDED.comment,\n';
  sql += '  updated_at = NOW();\n\n';
  
  return sql;
}

// Создаем полный SQL скрипт
let fullSQL = `-- Автоматически сгенерированный SQL скрипт для загрузки данных в Supabase
-- Создан: ${new Date().toISOString()}
-- Количество записей: ${groups.length} групп, ${subjects.length} предметов, ${teachers.length} преподавателей, ${assistants.length} ассистентов, ${rooms.length} аудиторий, ${lessons.length} уроков

`;

fullSQL += generateGroupsSQL();
fullSQL += generateSubjectsSQL();
fullSQL += generateTeachersSQL();
fullSQL += generateAssistantsSQL();
fullSQL += generateRoomsSQL();
fullSQL += generateLessonsSQL();

// Записываем в файл
fs.writeFileSync('supabase-full-data.sql', fullSQL);

console.log('✅ SQL скрипт создан: supabase-full-data.sql');
console.log(`📊 Статистика данных:`);
console.log(`   - Группы: ${groups.length}`);
console.log(`   - Предметы: ${subjects.length}`);
console.log(`   - Преподаватели: ${teachers.length}`);
console.log(`   - Ассистенты: ${assistants.length}`);
console.log(`   - Аудитории: ${rooms.length}`);
console.log(`   - Уроки: ${lessons.length}`);
