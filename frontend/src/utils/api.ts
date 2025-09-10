import { ScheduleData, Lesson, Group, TimeSlot, Teacher, Subject, Room, Assistant } from '../types';

// Типы для API запросов
export interface CreateLessonData {
  group_id: string;
  time_slot: string;
  subject_id: string;
  teacher_id: string;
  assistant_id?: string;
  room_id: string;
  duration: number;
  color?: string;
  comment?: string;
  additional_teachers?: string[];
  additional_assistants?: string[];
}

export interface UpdateLessonData {
  group_id?: string;
  time_slot?: string;
  subject_id?: string;
  teacher_id?: string;
  assistant_id?: string;
  room_id?: string;
  duration?: number;
  color?: string;
  comment?: string;
  additional_teachers?: string[];
  additional_assistants?: string[];
}

// Автоматическое определение API URL для локальной разработки и продакшена
const getApiBaseUrl = () => {
  // Если задана переменная окружения, используем её
  if (process.env.REACT_APP_API_URL) {
    console.log('🔧 Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  
  // Проверяем, находимся ли мы в локальной разработке
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || 
                     hostname === '127.0.0.1' ||
                     hostname.includes('192.168.') ||
                     hostname.includes('10.0.');
  
  console.log('🌐 Hostname:', hostname);
  console.log('🔧 Is localhost:', isLocalhost);
  
  // Если локально - используем localhost:5000, иначе относительный путь
  const apiUrl = isLocalhost ? 'http://localhost:5000/api' : '/api';
  console.log('🔧 API URL:', apiUrl);
  
  return apiUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Загрузка всех данных расписания
export const fetchScheduleData = async (): Promise<ScheduleData> => {
  try {
    console.log('🔄 Загружаем данные с URL:', API_BASE_URL);
    console.log('🌐 Hostname:', window.location.hostname);
    console.log('🔧 Environment:', process.env.NODE_ENV);
    
    // Тестируем первый запрос отдельно
    console.log('🧪 Тестируем запрос к группам...');
    const groupsResponse = await fetch(`${API_BASE_URL}/groups`);
    console.log('📡 Groups response status:', groupsResponse.status);
    console.log('📡 Groups response ok:', groupsResponse.ok);
    
    if (!groupsResponse.ok) {
      const errorText = await groupsResponse.text();
      console.error('❌ Groups response error:', errorText);
      throw new Error(`HTTP ${groupsResponse.status}: ${groupsResponse.statusText}`);
    }
    
    const groups = await groupsResponse.json();
    console.log('✅ Groups loaded:', groups.length, 'items');
    
    const [lessons, subjects, teachers, assistants, rooms, timeSlots] = await Promise.all([
      fetch(`${API_BASE_URL}/lessons`).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      }),
      fetch(`${API_BASE_URL}/subjects`).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      }),
      fetch(`${API_BASE_URL}/teachers`).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      }),
      fetch(`${API_BASE_URL}/assistants`).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      }),
      fetch(`${API_BASE_URL}/rooms`).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      }),
      fetch(`${API_BASE_URL}/lessons/time-slots/all`).then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        return res.json();
      })
    ]);

    console.log('✅ Все данные успешно загружены');
    console.log('📊 Статистика:', {
      groups: groups.length,
      lessons: lessons.length,
      subjects: subjects.length,
      teachers: teachers.length,
      assistants: assistants.length,
      rooms: rooms.length,
      timeSlots: timeSlots.length
    });
    
    
    return {
      groups,
      lessons,
      subjects,
      teachers,
      assistants,
      rooms,
      timeSlots
    };
  } catch (error) {
    console.error('❌ Ошибка загрузки данных:', error);
    console.error('🔗 API URL:', API_BASE_URL);
    console.error('🌐 Hostname:', window.location.hostname);
    console.error('🔧 Environment:', process.env.NODE_ENV);
    throw new Error('Не удалось загрузить данные расписания');
  }
};

// Создание урока
export const createLesson = async (lessonData: CreateLessonData): Promise<Lesson> => {
  try {
    const response = await fetch(`${API_BASE_URL}/lessons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(lessonData),
    });

    if (!response.ok) {
      throw new Error('Ошибка создания урока');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка создания урока:', error);
    throw error;
  }
};

// Обновление урока
export const updateLesson = async (id: string, updates: UpdateLessonData): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Ошибка обновления урока');
    }
  } catch (error) {
    console.error('Ошибка обновления урока:', error);
    throw error;
  }
};

// Удаление урока
export const deleteLesson = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/lessons/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Ошибка удаления урока');
    }
  } catch (error) {
    console.error('Ошибка удаления урока:', error);
    throw error;
  }
};

// Создание группы
export const createGroup = async (groupData: Partial<Group>): Promise<Group> => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData),
    });

    if (!response.ok) {
      throw new Error('Ошибка создания группы');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка создания группы:', error);
    throw error;
  }
};

// Получение временных слотов
export const fetchTimeSlots = async (): Promise<TimeSlot[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/lessons/time-slots/all`);
    if (!response.ok) {
      throw new Error('Ошибка загрузки временных слотов');
    }
    return await response.json();
  } catch (error) {
    console.error('Ошибка загрузки временных слотов:', error);
    throw error;
  }
};

// Создание преподавателя
export const createTeacher = async (teacherData: Partial<Teacher>): Promise<Teacher> => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teacherData),
    });

    if (!response.ok) {
      throw new Error('Ошибка создания преподавателя');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка создания преподавателя:', error);
    throw error;
  }
};

// Обновление преподавателя
export const updateTeacher = async (id: string, updates: Partial<Teacher>): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Ошибка обновления преподавателя');
    }
  } catch (error) {
    console.error('Ошибка обновления преподавателя:', error);
    throw error;
  }
};

// Удаление преподавателя
export const deleteTeacher = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/teachers/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Ошибка удаления преподавателя');
    }
  } catch (error) {
    console.error('Ошибка удаления преподавателя:', error);
    throw error;
  }
};

// Создание предмета
export const createSubject = async (subjectData: Partial<Subject>): Promise<Subject> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subjectData),
    });

    if (!response.ok) {
      throw new Error('Ошибка создания предмета');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка создания предмета:', error);
    throw error;
  }
};

// Обновление предмета
export const updateSubject = async (id: string, updates: Partial<Subject>): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Ошибка обновления предмета');
    }
  } catch (error) {
    console.error('Ошибка обновления предмета:', error);
    throw error;
  }
};

// Удаление предмета
export const deleteSubject = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Ошибка удаления предмета');
    }
  } catch (error) {
    console.error('Ошибка удаления предмета:', error);
    throw error;
  }
};

// Создание аудитории
export const createRoom = async (roomData: Partial<Room>): Promise<Room> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roomData),
    });

    if (!response.ok) {
      throw new Error('Ошибка создания аудитории');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка создания аудитории:', error);
    throw error;
  }
};

// Удаление аудитории
export const deleteRoom = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Ошибка удаления аудитории');
    }
  } catch (error) {
    console.error('Ошибка удаления аудитории:', error);
    throw error;
  }
};

// Создание ассистента
export const createAssistant = async (assistantData: Partial<Assistant>): Promise<Assistant> => {
  try {
    const response = await fetch(`${API_BASE_URL}/assistants`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assistantData),
    });

    if (!response.ok) {
      throw new Error('Ошибка создания ассистента');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка создания ассистента:', error);
    throw error;
  }
};

// Обновление ассистента
export const updateAssistant = async (id: string, updates: Partial<Assistant>): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/assistants/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Ошибка обновления ассистента');
    }
  } catch (error) {
    console.error('Ошибка обновления ассистента:', error);
    throw error;
  }
};

// Удаление ассистента
export const deleteAssistant = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/assistants/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Ошибка удаления ассистента');
    }
  } catch (error) {
    console.error('Ошибка удаления ассистента:', error);
    throw error;
  }
};

// Обновление группы
export const updateGroup = async (id: string, groupData: Partial<Group>): Promise<Group> => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData),
    });

    if (!response.ok) {
      throw new Error('Ошибка обновления группы');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка обновления группы:', error);
    throw error;
  }
};

// Удаление группы
export const deleteGroup = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Ошибка удаления группы');
    }
  } catch (error) {
    console.error('Ошибка удаления группы:', error);
    throw error;
  }
};

// Массовое создание преподавателей
export const createTeachersBulk = async (names: string[]): Promise<Teacher[]> => {
  try {
    console.log('🔧 createTeachersBulk called with names:', names);
    console.log('🔧 API_BASE_URL:', API_BASE_URL);
    console.log('🔧 Request URL:', `${API_BASE_URL}/teachers/bulk`);
    
    const requestBody = { names };
    console.log('🔧 Request body:', requestBody);
    
    const response = await fetch(`${API_BASE_URL}/teachers/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔧 Response status:', response.status);
    console.log('🔧 Response ok:', response.ok);
    console.log('🔧 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response error text:', errorText);
      throw new Error(`Ошибка массового создания преподавателей: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ createTeachersBulk success:', result);
    return result;
  } catch (error) {
    console.error('❌ Ошибка массового создания преподавателей:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
};

// Массовое создание предметов
export const createSubjectsBulk = async (names: string[]): Promise<Subject[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/subjects/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ names }),
    });

    if (!response.ok) {
      throw new Error('Ошибка массового создания предметов');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка массового создания предметов:', error);
    throw error;
  }
};

// Массовое создание аудиторий
export const createRoomsBulk = async (names: string[]): Promise<Room[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rooms/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ names }),
    });

    if (!response.ok) {
      throw new Error('Ошибка массового создания аудиторий');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка массового создания аудиторий:', error);
    throw error;
  }
};

// Массовое создание групп
export const createGroupsBulk = async (names: string[]): Promise<Group[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/groups/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ names }),
    });

    if (!response.ok) {
      throw new Error('Ошибка массового создания групп');
    }

    return await response.json();
  } catch (error) {
    console.error('Ошибка массового создания групп:', error);
    throw error;
  }
};

// Массовое создание ассистентов
export const createAssistantsBulk = async (names: string[]): Promise<Assistant[]> => {
  try {
    console.log('🔧 createAssistantsBulk called with names:', names);
    console.log('🔧 API_BASE_URL:', API_BASE_URL);
    console.log('🔧 Request URL:', `${API_BASE_URL}/assistants/bulk`);
    
    const requestBody = { names };
    console.log('🔧 Request body:', requestBody);
    
    const response = await fetch(`${API_BASE_URL}/assistants/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('🔧 Response status:', response.status);
    console.log('🔧 Response ok:', response.ok);
    console.log('🔧 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Response error text:', errorText);
      throw new Error(`Ошибка массового создания ассистентов: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('✅ createAssistantsBulk success:', result);
    return result;
  } catch (error) {
    console.error('❌ Ошибка массового создания ассистентов:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    throw error;
  }
};