const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

// Middleware
app.use(cors({
  origin: true,
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
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
    useSupabase = true;
    console.log('✅ Используем Supabase');
  } else {
    console.log('⚠️ Переменные Supabase не настроены, используем in-memory');
  }
} catch (error) {
  console.log('⚠️ Supabase не доступен, используем in-memory:', error.message);
}

// In-memory хранилище как fallback
let dataStore = {
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
  ],
  lessons: []
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
      res.json(dataStore.groups.sort((a, b) => a.display_order - b.display_order));
    }
  } catch (error) {
    console.error('Ошибка получения групп:', error);
    res.json(dataStore.groups.sort((a, b) => a.display_order - b.display_order));
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
      const newGroup = { id, name, display_order: display_order || 0 };
      dataStore.groups.push(newGroup);
      res.json(newGroup);
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
      dataStore.groups = dataStore.groups.filter(g => g.id !== id);
      res.json({ message: 'Группа удалена' });
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
      res.json(dataStore.subjects);
    }
  } catch (error) {
    console.error('Ошибка получения предметов:', error);
    res.json(dataStore.subjects);
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
      const newSubject = { id, name, color: color || '#667eea' };
      dataStore.subjects.push(newSubject);
      res.json(newSubject);
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
      dataStore.subjects = dataStore.subjects.filter(s => s.id !== id);
      res.json({ message: 'Предмет удален' });
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
      res.json(dataStore.teachers);
    }
  } catch (error) {
    console.error('Ошибка получения преподавателей:', error);
    res.json(dataStore.teachers);
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
      const newTeacher = { id, name };
      dataStore.teachers.push(newTeacher);
      res.json(newTeacher);
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
      dataStore.teachers = dataStore.teachers.filter(t => t.id !== id);
      res.json({ message: 'Преподаватель удален' });
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
      res.json(dataStore.assistants);
    }
  } catch (error) {
    console.error('Ошибка получения ассистентов:', error);
    res.json(dataStore.assistants);
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
      const newAssistant = { id, name };
      dataStore.assistants.push(newAssistant);
      res.json(newAssistant);
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
      dataStore.assistants = dataStore.assistants.filter(a => a.id !== id);
      res.json({ message: 'Ассистент удален' });
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
      res.json(dataStore.rooms);
    }
  } catch (error) {
    console.error('Ошибка получения аудиторий:', error);
    res.json(dataStore.rooms);
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
      const newRoom = { id, name };
      dataStore.rooms.push(newRoom);
      res.json(newRoom);
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
      dataStore.rooms = dataStore.rooms.filter(r => r.id !== id);
      res.json({ message: 'Кабинет удален' });
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
      const lessonsWithNames = dataStore.lessons.map(lesson => {
        const group = dataStore.groups.find(g => g.id === lesson.group_id);
        const subject = dataStore.subjects.find(s => s.id === lesson.subject_id);
        const teacher = dataStore.teachers.find(t => t.id === lesson.teacher_id);
        const assistant = dataStore.assistants.find(a => a.id === lesson.assistant_id);
        const room = dataStore.rooms.find(r => r.id === lesson.room_id);
        
        return {
          ...lesson,
          group_name: group?.name,
          subject_name: subject?.name,
          subject_color: subject?.color,
          teacher_name: teacher?.name,
          assistant_name: assistant?.name,
          room_name: room?.name
        };
      });
      
      res.json(lessonsWithNames.sort((a, b) => a.time_slot.localeCompare(b.time_slot)));
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
      const newLesson = {
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
      };
      dataStore.lessons.push(newLesson);
      res.json(newLesson);
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
      const lessonIndex = dataStore.lessons.findIndex(l => l.id === id);
      if (lessonIndex === -1) {
        return res.status(404).json({ error: 'Урок не найден' });
      }
      
      dataStore.lessons[lessonIndex] = { ...dataStore.lessons[lessonIndex], ...updates };
      res.json({ message: 'Урок обновлен' });
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
      dataStore.lessons = dataStore.lessons.filter(l => l.id !== id);
      res.json({ message: 'Урок удален' });
    }
  } catch (error) {
    console.error('Ошибка удаления урока:', error);
    res.status(500).json({ error: error.message });
  }
});

// Экспортируем для Vercel
module.exports = app;