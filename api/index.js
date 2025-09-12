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

console.log('🔧 Environment variables check:');
console.log('🔧 SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('🔧 SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

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

console.log('🔧 Final configuration - useSupabase:', useSupabase);

// In-memory хранилище как fallback
let dataStore = {
  groups: [
    { id: 'c2035142-5d91-4e45-8587-2c4cc1f1fe37', name: 'Альфа 0', display_order: 1 },
    { id: 'group1', name: 'Группа А', display_order: 1 },
    { id: '0b47b40f-ae9d-4994-8737-ac75ed69b523', name: 'Альфа 1', display_order: 2 },
    { id: 'group2', name: 'Группа Б', display_order: 2 },
    { id: 'a66d4573-df8c-4eb3-9ca7-9933511da44a', name: 'Альфа 2', display_order: 3 },
    { id: 'group3', name: 'Группа В', display_order: 3 },
    { id: '978a32c5-16b8-4538-b7ae-2ddb3441c73b', name: 'Альфа 3', display_order: 4 },
    { id: '5719a13d-7f4c-405d-a8e0-addabc996eb9', name: 'Бета 1', display_order: 5 },
    { id: '6c301bfb-8280-47e9-9812-58e91dd6c920', name: 'Бета 2', display_order: 6 },
    { id: '8826afe7-fe53-4e66-ac43-36526da93fb3', name: 'Бета 4', display_order: 7 },
    { id: '3fc5ce07-0618-4204-a60f-a4d5ab99b95d', name: 'Гамма 1', display_order: 8 },
    { id: '5a03814a-8226-4540-9369-ca3d7c5cd504', name: 'Гамма 2', display_order: 9 },
    { id: '03589669-9ab2-4586-9e46-709699a82206', name: 'Гамма 4', display_order: 10 },
    { id: 'df7c6e15-2ac9-4fe1-b311-e7f6ee941ec2', name: 'Дельта 1', display_order: 11 },
    { id: '6f3a5606-8a71-4a6c-b165-a5f5713bdc30', name: 'Дельта 2', display_order: 12 },
    { id: 'acb8f5cd-1fbf-45d4-8486-ef84c192522f', name: 'Дельта 4', display_order: 13 },
    { id: '73c5c64a-4548-49a0-872e-ac1b40ce4c64', name: 'Эпсилон 1', display_order: 14 },
    { id: '1007bdff-c93f-43e6-aa9b-b5a8ab78bc0b', name: 'Эпсилон 2', display_order: 15 },
    { id: 'd2502300-6cc0-4363-9814-5461f1770f84', name: 'Эпсилон 3', display_order: 16 },
    { id: 'eea5867b-4bd4-47c2-81c8-9a8c83a10152', name: 'Эпсилон 4', display_order: 17 },
    { id: '4961fbdc-1288-474a-b774-10960aa7c6dd', name: 'Лямбда 1', display_order: 18 },
    { id: 'd31416ee-1b20-45bc-a434-5fef6d05031f', name: 'Лямбда 2', display_order: 19 },
    { id: '79e7e3d1-d845-4ed7-b3d6-5f1b8d0ce54b', name: 'Лямбда 4', display_order: 20 },
    { id: '09fcfa99-6434-44fa-b78f-9b1a58e9edb46', name: 'Лямбда 5', display_order: 21 },
    { id: 'f358e609-7302-435c-91e0-c82f9b2dfc71', name: 'Омикрон 1', display_order: 22 },
    { id: 'b16ce33a-6ec9-42a6-85ee-410f724f99c4', name: 'Омикрон 2', display_order: 23 },
    { id: '4737dba5-c0d7-4768-9907-d44a846c69c4', name: 'Омикрон 3', display_order: 24 },
    { id: '958e922a-34fe-4485-86b9-349a78e640fc', name: 'Омега', display_order: 25 }
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
app.get('/api/groups', async (req, res) => {
  try {
    if (useSupabase) {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          assistants(name)
        `)
        .order('display_order');
      
      if (error) throw error;
      
      const formattedData = data.map(group => ({
        ...group,
        assistant_name: group.assistants?.name
      }));
      
      res.json(formattedData);
    } else {
      const groupsWithAssistants = dataStore.groups.map(group => {
        const assistant = dataStore.assistants.find(a => a.id === group.assistant_id);
        return {
          ...group,
          assistant_name: assistant?.name
        };
      });
      
      res.json(groupsWithAssistants.sort((a, b) => a.display_order - b.display_order));
    }
  } catch (error) {
    console.error('Ошибка получения групп:', error);
    res.json(dataStore.groups.sort((a, b) => a.display_order - b.display_order));
  }
});

app.post('/api/groups', async (req, res) => {
  try {
    const { name, display_order, assistant_id } = req.body;
    const id = uuidv4();
    
    // Обрабатываем assistant_id - если пустая строка, устанавливаем null
    const processedAssistantId = assistant_id === '' ? null : assistant_id;
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from('groups')
        .insert([{ id, name, display_order: display_order || 0, assistant_id: processedAssistantId }])
        .select(`
          *,
          assistants(name)
        `)
        .single();
      
      if (error) throw error;
      
      const formattedData = {
        ...data,
        assistant_name: data.assistants?.name
      };
      
      res.json(formattedData);
    } else {
      const newGroup = { id, name, display_order: display_order || 0, assistant_id: processedAssistantId };
      dataStore.groups.push(newGroup);
      
      const assistant = dataStore.assistants.find(a => a.id === newGroup.assistant_id);
      
      res.json({
        ...newGroup,
        assistant_name: assistant?.name
      });
    }
  } catch (error) {
    console.error('Ошибка создания группы:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/groups/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('🔧 Updating group:', id, 'with updates:', updates);
    console.log('🔧 useSupabase:', useSupabase);
    
    // Обрабатываем assistant_id - если пустая строка, устанавливаем null
    if (updates.assistant_id === '') {
      updates.assistant_id = null;
    }
    
    if (useSupabase) {
      // Сначала обновляем группу
      const { data: updateData, error: updateError } = await supabase
        .from('groups')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();
      
      if (updateError) {
        console.error('❌ Supabase update error:', updateError);
        throw updateError;
      }
      
      // Затем получаем обновленную группу с ассистентом
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          assistants(name)
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('❌ Supabase select error:', error);
        throw error;
      }
      
      const formattedData = {
        ...data,
        assistant_name: data.assistants?.name
      };
      
      console.log('✅ Group updated successfully in Supabase:', formattedData);
      res.json(formattedData);
    } else {
      const groupIndex = dataStore.groups.findIndex(g => g.id === id);
      if (groupIndex === -1) {
        console.error('❌ Group not found:', id);
        return res.status(404).json({ error: 'Группа не найдена' });
      }
      
      dataStore.groups[groupIndex] = { ...dataStore.groups[groupIndex], ...updates };
      
      const updatedGroup = dataStore.groups[groupIndex];
      const assistant = dataStore.assistants.find(a => a.id === updatedGroup.assistant_id);
      
      const result = {
        ...updatedGroup,
        assistant_name: assistant?.name
      };
      
      console.log('✅ Group updated successfully in memory:', result);
      res.json(result);
    }
  } catch (error) {
    console.error('❌ Ошибка обновления группы:', error);
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

app.put('/api/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from('subjects')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } else {
      const subjectIndex = dataStore.subjects.findIndex(s => s.id === id);
      if (subjectIndex === -1) {
        return res.status(404).json({ error: 'Предмет не найден' });
      }
      
      dataStore.subjects[subjectIndex] = { ...dataStore.subjects[subjectIndex], ...updates };
      res.json(dataStore.subjects[subjectIndex]);
    }
  } catch (error) {
    console.error('Ошибка обновления предмета:', error);
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
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      res.json(data);
    } else {
      res.json(dataStore.teachers.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
    }
  } catch (error) {
    console.error('Ошибка получения преподавателей:', error);
    res.json(dataStore.teachers.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)));
  }
});

app.post('/api/teachers', async (req, res) => {
  try {
    const { name, color } = req.body;
    const id = uuidv4();
    
    if (useSupabase) {
      // Получаем максимальный display_order
      const { data: maxOrderData, error: maxOrderError } = await supabase
        .from('teachers')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);
      
      const nextOrder = maxOrderData && maxOrderData.length > 0 
        ? (maxOrderData[0].display_order || 0) + 1 
        : 1;
      
      const { data, error } = await supabase
        .from('teachers')
        .insert([{ id, name, color: color || '#667eea', display_order: nextOrder }])
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } else {
      const maxOrder = Math.max(...dataStore.teachers.map(t => t.display_order || 0), 0);
      const newTeacher = { id, name, color: color || '#667eea', display_order: maxOrder + 1 };
      dataStore.teachers.push(newTeacher);
      res.json(newTeacher);
    }
  } catch (error) {
    console.error('Ошибка создания преподавателя:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/teachers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('🔧 Updating teacher:', id, 'with updates:', updates);
    console.log('🔧 useSupabase:', useSupabase);
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from('teachers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Teacher updated successfully:', data);
      res.json(data);
    } else {
      const teacherIndex = dataStore.teachers.findIndex(t => t.id === id);
      if (teacherIndex === -1) {
        console.error('❌ Teacher not found:', id);
        return res.status(404).json({ error: 'Преподаватель не найден' });
      }
      
      dataStore.teachers[teacherIndex] = { ...dataStore.teachers[teacherIndex], ...updates };
      console.log('✅ Teacher updated in memory:', dataStore.teachers[teacherIndex]);
      res.json(dataStore.teachers[teacherIndex]);
    }
  } catch (error) {
    console.error('❌ Ошибка обновления преподавателя:', error);
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

app.put('/api/assistants/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from('assistants')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } else {
      const assistantIndex = dataStore.assistants.findIndex(a => a.id === id);
      if (assistantIndex === -1) {
        return res.status(404).json({ error: 'Ассистент не найден' });
      }
      
      dataStore.assistants[assistantIndex] = { ...dataStore.assistants[assistantIndex], ...updates };
      res.json(dataStore.assistants[assistantIndex]);
    }
  } catch (error) {
    console.error('Ошибка обновления ассистента:', error);
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

app.put('/api/rooms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from('rooms')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } else {
      const roomIndex = dataStore.rooms.findIndex(r => r.id === id);
      if (roomIndex === -1) {
        return res.status(404).json({ error: 'Аудитория не найдена' });
      }
      
      dataStore.rooms[roomIndex] = { ...dataStore.rooms[roomIndex], ...updates };
      res.json(dataStore.rooms[roomIndex]);
    }
  } catch (error) {
    console.error('Ошибка обновления аудитории:', error);
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
          teachers!inner(name, color),
          assistants(name),
          rooms!inner(name),
          lesson_additional_teachers(
            teachers(id, name, color)
          ),
          lesson_additional_assistants(
            assistants(id, name)
          )
        `)
        .order('time_slot');
      
      if (error) throw error;
      
      const formattedData = data.map(lesson => {
        // Обрабатываем дополнительные преподаватели
        const additionalTeachers = lesson.lesson_additional_teachers?.map(lat => ({
          id: lat.teachers.id,
          name: lat.teachers.name,
          color: lat.teachers.color
        })) || [];
        
        // Обрабатываем дополнительные ассистенты
        const additionalAssistants = lesson.lesson_additional_assistants?.map(laa => ({
          id: laa.assistants.id,
          name: laa.assistants.name
        })) || [];
        
        return {
          ...lesson,
          group_name: lesson.groups.name,
          subject_name: lesson.subjects.name,
          subject_color: lesson.subjects.color,
          teacher_name: lesson.teachers.name,
          teacher_color: lesson.teachers.color,
          assistant_name: lesson.assistants?.name,
          room_name: lesson.rooms.name,
          additional_teachers: additionalTeachers,
          additional_assistants: additionalAssistants
        };
      });
      
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
    const { group_id, time_slot, subject_id, teacher_id, assistant_id, room_id, duration, color, comment, additional_teachers, additional_assistants } = req.body;
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
      
      // Добавляем дополнительных преподавателей
      if (additional_teachers && additional_teachers.length > 0) {
        const teacherInserts = additional_teachers.map(teacherId => ({
          id: uuidv4(),
          lesson_id: id,
          teacher_id: teacherId
        }));
        
        const { error: teachersError } = await supabase
          .from('lesson_additional_teachers')
          .insert(teacherInserts);
        
        if (teachersError) {
          console.error('Ошибка добавления дополнительных преподавателей:', teachersError);
        }
      }
      
      // Добавляем дополнительных ассистентов
      if (additional_assistants && additional_assistants.length > 0) {
        const assistantInserts = additional_assistants.map(assistantId => ({
          id: uuidv4(),
          lesson_id: id,
          assistant_id: assistantId
        }));
        
        const { error: assistantsError } = await supabase
          .from('lesson_additional_assistants')
          .insert(assistantInserts);
        
        if (assistantsError) {
          console.error('Ошибка добавления дополнительных ассистентов:', assistantsError);
        }
      }
      
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
        comment,
        additional_teachers: additional_teachers || [],
        additional_assistants: additional_assistants || []
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
    const { additional_teachers, additional_assistants, ...updates } = req.body;
    
    if (useSupabase) {
      // Обновляем основные поля урока
      const { data, error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Обновляем дополнительных преподавателей
      if (additional_teachers !== undefined) {
        // Удаляем существующих дополнительных преподавателей
        const { error: deleteTeachersError } = await supabase
          .from('lesson_additional_teachers')
          .delete()
          .eq('lesson_id', id);
        
        if (deleteTeachersError) {
          console.error('Ошибка удаления дополнительных преподавателей:', deleteTeachersError);
        }
        
        // Добавляем новых дополнительных преподавателей
        if (additional_teachers && additional_teachers.length > 0) {
          const teacherInserts = additional_teachers.map(teacherId => ({
            id: uuidv4(),
            lesson_id: id,
            teacher_id: teacherId
          }));
          
          const { error: teachersError } = await supabase
            .from('lesson_additional_teachers')
            .insert(teacherInserts);
          
          if (teachersError) {
            console.error('Ошибка добавления дополнительных преподавателей:', teachersError);
          }
        }
      }
      
      // Обновляем дополнительных ассистентов
      if (additional_assistants !== undefined) {
        // Удаляем существующих дополнительных ассистентов
        const { error: deleteAssistantsError } = await supabase
          .from('lesson_additional_assistants')
          .delete()
          .eq('lesson_id', id);
        
        if (deleteAssistantsError) {
          console.error('Ошибка удаления дополнительных ассистентов:', deleteAssistantsError);
        }
        
        // Добавляем новых дополнительных ассистентов
        if (additional_assistants && additional_assistants.length > 0) {
          const assistantInserts = additional_assistants.map(assistantId => ({
            id: uuidv4(),
            lesson_id: id,
            assistant_id: assistantId
          }));
          
          const { error: assistantsError } = await supabase
            .from('lesson_additional_assistants')
            .insert(assistantInserts);
          
          if (assistantsError) {
            console.error('Ошибка добавления дополнительных ассистентов:', assistantsError);
          }
        }
      }
      
      res.json({ message: 'Урок обновлен', data });
    } else {
      const lessonIndex = dataStore.lessons.findIndex(l => l.id === id);
      if (lessonIndex === -1) {
        return res.status(404).json({ error: 'Урок не найден' });
      }
      
      dataStore.lessons[lessonIndex] = { 
        ...dataStore.lessons[lessonIndex], 
        ...updates,
        additional_teachers: additional_teachers !== undefined ? additional_teachers : dataStore.lessons[lessonIndex].additional_teachers,
        additional_assistants: additional_assistants !== undefined ? additional_assistants : dataStore.lessons[lessonIndex].additional_assistants
      };
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

// Bulk endpoints для массового добавления

// Массовое создание групп
app.post('/api/groups/bulk', async (req, res) => {
  try {
    const { names } = req.body;
    
    if (!Array.isArray(names) || names.length === 0) {
      res.status(400).json({ error: 'Список имен не может быть пустым' });
      return;
    }

    if (useSupabase) {
      const groups = names.map((name, index) => ({ 
        id: uuidv4(),
        name: name.trim(), 
        display_order: index + 1 
      }));
      const { data, error } = await supabase
        .from('groups')
        .insert(groups)
        .select();
      
      if (error) throw error;
      res.json(data);
    } else {
      const groups = names.map((name, index) => ({
        id: uuidv4(),
        name: name.trim(),
        display_order: index + 1
      }));
      
      dataStore.groups.push(...groups);
      res.json(groups);
    }
  } catch (error) {
    console.error('Ошибка массового создания групп:', error);
    res.status(500).json({ error: error.message });
  }
});

// Массовое создание предметов
app.post('/api/subjects/bulk', async (req, res) => {
  try {
    const { names } = req.body;
    
    if (!Array.isArray(names) || names.length === 0) {
      res.status(400).json({ error: 'Список имен не может быть пустым' });
      return;
    }

    if (useSupabase) {
      const subjects = names.map(name => ({ id: uuidv4(), name: name.trim(), color: '#667eea' }));
      const { data, error } = await supabase
        .from('subjects')
        .insert(subjects)
        .select();
      
      if (error) throw error;
      res.json(data);
    } else {
      const subjects = names.map(name => ({
        id: uuidv4(),
        name: name.trim()
      }));
      
      dataStore.subjects.push(...subjects);
      res.json(subjects);
    }
  } catch (error) {
    console.error('Ошибка массового создания предметов:', error);
    res.status(500).json({ error: error.message });
  }
});

// Массовое создание преподавателей
app.post('/api/teachers/bulk', async (req, res) => {
  try {
    console.log('🔧 Bulk teachers request received');
    console.log('🔧 Request body:', req.body);
    console.log('🔧 useSupabase:', useSupabase);
    
    const { names } = req.body;
    
    if (!Array.isArray(names) || names.length === 0) {
      console.log('❌ Invalid names array:', names);
      res.status(400).json({ error: 'Список имен не может быть пустым' });
      return;
    }

    console.log('✅ Processing names:', names);

    if (useSupabase) {
      console.log('🔧 Using Supabase for bulk insert');
      const teachers = names.map(name => ({ id: uuidv4(), name: name.trim() }));
      console.log('🔧 Prepared teachers:', teachers);
      
      const { data, error } = await supabase
        .from('teachers')
        .insert(teachers)
        .select();
      
      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Supabase success:', data);
      res.json(data);
    } else {
      console.log('🔧 Using in-memory store for bulk insert');
      const teachers = names.map(name => ({
        id: uuidv4(),
        name: name.trim()
      }));
      
      console.log('🔧 Prepared teachers:', teachers);
      dataStore.teachers.push(...teachers);
      console.log('✅ In-memory success, total teachers:', dataStore.teachers.length);
      res.json(teachers);
    }
  } catch (error) {
    console.error('❌ Ошибка массового создания преподавателей:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Массовое создание ассистентов
app.post('/api/assistants/bulk', async (req, res) => {
  try {
    console.log('🔧 Bulk assistants request received');
    console.log('🔧 Request body:', req.body);
    console.log('🔧 useSupabase:', useSupabase);
    
    const { names } = req.body;
    
    if (!Array.isArray(names) || names.length === 0) {
      console.log('❌ Invalid names array:', names);
      res.status(400).json({ error: 'Список имен не может быть пустым' });
      return;
    }

    console.log('✅ Processing names:', names);

    if (useSupabase) {
      console.log('🔧 Using Supabase for bulk insert');
      const assistants = names.map(name => ({ id: uuidv4(), name: name.trim() }));
      console.log('🔧 Prepared assistants:', assistants);
      
      const { data, error } = await supabase
        .from('assistants')
        .insert(assistants)
        .select();
      
      if (error) {
        console.error('❌ Supabase error:', error);
        throw error;
      }
      
      console.log('✅ Supabase success:', data);
      res.json(data);
    } else {
      console.log('🔧 Using in-memory store for bulk insert');
      const assistants = names.map(name => ({
        id: uuidv4(),
        name: name.trim()
      }));
      
      console.log('🔧 Prepared assistants:', assistants);
      dataStore.assistants.push(...assistants);
      console.log('✅ In-memory success, total assistants:', dataStore.assistants.length);
      res.json(assistants);
    }
  } catch (error) {
    console.error('❌ Ошибка массового создания ассистентов:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Массовое создание аудиторий
app.post('/api/rooms/bulk', async (req, res) => {
  try {
    const { names } = req.body;
    
    if (!Array.isArray(names) || names.length === 0) {
      res.status(400).json({ error: 'Список имен не может быть пустым' });
      return;
    }

    if (useSupabase) {
      const rooms = names.map(name => ({ id: uuidv4(), name: name.trim() }));
      const { data, error } = await supabase
        .from('rooms')
        .insert(rooms)
        .select();
      
      if (error) throw error;
      res.json(data);
    } else {
      const rooms = names.map(name => ({
        id: uuidv4(),
        name: name.trim()
      }));
      
      dataStore.rooms.push(...rooms);
      res.json(rooms);
    }
  } catch (error) {
    console.error('Ошибка массового создания аудиторий:', error);
    res.status(500).json({ error: error.message });
  }
});

// Экспортируем для Vercel
module.exports = app;