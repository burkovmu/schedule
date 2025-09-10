import React, { memo, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Lesson } from '../types';
import { ConflictInfo } from '../utils/scheduleUtils';
import { useCopyPaste } from '../contexts/CopyPasteContext';

interface DraggableLessonProps {
  lesson: Lesson;
  startSlotIndex: number;
  span: number;
  groupIndex: number;
  hasConflicts?: boolean;
  conflictTypes?: string[];
  conflictDetails?: ConflictInfo[];
  onEdit?: (lesson: Lesson) => void;
  onDelete?: (lessonId: string) => void;
  onResize?: (lessonId: string, newDuration: number) => void;
  onShowConflicts?: (conflicts: ConflictInfo[]) => void;
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


const DraggableLesson: React.FC<DraggableLessonProps> = ({ 
  lesson, 
  startSlotIndex, 
  span, 
  groupIndex,
  hasConflicts = false,
  conflictTypes = [],
  conflictDetails = [],
  onEdit,
  onDelete,
  onResize,
  onShowConflicts
}) => {
  const [showTeacherTooltip, setShowTeacherTooltip] = useState(false);
  const [showAssistantTooltip, setShowAssistantTooltip] = useState(false);
  const { copyLesson } = useCopyPaste();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: lesson.id,
  });



  const backgroundColor = lesson.color || lesson.teacher_color || lesson.subject_color || '#667eea';

  // Определяем стили для конфликтов
  const getConflictStyles = () => {
    if (!hasConflicts) return {};
    
    const conflictStyles: React.CSSProperties = {};
    
    // Добавляем красную рамку для конфликтов
    conflictStyles.border = '2px solid #ff3b30';
    conflictStyles.boxShadow = '0 0 8px rgba(255, 59, 48, 0.5)';
    
    // Если есть конфликт учителя, добавляем оранжевый оттенок
    if (conflictTypes.includes('teacher')) {
      conflictStyles.borderLeftColor = '#ff9500';
      conflictStyles.borderLeftWidth = '4px';
    }
    
    // Если есть конфликт кабинета, добавляем красный оттенок
    if (conflictTypes.includes('room')) {
      conflictStyles.borderTopColor = '#ff3b30';
      conflictStyles.borderTopWidth = '4px';
    }
    
    // Если есть конфликт группы, добавляем синий оттенок
    if (conflictTypes.includes('group')) {
      conflictStyles.borderRightColor = '#007aff';
      conflictStyles.borderRightWidth = '4px';
    }
    
    return conflictStyles;
  };

  const style: React.CSSProperties = {
    gridColumn: `${startSlotIndex + 2} / span ${span}`,
    gridRow: 1,
    backgroundColor: backgroundColor,
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
    ...getConflictStyles(),
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

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    copyLesson(lesson);
  };


  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`lesson ${isDragging ? 'dragging' : ''}`}
      {...attributes}
    >
      {/* Центральная область для drag-and-drop */}
      <div 
        className="lesson-drag-area"
        {...listeners}
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
          <div className="lesson-time">
            {lessonTime}
            {hasConflicts && (
              <span 
                className="conflict-indicator clickable" 
                title="Нажмите для подробной информации о конфликтах"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onShowConflicts && conflictDetails.length > 0) {
                    onShowConflicts(conflictDetails);
                  }
                }}
              >
                ⚠️
              </span>
            )}
          </div>
          <div className="lesson-data-row">{lesson.subject_name || 'Неизвестный предмет'}</div>
          <div className="lesson-data-row">
            {lesson.teacher_name || 'Неизвестный преподаватель'}
            {lesson.additional_teachers && lesson.additional_teachers.length > 0 && lesson.additional_teachers.filter(t => t).length > 0 && (
              <span 
                className="additional-staff clickable"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTeacherTooltip(!showTeacherTooltip);
                }}
                onMouseEnter={() => setShowTeacherTooltip(true)}
                onMouseLeave={() => setShowTeacherTooltip(false)}
              >
                +{lesson.additional_teachers.filter(t => t).length}
                {showTeacherTooltip && (
                  <div className="tooltip">
                    <div className="tooltip-content">
                      <strong>Дополнительные преподаватели:</strong>
                      {lesson.additional_teachers.filter(t => t).map((teacher, index) => (
                        <div key={teacher.id} style={{ color: teacher.color }}>
                          {index + 1}. {teacher?.name || 'Неизвестный преподаватель'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </span>
            )}
          </div>
          <div className="lesson-data-row">
            {lesson.assistant_name || '—'}
            {lesson.additional_assistants && lesson.additional_assistants.length > 0 && lesson.additional_assistants.filter(a => a).length > 0 && (
              <span 
                className="additional-staff clickable"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAssistantTooltip(!showAssistantTooltip);
                }}
                onMouseEnter={() => setShowAssistantTooltip(true)}
                onMouseLeave={() => setShowAssistantTooltip(false)}
              >
                +{lesson.additional_assistants.filter(a => a).length}
                {showAssistantTooltip && (
                  <div className="tooltip">
                    <div className="tooltip-content">
                      <strong>Дополнительные ассистенты:</strong>
                      {lesson.additional_assistants.filter(a => a).map((assistant, index) => (
                        <div key={assistant.id}>
                          {index + 1}. {assistant?.name || 'Неизвестный ассистент'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </span>
            )}
          </div>
          <div className="lesson-data-row">{lesson.room_name || 'Неизвестная аудитория'}</div>
        </div>
        
        {/* Кнопки действий */}
        <div className="lesson-actions">
          <button 
            className="lesson-action-btn copy-btn"
            onClick={handleCopy}
            title="Копировать урок"
          >
            📋
          </button>
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

        {/* Кнопки изменения размера - слева и справа */}
        {onResize && (
          <>
            {/* Кнопка уменьшения - слева */}
            <button 
              className="lesson-resize-btn resize-left"
              onClick={() => {
                console.log('Resize -5 clicked');
                const validDurations = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
                const currentIndex = validDurations.indexOf(lesson.duration);
                if (currentIndex > 0) {
                  onResize(lesson.id, validDurations[currentIndex - 1]);
                }
              }}
              title="Уменьшить длительность"
              disabled={lesson.duration <= 10}
            >
              -
            </button>
            {/* Кнопка увеличения - справа */}
            <button 
              className="lesson-resize-btn resize-right"
              onClick={() => {
                console.log('Resize +5 clicked');
                const validDurations = [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60];
                const currentIndex = validDurations.indexOf(lesson.duration);
                if (currentIndex < validDurations.length - 1) {
                  onResize(lesson.id, validDurations[currentIndex + 1]);
                }
              }}
              title="Увеличить длительность"
              disabled={lesson.duration >= 60}
            >
              +
            </button>
          </>
        )}
      </div>


    </div>
  );
};

export default memo(DraggableLesson);
