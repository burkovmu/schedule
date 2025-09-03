import { ScheduleData, Lesson, Group, TimeSlot, Teacher, Subject, Room, Assistant } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Загрузка всех данных расписания
export const fetchScheduleData = async (): Promise<ScheduleData> => {
  try {
    const [groups, lessons, subjects, teachers, assistants, rooms, timeSlots] = await Promise.all([
      fetch(`${API_BASE_URL}/groups`).then(res => res.json()),
      fetch(`${API_BASE_URL}/lessons`).then(res => res.json()),
      fetch(`${API_BASE_URL}/subjects`).then(res => res.json()),
      fetch(`${API_BASE_URL}/teachers`).then(res => res.json()),
      fetch(`${API_BASE_URL}/assistants`).then(res => res.json()),
      fetch(`${API_BASE_URL}/rooms`).then(res => res.json()),
      fetch(`${API_BASE_URL}/lessons/time-slots/all`).then(res => res.json())
    ]);

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
    console.error('Ошибка загрузки данных:', error);
    throw new Error('Не удалось загрузить данные расписания');
  }
};

// Создание урока
export const createLesson = async (lessonData: Partial<Lesson>): Promise<Lesson> => {
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
export const updateLesson = async (id: string, updates: Partial<Lesson>): Promise<void> => {
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
