export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  displayTime: string;
}

export interface Group {
  id: string;
  name: string;
  display_order: number;
  assistant_id?: string;
  assistant_name?: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface Teacher {
  id: string;
  name: string;
  color: string;
  display_order?: number;
}

export interface Assistant {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  name: string;
}

export interface Lesson {
  id: string;
  group_id: string;
  time_slot: string;
  subject_id: string;
  teacher_id: string;
  assistant_id?: string;
  room_id: string;
  duration: number;
  color?: string;
  comment?: string;
  // Дополнительные поля из API
  group_name?: string;
  subject_name?: string;
  subject_color?: string;
  teacher_name?: string;
  teacher_color?: string;
  assistant_name?: string;
  room_name?: string;
  // Множественные преподаватели и ассистенты
  additional_teachers?: Array<{
    id: string;
    name: string;
    color: string;
  }>;
  additional_assistants?: Array<{
    id: string;
    name: string;
  }>;
  // Вычисляемые поля
  startSlotIndex?: number;
  span?: number;
  endSlotIndex?: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export interface ScheduleData {
  groups: Group[];
  timeSlots: TimeSlot[];
  lessons: Lesson[];
  subjects: Subject[];
  teachers: Teacher[];
  assistants: Assistant[];
  rooms: Room[];
}
