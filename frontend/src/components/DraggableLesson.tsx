import React, { memo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Lesson } from '../types';

interface DraggableLessonProps {
  lesson: Lesson;
  startSlotIndex: number;
  span: number;
  groupIndex: number;
  onEdit?: (lesson: Lesson) => void;
  onDelete?: (lessonId: string) => void;
}

// Функция для вычисления времени урока
const getLessonTime = (startSlotIndex: number, duration: number): string => {
  // Используем временные слоты из контекста для точного вычисления времени
  // startSlotIndex соответствует индексу в массиве timeSlots
  const startHour = 9 + Math.floor(startSlotIndex / 12);
  const startMinute = (startSlotIndex % 12) * 5;
  
  const endMinute = startMinute + duration;
  const endHour = startHour + Math.floor(endMinute / 60);
  const finalEndMinute = endMinute % 60;
  
  const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
  const endTime = `${endHour.toString().padStart(2, '0')}:${finalEndMinute.toString().padStart(2, '0')}`;
  
  return `${startTime}-${endTime}`;
};

const DraggableLesson: React.FC<DraggableLessonProps> = ({ 
  lesson, 
  startSlotIndex, 
  span, 
  groupIndex,
  onEdit,
  onDelete
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: lesson.id,
  });

  const style: React.CSSProperties = {
    gridColumn: `${startSlotIndex + 2} / span ${span}`,
    gridRow: 1,
    backgroundColor: lesson.color || lesson.subject_color || '#667eea',
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: isDragging ? 1000 : 10,
    // Оптимизация для GPU ускорения
    willChange: isDragging ? 'transform' : 'auto',
    backfaceVisibility: 'hidden',
    perspective: 1000,
  };

  const lessonTime = getLessonTime(startSlotIndex, lesson.duration);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(lesson);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm('Вы уверены, что хотите удалить этот урок?')) {
      onDelete(lesson.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`lesson ${isDragging ? 'dragging' : ''}`}
      {...listeners}
      {...attributes}
    >
      <div className="lesson-aligned">
        <div className="lesson-time">{lessonTime}</div>
        <div className="lesson-data-row">{lesson.subject_name}</div>
        <div className="lesson-data-row">{lesson.teacher_name}</div>
        <div className="lesson-data-row">{lesson.assistant_name || '—'}</div>
        <div className="lesson-data-row">{lesson.room_name}</div>
      </div>
      
      {/* Кнопки действий */}
      <div className="lesson-actions">
        {onEdit && (
          <button 
            className="lesson-action-btn edit-btn"
            onClick={handleEdit}
            title="Редактировать урок"
          >
            ✏️
          </button>
        )}
        {onDelete && (
          <button 
            className="lesson-action-btn delete-btn"
            onClick={handleDelete}
            title="Удалить урок"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(DraggableLesson);
