import React, { memo, useState } from 'react';
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
  const [showTeacherTooltip, setShowTeacherTooltip] = useState(false);
  const [showAssistantTooltip, setShowAssistantTooltip] = useState(false);
  
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
            {lesson.teacher_name}
            {lesson.additional_teachers && lesson.additional_teachers.length > 0 && (
              <span 
                className="additional-staff clickable"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTeacherTooltip(!showTeacherTooltip);
                }}
                onMouseEnter={() => setShowTeacherTooltip(true)}
                onMouseLeave={() => setShowTeacherTooltip(false)}
              >
                +{lesson.additional_teachers.length}
                {showTeacherTooltip && (
                  <div className="tooltip">
                    <div className="tooltip-content">
                      <strong>Дополнительные преподаватели:</strong>
                      {lesson.additional_teachers.map((teacher, index) => (
                        <div key={teacher.id} style={{ color: teacher.color }}>
                          {index + 1}. {teacher.name}
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
            {lesson.additional_assistants && lesson.additional_assistants.length > 0 && (
              <span 
                className="additional-staff clickable"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAssistantTooltip(!showAssistantTooltip);
                }}
                onMouseEnter={() => setShowAssistantTooltip(true)}
                onMouseLeave={() => setShowAssistantTooltip(false)}
              >
                +{lesson.additional_assistants.length}
                {showAssistantTooltip && (
                  <div className="tooltip">
                    <div className="tooltip-content">
                      <strong>Дополнительные ассистенты:</strong>
                      {lesson.additional_assistants.map((assistant, index) => (
                        <div key={assistant.id}>
                          {index + 1}. {assistant.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </span>
            )}
          </div>
          <div className="lesson-data-row">{lesson.room_name}</div>
        </div>
      </div>
    </div>
  );
};

export default memo(ViewOnlyLesson);