import { TimeSlot, Lesson, Room } from '../types';

// Генерация временных слотов
export const generateTimeSlots = (): TimeSlot[] => {
  const timeSlots: TimeSlot[] = [];
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

// Расчет растягивания урока
export const getLessonSpan = (duration: number): number => {
  return Math.ceil(duration / 5); // 5 минут = 1 слот
};

// Типы конфликтов
export interface ConflictInfo {
  type: 'teacher' | 'room' | 'group';
  message: string;
  conflictingLesson: Lesson;
}

// Валидация конфликтов с детальной информацией
export const validateLesson = (lesson: Lesson, allLessons: Lesson[]): ConflictInfo[] => {
  const conflicts: ConflictInfo[] = [];
  
  allLessons.forEach(existingLesson => {
    // Исключаем сам урок из проверки
    if (existingLesson.id === lesson.id) return;
    
    // Проверка пересечения времени
    const existingStart = existingLesson.startSlotIndex || 0;
    const existingEnd = existingLesson.endSlotIndex || 0;
    const newStart = lesson.startSlotIndex || 0;
    const newEnd = lesson.endSlotIndex || 0;
    
    const timeOverlap = newStart < existingEnd && newEnd > existingStart;
    
    if (!timeOverlap) return;
    
    // Проверяем конфликты по аудиториям
    if (existingLesson.room_id === lesson.room_id) {
      conflicts.push({
        type: 'room',
        message: `Аудитория ${existingLesson.room_name} уже занята уроком "${existingLesson.subject_name}" в группе ${existingLesson.group_name}`,
        conflictingLesson: existingLesson
      });
    }
    
    // Проверяем конфликты по группам
    if (existingLesson.group_id === lesson.group_id) {
      conflicts.push({
        type: 'group',
        message: `Группа ${existingLesson.group_name} уже имеет урок "${existingLesson.subject_name}" в это время`,
        conflictingLesson: existingLesson
      });
    }
  });
  
  return conflicts;
};

// Простая валидация (для обратной совместимости)
export const validateLessonSimple = (lesson: Lesson, allLessons: Lesson[]): Lesson[] => {
  const conflicts = allLessons.filter(existingLesson => {
    // Исключаем сам урок из проверки
    if (existingLesson.id === lesson.id) return false;
    
    // Проверка пересечения времени
    const existingStart = existingLesson.startSlotIndex || 0;
    const existingEnd = existingLesson.endSlotIndex || 0;
    const newStart = lesson.startSlotIndex || 0;
    const newEnd = lesson.endSlotIndex || 0;
    
    const timeOverlap = newStart < existingEnd && newEnd > existingStart;
    
    if (!timeOverlap) return false;
    
    // Проверяем конфликты по аудиториям и группам
    const roomConflict = existingLesson.room_id === lesson.room_id;
    const groupConflict = existingLesson.group_id === lesson.group_id;
    
    return roomConflict || groupConflict;
  });
  
  return conflicts;
};

// Форматирование времени
export const formatTime = (timeSlot: string): string => {
  const [start, end] = timeSlot.split('-');
  return `${start}-${end}`;
};

// Получение цвета для урока
export const getLessonColor = (lesson: Lesson): string => {
  return lesson.color || lesson.subject_color || '#667eea';
};

// Проверка, является ли слот началом часа
export const isHourStart = (slotIndex: number): boolean => {
  return slotIndex % 12 === 0;
};

// Проверка, является ли слот началом получаса
export const isHalfHourStart = (slotIndex: number): boolean => {
  return slotIndex % 6 === 0;
};

// Поиск свободных кабинетов для выбранного временного слота
export const findAvailableRooms = (
  timeSlotId: string,
  duration: number,
  allLessons: Lesson[],
  allRooms: Room[],
  timeSlots: TimeSlot[]
): Room[] => {
  if (!timeSlotId || !allRooms.length || !timeSlots.length) {
    return [];
  }

  // Находим индекс выбранного временного слота
  const timeSlotIndex = timeSlots.findIndex(slot => slot.id === timeSlotId);
  if (timeSlotIndex === -1) {
    return [];
  }

  // Вычисляем диапазон слотов, которые займет урок
  const lessonSpan = getLessonSpan(duration);
  const startSlotIndex = timeSlotIndex;
  const endSlotIndex = timeSlotIndex + lessonSpan - 1;

  // Находим все уроки, которые пересекаются с выбранным временным диапазоном
  const conflictingLessons = allLessons.filter(lesson => {
    const lessonStart = lesson.startSlotIndex || 0;
    const lessonEnd = lesson.endSlotIndex || 0;
    
    // Проверяем пересечение времени
    return lessonStart < endSlotIndex && lessonEnd > startSlotIndex;
  });

  // Получаем ID занятых кабинетов
  const occupiedRoomIds = new Set(conflictingLessons.map(lesson => lesson.room_id));

  // Возвращаем только свободные кабинеты
  return allRooms.filter(room => !occupiedRoomIds.has(room.id));
};

// Проверка доступности кабинета в конкретном временном слоте
export const isRoomAvailable = (
  roomId: string,
  timeSlotId: string,
  duration: number,
  allLessons: Lesson[],
  timeSlots: TimeSlot[]
): boolean => {
  const availableRooms = findAvailableRooms(timeSlotId, duration, allLessons, [{ id: roomId, name: '' }], timeSlots);
  return availableRooms.length > 0;
};
