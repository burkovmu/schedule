const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://localhost:3000',
    'https://*.vercel.app',
    'https://*.tilda.ws',
    'https://*.tilda.ws:443',
    'https://schedule-*.vercel.app',
    'https://rasp2-*.vercel.app',
    // Добавьте сюда ваш домен Tilda
    'https://your-tilda-site.tilda.ws'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json());

// Инициализация базы данных
const dbPath = path.join(__dirname, 'raspisanie.db');
const db = new sqlite3.Database(dbPath);

// Создание таблиц
db.serialize(() => {
  // Таблица групп
  db.run(`CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    assistant_id TEXT,
    FOREIGN KEY (assistant_id) REFERENCES assistants (id)
  )`);

  // Таблица предметов
  db.run(`CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#667eea'
  )`);

  // Таблица преподавателей
  db.run(`CREATE TABLE IF NOT EXISTS teachers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#667eea'
  )`);

  // Таблица ассистентов
  db.run(`CREATE TABLE IF NOT EXISTS assistants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  )`);

  // Таблица аудиторий
  db.run(`CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL
  )`);

  // Таблица уроков
  db.run(`CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    group_id TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    assistant_id TEXT,
    room_id TEXT NOT NULL,
    duration INTEGER DEFAULT 45,
    color TEXT,
    comment TEXT,
    FOREIGN KEY (group_id) REFERENCES groups (id),
    FOREIGN KEY (subject_id) REFERENCES subjects (id),
    FOREIGN KEY (teacher_id) REFERENCES teachers (id),
    FOREIGN KEY (assistant_id) REFERENCES assistants (id),
    FOREIGN KEY (room_id) REFERENCES rooms (id)
  )`);

  // Таблица для дополнительных преподавателей урока
  db.run(`CREATE TABLE IF NOT EXISTS lesson_additional_teachers (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    teacher_id TEXT NOT NULL,
    FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers (id)
  )`);

  // Таблица для дополнительных ассистентов урока
  db.run(`CREATE TABLE IF NOT EXISTS lesson_additional_assistants (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    assistant_id TEXT NOT NULL,
    FOREIGN KEY (lesson_id) REFERENCES lessons (id) ON DELETE CASCADE,
    FOREIGN KEY (assistant_id) REFERENCES assistants (id)
  )`);

  // Заполнение начальными данными
  const initialData = [
    // Группы
    { table: 'groups', data: [
      { id: 'group1', name: 'Группа А', display_order: 1 },
      { id: 'group2', name: 'Группа Б', display_order: 2 },
      { id: 'group3', name: 'Группа В', display_order: 3 }
    ]},
    // Предметы
    { table: 'subjects', data: [
      { id: 'subj1', name: 'Математика', color: '#667eea' },
      { id: 'subj2', name: 'Физика', color: '#f093fb' },
      { id: 'subj3', name: 'Химия', color: '#4facfe' },
      { id: 'subj4', name: 'Биология', color: '#43e97b' }
    ]},
    // Преподаватели
    { table: 'teachers', data: [
      { id: 'teach1', name: 'Иванов И.И.', color: '#667eea' },
      { id: 'teach2', name: 'Петров П.П.', color: '#f093fb' },
      { id: 'teach3', name: 'Сидоров С.С.', color: '#4facfe' }
    ]},
    // Ассистенты
    { table: 'assistants', data: [
      { id: 'assist1', name: 'Козлов К.К.' },
      { id: 'assist2', name: 'Морозов М.М.' }
    ]},
    // Аудитории
    { table: 'rooms', data: [
      { id: 'room1', name: 'Аудитория 101' },
      { id: 'room2', name: 'Аудитория 102' },
      { id: 'room3', name: 'Лаборатория 201' },
      { id: 'room4', name: 'Лаборатория 202' }
    ]}
  ];

  initialData.forEach(({ table, data }) => {
    data.forEach(item => {
      const columns = Object.keys(item).join(', ');
      const placeholders = Object.keys(item).map(() => '?').join(', ');
      const values = Object.values(item);
      
      db.run(`INSERT OR IGNORE INTO ${table} (${columns}) VALUES (${placeholders})`, values);
    });
  });

  // Миграция: добавление поля color для существующих преподавателей
  db.run(`ALTER TABLE teachers ADD COLUMN color TEXT DEFAULT '#667eea'`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Ошибка добавления колонки color:', err.message);
    }
  });
  db.run(`UPDATE teachers SET color = '#667eea' WHERE color IS NULL`, (err) => {
    if (err) {
      console.error('Ошибка обновления цветов преподавателей:', err.message);
    }
  });
});

// Генерация временных слотов
const generateTimeSlots = () => {
  const timeSlots = [];
  let slotId = 1;

  for (let hour = 8; hour < 18; hour++) {
    const startMinute = hour === 8 ? 30 : 0;
    for (let minute = startMinute; minute < 60; minute += 5) {
      const startHour = hour;
      const startMinute = minute;
      const endMinute = minute + 5;
      const endHour = endMinute >= 60 ? hour + 1 : hour;
      const finalEndMinute = endMinute >= 60 ? endMinute - 60 : endMinute;
      
      if (endHour > 18) {
        break;
      }
      
      const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
      const endTime = `${endHour.toString().padStart(2, '0')}:${finalEndMinute.toString().padStart(2, '0')}`;
      
      timeSlots.push({
        id: slotId.toString(),
        startTime: startTime,
        endTime: endTime,
        displayTime: startTime
      });
      
      slotId++;
    }
  }
  
  return timeSlots;
};

// API Routes

// Временные слоты
app.get('/api/lessons/time-slots/all', (req, res) => {
  res.json(generateTimeSlots());
});

// Группы
app.get('/api/groups', (req, res) => {
  db.all(`
    SELECT g.*, a.name as assistant_name 
    FROM groups g 
    LEFT JOIN assistants a ON g.assistant_id = a.id 
    ORDER BY g.display_order
  `, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/groups', (req, res) => {
  const { name, display_order, assistant_id } = req.body;
  const id = uuidv4();
  
  // Обрабатываем assistant_id - если пустая строка, устанавливаем null
  const processedAssistantId = assistant_id === '' ? null : assistant_id;
  
  db.run('INSERT INTO groups (id, name, display_order, assistant_id) VALUES (?, ?, ?, ?)', 
    [id, name, display_order || 0, processedAssistantId], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Получаем созданную группу с информацией об ассистенте
      db.get(`
        SELECT g.*, a.name as assistant_name 
        FROM groups g 
        LEFT JOIN assistants a ON g.assistant_id = a.id 
        WHERE g.id = ?
      `, [id], function(err, row) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        
        res.json({
          id: row.id,
          name: row.name,
          display_order: row.display_order,
          assistant_id: row.assistant_id,
          assistant_name: row.assistant_name
        });
      });
    }
  );
});

app.put('/api/groups/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Обрабатываем assistant_id - если пустая строка, устанавливаем null
  if (updates.assistant_id === '') {
    updates.assistant_id = null;
  }
  
  // Строим динамический SQL запрос только для переданных полей
  const fields = [];
  const values = [];
  
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.display_order !== undefined) {
    fields.push('display_order = ?');
    values.push(updates.display_order);
  }
  if (updates.assistant_id !== undefined) {
    fields.push('assistant_id = ?');
    values.push(updates.assistant_id);
  }
  
  if (fields.length === 0) {
    return res.status(400).json({ error: 'Нет полей для обновления' });
  }
  
  values.push(id);
  
  const sql = `UPDATE groups SET ${fields.join(', ')} WHERE id = ?`;
  
  db.run(sql, values, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Получаем обновленную группу с информацией об ассистенте
    db.get(`
      SELECT g.*, a.name as assistant_name 
      FROM groups g 
      LEFT JOIN assistants a ON g.assistant_id = a.id 
      WHERE g.id = ?
    `, [id], function(err, row) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (!row) {
        res.status(404).json({ error: 'Группа не найдена' });
        return;
      }
      
      res.json({
        id: row.id,
        name: row.name,
        display_order: row.display_order,
        assistant_id: row.assistant_id,
        assistant_name: row.assistant_name
      });
    });
  });
});

app.delete('/api/groups/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM groups WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Группа удалена' });
  });
});

app.post('/api/groups/bulk', (req, res) => {
  const { names } = req.body;
  
  if (!Array.isArray(names) || names.length === 0) {
    res.status(400).json({ error: 'Список имен не может быть пустым' });
    return;
  }

  const groups = [];
  let completed = 0;
  let hasError = false;

  names.forEach((name, index) => {
    if (!name || name.trim() === '') {
      completed++;
      if (completed === names.length && !hasError) {
        res.json(groups);
      }
      return;
    }

    const id = uuidv4();
    db.run('INSERT INTO groups (id, name, display_order) VALUES (?, ?, ?)', 
      [id, name.trim(), index + 1], 
      function(err) {
        completed++;
        if (err) {
          hasError = true;
          res.status(500).json({ error: err.message });
          return;
        }
        
        groups.push({ id, name: name.trim(), display_order: index + 1 });
        
        if (completed === names.length && !hasError) {
          res.json(groups);
        }
      }
    );
  });
});

// Предметы
app.get('/api/subjects', (req, res) => {
  db.all('SELECT * FROM subjects', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/subjects', (req, res) => {
  const { name, color } = req.body;
  const id = uuidv4();
  
  db.run('INSERT INTO subjects (id, name, color) VALUES (?, ?, ?)', 
    [id, name, color || '#667eea'], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, name, color: color || '#667eea' });
    }
  );
});

app.put('/api/subjects/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Строим динамический SQL запрос только для переданных полей
  const fields = [];
  const values = [];
  
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  });
  
  if (fields.length === 0) {
    res.status(400).json({ error: 'Нет полей для обновления' });
    return;
  }
  
  values.push(id);
  const sql = `UPDATE subjects SET ${fields.join(', ')} WHERE id = ?`;
  
  db.run(sql, values, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Предмет обновлен' });
  });
});

app.delete('/api/subjects/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM subjects WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Предмет удален' });
  });
});

app.post('/api/subjects/bulk', (req, res) => {
  const { names } = req.body;
  
  if (!Array.isArray(names) || names.length === 0) {
    res.status(400).json({ error: 'Список имен не может быть пустым' });
    return;
  }

  const subjects = [];
  let completed = 0;
  let hasError = false;

  names.forEach((name, index) => {
    if (!name || name.trim() === '') {
      completed++;
      if (completed === names.length && !hasError) {
        res.json(subjects);
      }
      return;
    }

    const id = uuidv4();
    db.run('INSERT INTO subjects (id, name, color) VALUES (?, ?, ?)', 
      [id, name.trim(), '#667eea'], 
      function(err) {
        completed++;
        if (err) {
          hasError = true;
          res.status(500).json({ error: err.message });
          return;
        }
        
        subjects.push({ id, name: name.trim(), color: '#667eea' });
        
        if (completed === names.length && !hasError) {
          res.json(subjects);
        }
      }
    );
  });
});

// Преподаватели
app.get('/api/teachers', (req, res) => {
  db.all('SELECT * FROM teachers', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/teachers', (req, res) => {
  const { name, color } = req.body;
  const id = uuidv4();
  
  db.run('INSERT INTO teachers (id, name, color) VALUES (?, ?, ?)', 
    [id, name, color || '#667eea'], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, name, color: color || '#667eea' });
    }
  );
});

app.put('/api/teachers/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Строим динамический SQL запрос только для переданных полей
  const fields = [];
  const values = [];
  
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  });
  
  if (fields.length === 0) {
    res.status(400).json({ error: 'Нет полей для обновления' });
    return;
  }
  
  values.push(id);
  const sql = `UPDATE teachers SET ${fields.join(', ')} WHERE id = ?`;
  
  db.run(sql, values, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Преподаватель обновлен' });
  });
});

app.delete('/api/teachers/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM teachers WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Преподаватель удален' });
  });
});

app.post('/api/teachers/bulk', (req, res) => {
  const { names } = req.body;
  
  if (!Array.isArray(names) || names.length === 0) {
    res.status(400).json({ error: 'Список имен не может быть пустым' });
    return;
  }

  const teachers = [];
  let completed = 0;
  let hasError = false;

  names.forEach((name, index) => {
    if (!name || name.trim() === '') {
      completed++;
      if (completed === names.length && !hasError) {
        res.json(teachers);
      }
      return;
    }

    const id = uuidv4();
    db.run('INSERT INTO teachers (id, name, color) VALUES (?, ?, ?)', 
      [id, name.trim(), '#667eea'], 
      function(err) {
        completed++;
        if (err) {
          hasError = true;
          res.status(500).json({ error: err.message });
          return;
        }
        
        teachers.push({ id, name: name.trim(), color: '#667eea' });
        
        if (completed === names.length && !hasError) {
          res.json(teachers);
        }
      }
    );
  });
});

// Ассистенты
app.get('/api/assistants', (req, res) => {
  db.all('SELECT * FROM assistants', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/assistants', (req, res) => {
  const { name } = req.body;
  const id = uuidv4();
  
  db.run('INSERT INTO assistants (id, name) VALUES (?, ?)', 
    [id, name], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, name });
    }
  );
});

app.put('/api/assistants/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  // Строим динамический SQL запрос только для переданных полей
  const fields = [];
  const values = [];
  
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  
  if (fields.length === 0) {
    return res.status(400).json({ error: 'Нет полей для обновления' });
  }
  
  values.push(id);
  
  const sql = `UPDATE assistants SET ${fields.join(', ')} WHERE id = ?`;
  
  db.run(sql, values, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Получаем обновленного ассистента
    db.get('SELECT * FROM assistants WHERE id = ?', [id], function(err, row) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (!row) {
        res.status(404).json({ error: 'Ассистент не найден' });
        return;
      }
      
      res.json({
        id: row.id,
        name: row.name
      });
    });
  });
});

app.delete('/api/assistants/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM assistants WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Ассистент удален' });
  });
});

app.post('/api/assistants/bulk', (req, res) => {
  const { names } = req.body;
  
  if (!Array.isArray(names) || names.length === 0) {
    res.status(400).json({ error: 'Список имен не может быть пустым' });
    return;
  }

  const assistants = [];
  let completed = 0;
  let hasError = false;

  names.forEach((name, index) => {
    if (!name || name.trim() === '') {
      completed++;
      if (completed === names.length && !hasError) {
        res.json(assistants);
      }
      return;
    }

    const id = uuidv4();
    db.run('INSERT INTO assistants (id, name) VALUES (?, ?)', 
      [id, name.trim()], 
      function(err) {
        completed++;
        if (err) {
          hasError = true;
          res.status(500).json({ error: err.message });
          return;
        }
        
        assistants.push({ id, name: name.trim() });
        
        if (completed === names.length && !hasError) {
          res.json(assistants);
        }
      }
    );
  });
});

// Аудитории
app.get('/api/rooms', (req, res) => {
  db.all('SELECT * FROM rooms', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/rooms', (req, res) => {
  const { name } = req.body;
  const id = uuidv4();
  
  db.run('INSERT INTO rooms (id, name) VALUES (?, ?)', 
    [id, name], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, name });
    }
  );
});

app.delete('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM rooms WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Кабинет удален' });
  });
});

app.post('/api/rooms/bulk', (req, res) => {
  const { names } = req.body;
  
  if (!Array.isArray(names) || names.length === 0) {
    res.status(400).json({ error: 'Список имен не может быть пустым' });
    return;
  }

  const rooms = [];
  let completed = 0;
  let hasError = false;

  names.forEach((name, index) => {
    if (!name || name.trim() === '') {
      completed++;
      if (completed === names.length && !hasError) {
        res.json(rooms);
      }
      return;
    }

    const id = uuidv4();
    db.run('INSERT INTO rooms (id, name) VALUES (?, ?)', 
      [id, name.trim()], 
      function(err) {
        completed++;
        if (err) {
          hasError = true;
          res.status(500).json({ error: err.message });
          return;
        }
        
        rooms.push({ id, name: name.trim() });
        
        if (completed === names.length && !hasError) {
          res.json(rooms);
        }
      }
    );
  });
});

// Уроки
app.get('/api/lessons', (req, res) => {
  const query = `
    SELECT l.*, 
           g.name as group_name,
           s.name as subject_name, s.color as subject_color,
           t.name as teacher_name, t.color as teacher_color,
           a.name as assistant_name,
           r.name as room_name
    FROM lessons l
    LEFT JOIN groups g ON l.group_id = g.id
    LEFT JOIN subjects s ON l.subject_id = s.id
    LEFT JOIN teachers t ON l.teacher_id = t.id
    LEFT JOIN assistants a ON l.assistant_id = a.id
    LEFT JOIN rooms r ON l.room_id = r.id
    ORDER BY l.time_slot
  `;
  
  db.all(query, [], async (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    // Добавляем дополнительных преподавателей и ассистентов для каждого урока
    const lessonsWithAdditional = await Promise.all(rows.map(async (lesson) => {
      // Получаем дополнительных преподавателей
      const additionalTeachersQuery = `
        SELECT t.id, t.name, t.color
        FROM lesson_additional_teachers lat
        JOIN teachers t ON lat.teacher_id = t.id
        WHERE lat.lesson_id = ?
      `;
      
      const additionalTeachers = await new Promise((resolve, reject) => {
        db.all(additionalTeachersQuery, [lesson.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      // Получаем дополнительных ассистентов
      const additionalAssistantsQuery = `
        SELECT a.id, a.name
        FROM lesson_additional_assistants laa
        JOIN assistants a ON laa.assistant_id = a.id
        WHERE laa.lesson_id = ?
      `;
      
      const additionalAssistants = await new Promise((resolve, reject) => {
        db.all(additionalAssistantsQuery, [lesson.id], (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });

      return {
        ...lesson,
        additional_teachers: additionalTeachers,
        additional_assistants: additionalAssistants
      };
    }));

    res.json(lessonsWithAdditional);
  });
});

app.post('/api/lessons', (req, res) => {
  const { 
    group_id, 
    time_slot, 
    subject_id, 
    teacher_id, 
    assistant_id, 
    room_id, 
    duration, 
    color, 
    comment,
    additional_teachers = [],
    additional_assistants = []
  } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO lessons (id, group_id, time_slot, subject_id, teacher_id, assistant_id, room_id, duration, color, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, group_id, time_slot, subject_id, teacher_id, assistant_id, room_id, duration || 45, color, comment],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }

      // Добавляем дополнительных преподавателей
      if (additional_teachers.length > 0) {
        const teacherPromises = additional_teachers.map(teacherId => {
          return new Promise((resolve, reject) => {
            const teacherLinkId = uuidv4();
            db.run(
              'INSERT INTO lesson_additional_teachers (id, lesson_id, teacher_id) VALUES (?, ?, ?)',
              [teacherLinkId, id, teacherId],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        });

        Promise.all(teacherPromises).catch(err => {
          console.error('Ошибка добавления дополнительных преподавателей:', err);
        });
      }

      // Добавляем дополнительных ассистентов
      if (additional_assistants.length > 0) {
        const assistantPromises = additional_assistants.map(assistantId => {
          return new Promise((resolve, reject) => {
            const assistantLinkId = uuidv4();
            db.run(
              'INSERT INTO lesson_additional_assistants (id, lesson_id, assistant_id) VALUES (?, ?, ?)',
              [assistantLinkId, id, assistantId],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        });

        Promise.all(assistantPromises).catch(err => {
          console.error('Ошибка добавления дополнительных ассистентов:', err);
        });
      }

      res.json({ 
        id, 
        group_id, 
        time_slot, 
        subject_id, 
        teacher_id, 
        assistant_id, 
        room_id, 
        duration: duration || 45, 
        color, 
        comment,
        additional_teachers,
        additional_assistants
      });
    }
  );
});

app.put('/api/lessons/:id', (req, res) => {
  const { id } = req.params;
  const { additional_teachers, additional_assistants, ...updates } = req.body;
  
  // Строим динамический SQL запрос только для переданных полей
  const fields = [];
  const values = [];
  
  Object.keys(updates).forEach(key => {
    if (updates[key] !== undefined) {
      fields.push(`${key} = ?`);
      values.push(updates[key]);
    }
  });
  
  if (fields.length === 0 && !additional_teachers && !additional_assistants) {
    res.status(400).json({ error: 'Нет полей для обновления' });
    return;
  }
  
  // Обновляем основные поля урока
  if (fields.length > 0) {
    values.push(id);
    const sql = `UPDATE lessons SET ${fields.join(', ')} WHERE id = ?`;
    
    db.run(sql, values, function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Обновляем дополнительных преподавателей и ассистентов
      updateAdditionalStaff(id, additional_teachers, additional_assistants, res);
    });
  } else {
    // Обновляем только дополнительных преподавателей и ассистентов
    updateAdditionalStaff(id, additional_teachers, additional_assistants, res);
  }
});

// Функция для обновления дополнительных преподавателей и ассистентов
function updateAdditionalStaff(lessonId, additionalTeachers, additionalAssistants, res) {
  // Удаляем старых дополнительных преподавателей
  db.run('DELETE FROM lesson_additional_teachers WHERE lesson_id = ?', [lessonId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Добавляем новых дополнительных преподавателей
    if (additionalTeachers && additionalTeachers.length > 0) {
      const teacherPromises = additionalTeachers.map(teacherId => {
        return new Promise((resolve, reject) => {
          const teacherLinkId = uuidv4();
          db.run(
            'INSERT INTO lesson_additional_teachers (id, lesson_id, teacher_id) VALUES (?, ?, ?)',
            [teacherLinkId, lessonId, teacherId],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      });

      Promise.all(teacherPromises).catch(err => {
        console.error('Ошибка обновления дополнительных преподавателей:', err);
      });
    }
  });

  // Удаляем старых дополнительных ассистентов
  db.run('DELETE FROM lesson_additional_assistants WHERE lesson_id = ?', [lessonId], (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Добавляем новых дополнительных ассистентов
    if (additionalAssistants && additionalAssistants.length > 0) {
      const assistantPromises = additionalAssistants.map(assistantId => {
        return new Promise((resolve, reject) => {
          const assistantLinkId = uuidv4();
          db.run(
            'INSERT INTO lesson_additional_assistants (id, lesson_id, assistant_id) VALUES (?, ?, ?)',
            [assistantLinkId, lessonId, assistantId],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      });

      Promise.all(assistantPromises).catch(err => {
        console.error('Ошибка обновления дополнительных ассистентов:', err);
      });
    }
  });

  res.json({ message: 'Урок обновлен' });
}

app.delete('/api/lessons/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM lessons WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Урок удален' });
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📊 База данных: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Завершение работы сервера...');
  db.close((err) => {
    if (err) {
      console.error('Ошибка при закрытии базы данных:', err.message);
    } else {
      console.log('✅ База данных закрыта');
    }
    process.exit(0);
  });
});
