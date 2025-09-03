const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - исправленный CORS для мобильных устройств
app.use(cors({
  origin: true, // Разрешить все домены
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json());

// Попытка подключения к Supabase
let supabase = null;
let useSupabase = false;

try {
  const { createClient } = require('@supabase/supabase-js');
  require('dotenv').config();
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    useSupabase = true;
    console.log('✅ Используем Supabase');
  } else {
    console.log('⚠️ Переменные Supabase не настроены, используем SQLite');
  }
} catch (error) {
  console.log('⚠️ Supabase не доступен, используем SQLite:', error.message);
}

// Fallback на SQLite
let db = null;
if (!useSupabase) {
  try {
    const sqlite3 = require('sqlite3').verbose();
    const dbPath = path.join(__dirname, 'raspisanie.db');
    db = new sqlite3.Database(dbPath);
    console.log('✅ Используем SQLite');
  } catch (error) {
    console.error('❌ Ошибка подключения к SQLite:', error);
  }
}

// Инициализация базы данных
const initializeDatabase = async () => {
  if (useSupabase) {
    await initializeSupabase();
  } else {
    initializeSQLite();
  }
};

// Инициализация Supabase
const initializeSupabase = async () => {
  try {
    console.log('🔄 Проверка подключения к Supabase...');
    
    const { data, error } = await supabase
      .from('groups')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Ошибка подключения к Supabase:', error.message);
      console.log('💡 Переключаемся на SQLite...');
      useSupabase = false;
      await initializeSQLite();
      return;
    }

    await insertInitialDataSupabase();
    console.log('✅ Подключение к Supabase установлено');
  } catch (error) {
    console.error('❌ Ошибка инициализации Supabase:', error);
    console.log('💡 Переключаемся на SQLite...');
    useSupabase = false;
    await initializeSQLite();
  }
};

// Инициализация SQLite
const initializeSQLite = async () => {
  if (!db) return;
  
  console.log('🔄 Инициализация SQLite...');
  
  // Создание таблиц
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      display_order INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS subjects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT DEFAULT '#667eea'
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS assistants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )`);

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
    insertInitialDataSQLite();
  });
};

// Заполнение начальными данными для Supabase
const insertInitialDataSupabase = async () => {
  const initialData = {
    groups: [
      { id: 'group1', name: 'Группа А', display_order: 1 },
      { id: 'group2', name: 'Группа Б', display_order: 2 },
      { id: 'group3', name: 'Группа В', display_order: 3 }
    ],
    subjects: [
      { id: 'subj1', name: 'Математика', color: '#667eea' },
      { id: 'subj2', name: 'Физика', color: '#f093fb' },
      { id: 'subj3', name: 'Химия', color: '#4facfe' },
      { id: 'subj4', name: 'Биология', color: '#43e97b' }
    ],
    teachers: [
      { id: 'teach1', name: 'Иванов И.И.' },
      { id: 'teach2', name: 'Петров П.П.' },
      { id: 'teach3', name: 'Сидоров С.С.' }
    ],
    assistants: [
      { id: 'assist1', name: 'Козлов К.К.' },
      { id: 'assist2', name: 'Морозов М.М.' }
    ],
    rooms: [
      { id: 'room1', name: 'Аудитория 101' },
      { id: 'room2', name: 'Аудитория 102' },
      { id: 'room3', name: 'Лаборатория 201' },
      { id: 'room4', name: 'Лаборатория 202' }
    ]
  };

  for (const [table, data] of Object.entries(initialData)) {
    for (const item of data) {
      const { error } = await supabase
        .from(table)
        .upsert(item, { onConflict: 'id' });
      
      if (error && !error.message.includes('duplicate key')) {
        console.error(`Ошибка вставки в ${table}:`, error);
      }
    }
  }
};

// Заполнение начальными данными для SQLite
const insertInitialDataSQLite = () => {
  const initialData = [
    { table: 'groups', data: [
      { id: 'group1', name: 'Группа А', display_order: 1 },
      { id: 'group2', name: 'Группа Б', display_order: 2 },
      { id: 'group3', name: 'Группа В', display_order: 3 }
    ]},
    { table: 'subjects', data: [
      { id: 'subj1', name: 'Математика', color: '#667eea' },
      { id: 'subj2', name: 'Физика', color: '#f093fb' },
      { id: 'subj3', name: 'Химия', color: '#4facfe' },
      { id: 'subj4', name: 'Биология', color: '#43e97b' }
    ]},
    { table: 'teachers', data: [
      { id: 'teach1', name: 'Иванов И.И.' },
      { id: 'teach2', name: 'Петров П.П.' },
      { id: 'teach3', name: 'Сидоров С.С.' }
    ]},
    { table: 'assistants', data: [
      { id: 'assist1', name: 'Козлов К.К.' },
      { id: 'assist2', name: 'Морозов М.М.' }
    ]},
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
};

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
app.get('/api/groups', async (req, res) => {
  try {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('display_order');
      
      if (error) throw error;
      res.json(data);
    } else {
      db.all('SELECT * FROM groups ORDER BY display_order', (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      });
    }
  } catch (error) {
    console.error('Ошибка получения групп:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/groups', async (req, res) => {
  try {
    const { name, display_order } = req.body;
    const id = uuidv4();
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from('groups')
        .insert([{ id, name, display_order: display_order || 0 }])
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } else {
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
    }
  } catch (error) {
    console.error('Ошибка создания группы:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (useSupabase) {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      res.json({ message: 'Группа удалена' });
    } else {
      db.run('DELETE FROM groups WHERE id = ?', [id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Группа удалена' });
      });
    }
  } catch (error) {
    console.error('Ошибка удаления группы:', error);
    res.status(500).json({ error: error.message });
  }
});

// Предметы
app.get('/api/subjects', async (req, res) => {
  try {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('subjects')
        .select('*');
      
      if (error) throw error;
      res.json(data);
    } else {
      db.all('SELECT * FROM subjects', (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      });
    }
  } catch (error) {
    console.error('Ошибка получения предметов:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const { name, color } = req.body;
    const id = uuidv4();
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from('subjects')
        .insert([{ id, name, color: color || '#667eea' }])
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } else {
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
    }
  } catch (error) {
    console.error('Ошибка создания предмета:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (useSupabase) {
      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      res.json({ message: 'Предмет удален' });
    } else {
      db.run('DELETE FROM subjects WHERE id = ?', [id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Предмет удален' });
      });
    }
  } catch (error) {
    console.error('Ошибка удаления предмета:', error);
    res.status(500).json({ error: error.message });
  }
});

// Преподаватели
app.get('/api/teachers', async (req, res) => {
  try {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('teachers')
        .select('*');
      
      if (error) throw error;
      res.json(data);
    } else {
      db.all('SELECT * FROM teachers', (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      });
    }
  } catch (error) {
    console.error('Ошибка получения преподавателей:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/teachers', async (req, res) => {
  try {
    const { name } = req.body;
    const id = uuidv4();
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from('teachers')
        .insert([{ id, name }])
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } else {
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
    }
  } catch (error) {
    console.error('Ошибка создания преподавателя:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/teachers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (useSupabase) {
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      res.json({ message: 'Преподаватель удален' });
    } else {
      db.run('DELETE FROM teachers WHERE id = ?', [id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Преподаватель удален' });
      });
    }
  } catch (error) {
    console.error('Ошибка удаления преподавателя:', error);
    res.status(500).json({ error: error.message });
  }
});

// Ассистенты
app.get('/api/assistants', async (req, res) => {
  try {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('assistants')
        .select('*');
      
      if (error) throw error;
      res.json(data);
    } else {
      db.all('SELECT * FROM assistants', (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      });
    }
  } catch (error) {
    console.error('Ошибка получения ассистентов:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assistants', async (req, res) => {
  try {
    const { name } = req.body;
    const id = uuidv4();
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from('assistants')
        .insert([{ id, name }])
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } else {
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
    }
  } catch (error) {
    console.error('Ошибка создания ассистента:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/assistants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (useSupabase) {
      const { error } = await supabase
        .from('assistants')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      res.json({ message: 'Ассистент удален' });
    } else {
      db.run('DELETE FROM assistants WHERE id = ?', [id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Ассистент удален' });
      });
    }
  } catch (error) {
    console.error('Ошибка удаления ассистента:', error);
    res.status(500).json({ error: error.message });
  }
});

// Аудитории
app.get('/api/rooms', async (req, res) => {
  try {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('rooms')
        .select('*');
      
      if (error) throw error;
      res.json(data);
    } else {
      db.all('SELECT * FROM rooms', (err, rows) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(rows);
      });
    }
  } catch (error) {
    console.error('Ошибка получения аудиторий:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const { name } = req.body;
    const id = uuidv4();
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from('rooms')
        .insert([{ id, name }])
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } else {
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
    }
  } catch (error) {
    console.error('Ошибка создания аудитории:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (useSupabase) {
      const { error } = await supabase
        .from('rooms')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      res.json({ message: 'Кабинет удален' });
    } else {
      db.run('DELETE FROM rooms WHERE id = ?', [id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Кабинет удален' });
      });
    }
  } catch (error) {
    console.error('Ошибка удаления аудитории:', error);
    res.status(500).json({ error: error.message });
  }
});

// Уроки
app.get('/api/lessons', async (req, res) => {
  try {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('lessons')
        .select(`
          *,
          groups!inner(name),
          subjects!inner(name, color),
          teachers!inner(name),
          assistants(name),
          rooms!inner(name)
        `)
        .order('time_slot');
      
      if (error) throw error;
      
      const formattedData = data.map(lesson => ({
        ...lesson,
        group_name: lesson.groups.name,
        subject_name: lesson.subjects.name,
        subject_color: lesson.subjects.color,
        teacher_name: lesson.teachers.name,
        assistant_name: lesson.assistants?.name,
        room_name: lesson.rooms.name
      }));
      
      res.json(formattedData);
    } else {
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
    }
  } catch (error) {
    console.error('Ошибка получения уроков:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lessons', async (req, res) => {
  try {
    const { group_id, time_slot, subject_id, teacher_id, assistant_id, room_id, duration, color, comment } = req.body;
    const id = uuidv4();
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from('lessons')
        .insert([{
          id,
          group_id,
          time_slot,
          subject_id,
          teacher_id,
          assistant_id,
          room_id,
          duration: duration || 45,
          color,
          comment
        }])
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } else {
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
    }
  } catch (error) {
    console.error('Ошибка создания урока:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      res.json({ message: 'Урок обновлен', data });
    } else {
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
    }
  } catch (error) {
    console.error('Ошибка обновления урока:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (useSupabase) {
      const { error } = await supabase
        .from('lessons')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      res.json({ message: 'Урок удален' });
    } else {
      db.run('DELETE FROM lessons WHERE id = ?', [id], function(err) {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Урок удален' });
      });
    }
  } catch (error) {
    console.error('Ошибка удаления урока:', error);
    res.status(500).json({ error: error.message });
  }
});

// Запуск сервера
const startServer = async () => {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📊 База данных: ${useSupabase ? 'Supabase' : 'SQLite'}`);
  });
};

startServer().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Завершение работы сервера...');
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Ошибка при закрытии базы данных:', err.message);
      } else {
        console.log('✅ База данных закрыта');
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});
