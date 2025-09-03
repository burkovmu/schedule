const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

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

// Временное хранилище в памяти (для Vercel)
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
app.get('/api/groups', (req, res) => {
  res.json(dataStore.groups.sort((a, b) => a.display_order - b.display_order));
});

app.post('/api/groups', (req, res) => {
  const { name, display_order } = req.body;
  const id = uuidv4();
  const newGroup = { id, name, display_order: display_order || 0 };
  dataStore.groups.push(newGroup);
  res.json(newGroup);
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

app.delete('/api/subjects/:id', (req, res) => {
  const { id } = req.params;
  dataStore.subjects = dataStore.subjects.filter(s => s.id !== id);
  res.json({ message: 'Предмет удален' });
});

// Преподаватели
app.get('/api/teachers', (req, res) => {
  res.json(dataStore.teachers);
});

app.post('/api/teachers', (req, res) => {
  const { name } = req.body;
  const id = uuidv4();
  const newTeacher = { id, name };
  dataStore.teachers.push(newTeacher);
  res.json(newTeacher);
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

app.delete('/api/assistants/:id', (req, res) => {
  const { id } = req.params;
  dataStore.assistants = dataStore.assistants.filter(a => a.id !== id);
  res.json({ message: 'Ассистент удален' });
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
});

app.post('/api/lessons', (req, res) => {
  const { group_id, time_slot, subject_id, teacher_id, assistant_id, room_id, duration, color, comment } = req.body;
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
    comment
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

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📊 База данных: In-Memory (Vercel)`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Завершение работы сервера...');
  process.exit(0);
});
