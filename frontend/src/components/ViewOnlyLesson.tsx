import React, { memo } from 'react';
import { Lesson } from '../types';

interface ViewOnlyLessonProps {
  lesson: Lesson;
  startSlotIndex: number;
  span: number;
  groupIndex: number;
}

// Функция для вычисления времени урока
const getLessonTime = (startSlotIndex: number, duration: number): string => {
  // Используем временные слоты из контекста для точного вычисления времени
  // startSlotIndex соответствует индексу в массиве timeSlots
  const startHour = startSlotIndex < 6 ? 8 : 8 + Math.floor((startSlotIndex - 6) / 12) + 1;
  const startMinute = startSlotIndex < 6 ? 30 + (startSlotIndex * 5) : ((startSlotIndex - 6) % 12) * 5;
  
  const endMinute = startMinute + duration;
  const endHour = startHour + Math.floor(endMinute / 60);
  const finalEndMinute = endMinute % 60;
  
  const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
  const endTime = `${endHour.toString().padStart(2, '0')}:${finalEndMinute.toString().padStart(2, '0')}`;
  
  return `${startTime}-${endTime}`;
};

const ViewOnlyLesson: React.FC<ViewOnlyLessonProps> = ({ 
  lesson, 
  startSlotIndex, 
  span, 
  groupIndex
}) => {
  
  const backgroundColor = lesson.color || lesson.teacher_color || lesson.subject_color || '#667eea';

  const style: React.CSSProperties = {
    gridColumn: `${startSlotIndex + 2} / span ${span}`,
    gridRow: 1,
    backgroundColor: backgroundColor,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  };

  const lessonTime = getLessonTime(startSlotIndex, lesson.duration);

  return (
    <div
      style={style}
      className="lesson"
    >
      {/* Центральная область - точно как в DraggableLesson */}
      <div 
        className="lesson-drag-area"
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          zIndex: 5
        }}
      >
        <div className="lesson-aligned">
          <div className="lesson-time">{lessonTime}</div>
          <div className="lesson-data-row">{lesson.subject_name}</div>
          <div className="lesson-data-row">
            <div className="staff-list">
              <span className="main-staff">
                {lesson.teacher_name}
              </span>
              {lesson.additional_teachers && lesson.additional_teachers.length > 0 && lesson.additional_teachers.map((teacher, index) => (
                <span key={teacher.id} className="additional-staff">
                  {index === 0 ? ', ' : ''}{teacher.name}
                </span>
              ))}
            </div>
          </div>
          <div className="lesson-data-row">
            <div className="staff-list">
              <span className="main-staff">
                {lesson.assistant_name || '—'}
              </span>
              {lesson.additional_assistants && lesson.additional_assistants.length > 0 && lesson.additional_assistants.map((assistant, index) => (
                <span key={assistant.id} className="additional-staff">
                  {index === 0 ? ', ' : ''}{assistant.name}
                </span>
              ))}
            </div>
          </div>
          <div className="lesson-data-row">{lesson.room_name}</div>
        </div>
      </div>
    </div>
  );
};

export default memo(ViewOnlyLesson);