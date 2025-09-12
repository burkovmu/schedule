const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(express.json());

// Загружаем данные из JSON файла
let dataStore;
try {
  const dataPath = path.join(__dirname, 'data.json');
  const dataContent = fs.readFileSync(dataPath, 'utf8');
  dataStore = JSON.parse(dataContent);
  console.log('✅ Данные загружены из data.json');
} catch (error) {
  console.log('⚠️ Не удалось загрузить data.json, используем тестовые данные');
  // Временное хранилище в памяти (для Vercel)
  dataStore = {
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
      { id: 'teach1', name: 'Иванов И.И.', color: '#667eea', display_order: 1 },
      { id: 'teach2', name: 'Петров П.П.', color: '#f093fb', display_order: 2 },
      { id: 'teach3', name: 'Сидоров С.С.', color: '#4facfe', display_order: 3 }
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
}

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
  const groupsWithAssistants = dataStore.groups.map(group => {
    const assistant = dataStore.assistants.find(a => a.id === group.assistant_id);
    return {
      ...group,
      assistant_name: assistant?.name
    };
  });
  
  res.json(groupsWithAssistants.sort((a, b) => a.display_order - b.display_order));
});

app.post('/api/groups', (req, res) => {
  const { name, display_order, assistant_id } = req.body;
  const id = uuidv4();
  const newGroup = { id, name, display_order: display_order || 0, assistant_id: assistant_id || null };
  dataStore.groups.push(newGroup);
  
  // Находим ассистента для новой группы
  const assistant = dataStore.assistants.find(a => a.id === newGroup.assistant_id);
  
  // Возвращаем группу с именем ассистента
  res.json({
    ...newGroup,
    assistant_name: assistant?.name
  });
});

app.put('/api/groups/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const groupIndex = dataStore.groups.findIndex(g => g.id === id);
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Группа не найдена' });
  }
  
  // Обновляем группу
  dataStore.groups[groupIndex] = {
    ...dataStore.groups[groupIndex],
    ...updates
  };
  
  // Находим ассистента для обновленной группы
  const updatedGroup = dataStore.groups[groupIndex];
  const assistant = dataStore.assistants.find(a => a.id === updatedGroup.assistant_id);
  
  // Возвращаем группу с именем ассистента
  res.json({
    ...updatedGroup,
    assistant_name: assistant?.name
  });
});

app.delete('/api/groups/:id', (req, res) => {
  const { id } = req.params;
  dataStore.groups = dataStore.groups.filter(g => g.id !== id);
  res.json({ message: 'Группа удалена' });
});

// Предметы
app.get('/api/subjects', (req, res) => {
  res.json(dataStore.subjects);
});

app.post('/api/subjects', (req, res) => {
  const { name, color } = req.body;
  const id = uuidv4();
  const newSubject = { id, name, color: color || '#667eea' };
  dataStore.subjects.push(newSubject);
  res.json(newSubject);
});

app.put('/api/subjects/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const subjectIndex = dataStore.subjects.findIndex(s => s.id === id);
  if (subjectIndex === -1) {
    return res.status(404).json({ error: 'Предмет не найден' });
  }
  
  // Обновляем предмет
  dataStore.subjects[subjectIndex] = {
    ...dataStore.subjects[subjectIndex],
    ...updates
  };
  
  res.json(dataStore.subjects[subjectIndex]);
});

app.delete('/api/subjects/:id', (req, res) => {
  const { id } = req.params;
  dataStore.subjects = dataStore.subjects.filter(s => s.id !== id);
  res.json({ message: 'Предмет удален' });
});

// Преподаватели
app.get('/api/teachers', (req, res) => {
  res.json(dataStore.teachers.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
});

app.post('/api/teachers', (req, res) => {
  const { name, color } = req.body;
  const id = uuidv4();
  const maxOrder = Math.max(...dataStore.teachers.map(t => t.display_order || 0), 0);
  const newTeacher = { id, name, color: color || '#667eea', display_order: maxOrder + 1 };
  dataStore.teachers.push(newTeacher);
  res.json(newTeacher);
});

app.put('/api/teachers/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const teacherIndex = dataStore.teachers.findIndex(t => t.id === id);
  if (teacherIndex === -1) {
    return res.status(404).json({ error: 'Преподаватель не найден' });
  }
  
  // Обновляем преподавателя
  dataStore.teachers[teacherIndex] = {
    ...dataStore.teachers[teacherIndex],
    ...updates
  };
  
  res.json(dataStore.teachers[teacherIndex]);
});

app.delete('/api/teachers/:id', (req, res) => {
  const { id } = req.params;
  dataStore.teachers = dataStore.teachers.filter(t => t.id !== id);
  res.json({ message: 'Преподаватель удален' });
});

// Ассистенты
app.get('/api/assistants', (req, res) => {
  res.json(dataStore.assistants);
});

app.post('/api/assistants', (req, res) => {
  const { name } = req.body;
  const id = uuidv4();
  const newAssistant = { id, name };
  dataStore.assistants.push(newAssistant);
  res.json(newAssistant);
});

app.put('/api/assistants/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const assistantIndex = dataStore.assistants.findIndex(a => a.id === id);
  if (assistantIndex === -1) {
    return res.status(404).json({ error: 'Ассистент не найден' });
  }
  
  // Обновляем ассистента
  dataStore.assistants[assistantIndex] = {
    ...dataStore.assistants[assistantIndex],
    ...updates
  };
  
  res.json(dataStore.assistants[assistantIndex]);
});

app.delete('/api/assistants/:id', (req, res) => {
  const { id } = req.params;
  dataStore.assistants = dataStore.assistants.filter(a => a.id !== id);
  res.json({ message: 'Ассистент удален' });
});

app.post('/api/assistants/bulk', (req, res) => {
  const { names } = req.body;
  
  if (!Array.isArray(names) || names.length === 0) {
    res.status(400).json({ error: 'Список имен не может быть пустым' });
    return;
  }

  const assistants = names.map(name => {
    const id = uuidv4();
    return { id, name };
  });

  dataStore.assistants.push(...assistants);
  res.json(assistants);
});

// Аудитории
app.get('/api/rooms', (req, res) => {
  res.json(dataStore.rooms);
});

app.post('/api/rooms', (req, res) => {
  const { name } = req.body;
  const id = uuidv4();
  const newRoom = { id, name };
  dataStore.rooms.push(newRoom);
  res.json(newRoom);
});

app.put('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const roomIndex = dataStore.rooms.findIndex(r => r.id === id);
  if (roomIndex === -1) {
    return res.status(404).json({ error: 'Аудитория не найдена' });
  }
  
  // Обновляем аудиторию
  dataStore.rooms[roomIndex] = {
    ...dataStore.rooms[roomIndex],
    ...updates
  };
  
  res.json(dataStore.rooms[roomIndex]);
});

app.delete('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  dataStore.rooms = dataStore.rooms.filter(r => r.id !== id);
  res.json({ message: 'Кабинет удален' });
});

// Уроки
app.get('/api/lessons', (req, res) => {
  const lessonsWithNames = dataStore.lessons.map(lesson => {
    const group = dataStore.groups.find(g => g.id === lesson.group_id);
    const subject = dataStore.subjects.find(s => s.id === lesson.subject_id);
    const teacher = dataStore.teachers.find(t => t.id === lesson.teacher_id);
    const assistant = dataStore.assistants.find(a => a.id === lesson.assistant_id);
    const room = dataStore.rooms.find(r => r.id === lesson.room_id);
    
    // Обрабатываем дополнительные преподаватели
    const additionalTeachers = lesson.additional_teachers ? 
      lesson.additional_teachers.map(teacherId => {
        const additionalTeacher = dataStore.teachers.find(t => t.id === teacherId);
        return additionalTeacher ? {
          id: additionalTeacher.id,
          name: additionalTeacher.name,
          color: additionalTeacher.color
        } : null;
      }).filter(teacher => teacher) : [];
    
    // Обрабатываем дополнительные ассистенты
    const additionalAssistants = lesson.additional_assistants ? 
      lesson.additional_assistants.map(assistantId => {
        const additionalAssistant = dataStore.assistants.find(a => a.id === assistantId);
        return additionalAssistant ? {
          id: additionalAssistant.id,
          name: additionalAssistant.name
        } : null;
      }).filter(assistant => assistant) : [];
    
    return {
      ...lesson,
      group_name: group?.name,
      subject_name: subject?.name,
      subject_color: subject?.color,
      teacher_name: teacher?.name,
      teacher_color: teacher?.color,
      assistant_name: assistant?.name,
      room_name: room?.name,
      additional_teachers: additionalTeachers,
      additional_assistants: additionalAssistants
    };
  });
  
  res.json(lessonsWithNames.sort((a, b) => a.time_slot.localeCompare(b.time_slot)));
});

app.post('/api/lessons', (req, res) => {
  const { group_id, time_slot, subject_id, teacher_id, assistant_id, room_id, duration, color, comment, additional_teachers, additional_assistants } = req.body;
  const id = uuidv4();
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
    comment,
    additional_teachers: additional_teachers || [],
    additional_assistants: additional_assistants || []
  };
  dataStore.lessons.push(newLesson);
  res.json(newLesson);
});

app.put('/api/lessons/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const lessonIndex = dataStore.lessons.findIndex(l => l.id === id);
  if (lessonIndex === -1) {
    return res.status(404).json({ error: 'Урок не найден' });
  }
  
  dataStore.lessons[lessonIndex] = { ...dataStore.lessons[lessonIndex], ...updates };
  res.json({ message: 'Урок обновлен' });
});

app.delete('/api/lessons/:id', (req, res) => {
  const { id } = req.params;
  dataStore.lessons = dataStore.lessons.filter(l => l.id !== id);
  res.json({ message: 'Урок удален' });
});

// Для Vercel - экспортируем app
module.exports = app;

// Для локальной разработки
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📊 База данных: In-Memory (Vercel)`);
  });
}