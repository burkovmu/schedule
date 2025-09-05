const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
    display_order INTEGER DEFAULT 0
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
    name TEXT NOT NULL
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
      { id: 'teach1', name: 'Иванов И.И.' },
      { id: 'teach2', name: 'Петров П.П.' },
      { id: 'teach3', name: 'Сидоров С.С.' }
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
});

// Генерация временных слотов
const generateTimeSlots = () => {
  const timeSlots = [];
  let slotId = 1;

  for (let hour = 9; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 5) {
      const startHour = hour;
      const startMinute = minute;
      const endMinute = minute + 5;
      const endHour = endMinute >= 60 ? hour + 1 : hour;
      const finalEndMinute = endMinute >= 60 ? endMinute - 60 : endMinute;
      
      if (endHour > 18 || (endHour === 18 && finalEndMinute > 0)) {
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
  db.all('SELECT * FROM groups ORDER BY display_order', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/groups', (req, res) => {
  const { name, display_order } = req.body;
  const id = uuidv4();
  
  db.run('INSERT INTO groups (id, name, display_order) VALUES (?, ?, ?)', 
    [id, name, display_order || 0], 
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, name, display_order: display_order || 0 });
    }
  );
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
  const { name } = req.body;
  const id = uuidv4();
  
  db.run('INSERT INTO teachers (id, name) VALUES (?, ?)', 
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
    db.run('INSERT INTO teachers (id, name) VALUES (?, ?)', 
      [id, name.trim()], 
      function(err) {
        completed++;
        if (err) {
          hasError = true;
          res.status(500).json({ error: err.message });
          return;
        }
        
        teachers.push({ id, name: name.trim() });
        
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
           t.name as teacher_name,
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
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/lessons', (req, res) => {
  const { group_id, time_slot, subject_id, teacher_id, assistant_id, room_id, duration, color, comment } = req.body;
  const id = uuidv4();
  
  db.run(
    'INSERT INTO lessons (id, group_id, time_slot, subject_id, teacher_id, assistant_id, room_id, duration, color, comment) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, group_id, time_slot, subject_id, teacher_id, assistant_id, room_id, duration || 45, color, comment],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, group_id, time_slot, subject_id, teacher_id, assistant_id, room_id, duration: duration || 45, color, comment });
    }
  );
});

app.put('/api/lessons/:id', (req, res) => {
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
  const sql = `UPDATE lessons SET ${fields.join(', ')} WHERE id = ?`;
  
  db.run(sql, values, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: 'Урок обновлен' });
  });
});

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
