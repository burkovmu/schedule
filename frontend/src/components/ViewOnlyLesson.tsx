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
  const startHour = 9 + Math.floor(startSlotIndex / 12);
  const startMinute = (startSlotIndex % 12) * 5;
  
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
  const style: React.CSSProperties = {
    gridColumn: `${startSlotIndex + 2} / span ${span}`,
    gridRow: 1,
    backgroundColor: lesson.color || lesson.subject_color || '#667eea',
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
          <div className="lesson-data-row">{lesson.teacher_name}</div>
          <div className="lesson-data-row">{lesson.assistant_name || '—'}</div>
          <div className="lesson-data-row">{lesson.room_name}</div>
        </div>
      </div>
    </div>
  );
};

export default memo(ViewOnlyLesson);