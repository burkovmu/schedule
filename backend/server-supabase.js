const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Инициализация Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Отсутствуют переменные окружения Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Инициализация базы данных
const initializeDatabase = async () => {
  try {
    console.log('🔄 Проверка подключения к Supabase...');
    
    // Проверяем подключение, пытаясь получить данные из таблицы groups
    const { data, error } = await supabase
      .from('groups')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Ошибка подключения к Supabase:', error.message);
      console.log('💡 Убедитесь, что:');
      console.log('   1. Выполнен SQL скрипт из backend/supabase-schema.sql');
      console.log('   2. Правильно настроены переменные окружения');
      return;
    }

    // Заполнение начальными данными
    await insertInitialData();
    
    console.log('✅ Подключение к Supabase установлено');
  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error);
  }
};

// Заполнение начальными данными
const insertInitialData = async () => {
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
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('display_order');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/groups', async (req, res) => {
  try {
    const { name, display_order } = req.body;
    const id = uuidv4();
    
    const { data, error } = await supabase
      .from('groups')
      .insert([{ id, name, display_order: display_order || 0 }])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Группа удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Предметы
app.get('/api/subjects', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const { name, color } = req.body;
    const id = uuidv4();
    
    const { data, error } = await supabase
      .from('subjects')
      .insert([{ id, name, color: color || '#667eea' }])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Предмет удален' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Преподаватели
app.get('/api/teachers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('teachers')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/teachers', async (req, res) => {
  try {
    const { name } = req.body;
    const id = uuidv4();
    
    const { data, error } = await supabase
      .from('teachers')
      .insert([{ id, name }])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/teachers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('teachers')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Преподаватель удален' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ассистенты
app.get('/api/assistants', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('assistants')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assistants', async (req, res) => {
  try {
    const { name } = req.body;
    const id = uuidv4();
    
    const { data, error } = await supabase
      .from('assistants')
      .insert([{ id, name }])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/assistants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('assistants')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Ассистент удален' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Аудитории
app.get('/api/rooms', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*');
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/rooms', async (req, res) => {
  try {
    const { name } = req.body;
    const id = uuidv4();
    
    const { data, error } = await supabase
      .from('rooms')
      .insert([{ id, name }])
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Кабинет удален' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Уроки
app.get('/api/lessons', async (req, res) => {
  try {
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
    
    // Преобразуем данные в нужный формат
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/lessons', async (req, res) => {
  try {
    const { group_id, time_slot, subject_id, teacher_id, assistant_id, room_id, duration, color, comment } = req.body;
    const id = uuidv4();
    
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
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('lessons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    res.json({ message: 'Урок обновлен', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('lessons')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    res.json({ message: 'Урок удален' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Запуск сервера
const startServer = async () => {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📊 База данных: Supabase`);
  });
};

startServer().catch(console.error);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Завершение работы сервера...');
  process.exit(0);
});
