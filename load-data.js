const fs = require('fs');
const path = require('path');

// Читаем SQL файл
const sqlContent = fs.readFileSync(path.join(__dirname, 'supabase-quick-upload.sql'), 'utf8');

// Парсим данные из SQL
const parseSQLData = (sql) => {
  const data = {
    groups: [],
    subjects: [],
    teachers: [],
    assistants: [],
    rooms: [],
    lessons: []
  };

  // Функция для парсинга многострочных INSERT'ов
  const parseInsert = (tableName, sql) => {
    const regex = new RegExp(`INSERT INTO ${tableName}[^;]+;`, 'gs');
    const match = sql.match(regex);
    if (!match) return [];

    const insertSQL = match[0];
    const valuesMatch = insertSQL.match(/VALUES\s*\(([^;]+)\)/s);
    if (!valuesMatch) return [];

    const values = valuesMatch[1];
    // Разбиваем по ),( но учитываем, что внутри значений могут быть запятые
    const rows = [];
    let currentRow = '';
    let parenCount = 0;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < values.length; i++) {
      const char = values[i];
      
      if (!inString && (char === "'" || char === '"')) {
        inString = true;
        stringChar = char;
      } else if (inString && char === stringChar) {
        inString = false;
        stringChar = '';
      } else if (!inString && char === '(') {
        parenCount++;
      } else if (!inString && char === ')') {
        parenCount--;
        if (parenCount === 0) {
          rows.push(currentRow);
          currentRow = '';
          continue;
        }
      }
      
      currentRow += char;
    }

    return rows.map(row => {
      const cleanRow = row.replace(/^\(|\)$/g, '');
      const parts = [];
      let currentPart = '';
      let inString = false;
      let stringChar = '';

      for (let i = 0; i < cleanRow.length; i++) {
        const char = cleanRow[i];
        
        if (!inString && (char === "'" || char === '"')) {
          inString = true;
          stringChar = char;
        } else if (inString && char === stringChar) {
          inString = false;
          stringChar = '';
        } else if (!inString && char === ',' && parts.length < 2) {
          parts.push(currentPart.trim().replace(/'/g, ''));
          currentPart = '';
          continue;
        }
        
        currentPart += char;
      }
      
      if (currentPart.trim()) {
        parts.push(currentPart.trim().replace(/'/g, ''));
      }

      return parts;
    });
  };

  // Парсим группы
  const groupRows = parseInsert('groups', sql);
  data.groups = groupRows.map(parts => ({
    id: parts[0],
    name: parts[1],
    display_order: parseInt(parts[2])
  }));

  // Парсим предметы
  const subjectRows = parseInsert('subjects', sql);
  data.subjects = subjectRows.map(parts => ({
    id: parts[0],
    name: parts[1],
    color: parts[2]
  }));

  // Парсим преподавателей
  const teacherRows = parseInsert('teachers', sql);
  data.teachers = teacherRows.map(parts => ({
    id: parts[0],
    name: parts[1]
  }));

  // Парсим ассистентов
  const assistantRows = parseInsert('assistants', sql);
  data.assistants = assistantRows.map(parts => ({
    id: parts[0],
    name: parts[1]
  }));

  // Парсим аудитории
  const roomRows = parseInsert('rooms', sql);
  data.rooms = roomRows.map(parts => ({
    id: parts[0],
    name: parts[1]
  }));

  // Парсим уроки (более сложная структура)
  const lessonRows = parseInsert('lessons', sql);
  data.lessons = lessonRows.map(parts => ({
    id: parts[0],
    group_id: parts[1],
    time_slot: parts[2],
    subject_id: parts[3],
    teacher_id: parts[4],
    assistant_id: parts[5] === 'NULL' ? null : parts[5],
    room_id: parts[6],
    duration: parseInt(parts[7]),
    color: parts[8] === 'NULL' ? null : parts[8],
    comment: parts[9] === 'NULL' ? null : parts[9]
  }));

  return data;
};

// Парсим данные
const parsedData = parseSQLData(sqlContent);

// Создаем JSON файл с данными
const outputPath = path.join(__dirname, 'backend', 'data.json');
fs.writeFileSync(outputPath, JSON.stringify(parsedData, null, 2));

console.log('✅ Данные успешно загружены из SQL файла!');
console.log(`📊 Групп: ${parsedData.groups.length}`);
console.log(`📚 Предметов: ${parsedData.subjects.length}`);
console.log(`👨‍🏫 Преподавателей: ${parsedData.teachers.length}`);
console.log(`👨‍💼 Ассистентов: ${parsedData.assistants.length}`);
console.log(`🏢 Аудиторий: ${parsedData.rooms.length}`);
console.log(`📅 Уроков: ${parsedData.lessons.length}`);
console.log(`💾 Сохранено в: ${outputPath}`);
