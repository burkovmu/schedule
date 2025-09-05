import React, { useState, useMemo, useCallback } from 'react';
import { ScheduleData } from '../types';
import { getLessonSpan } from '../utils/scheduleUtils';
import ViewOnlyLesson from './ViewOnlyLesson';

interface ViewOnlyScheduleProps {
  scheduleData: ScheduleData | null;
  onLogin: () => void;
}

const ViewOnlySchedule: React.FC<ViewOnlyScheduleProps> = ({ scheduleData, onLogin }) => {
  // Инициализация масштаба из localStorage или значение по умолчанию
  const [zoomLevel, setZoomLevel] = useState(() => {
    const savedZoom = localStorage.getItem('schedule-zoom-level');
    return savedZoom ? parseFloat(savedZoom) : 1;
  });

  // Функции для управления масштабом
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => {
      const newZoom = Math.min(prev + 0.1, 2);
      localStorage.setItem('schedule-zoom-level', newZoom.toString());
      return newZoom;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => {
      const newZoom = Math.max(prev - 0.1, 0.5);
      localStorage.setItem('schedule-zoom-level', newZoom.toString());
      return newZoom;
    });
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1);
    localStorage.setItem('schedule-zoom-level', '1');
  }, []);


  // Использование временных слотов с сервера
  const timeSlots = useMemo(() => scheduleData?.timeSlots || [], [scheduleData]);

  // Предварительный расчет позиций уроков - оптимизированная версия
  const lessonsWithPositions = useMemo(() => {
    if (!scheduleData) return [];
    
    // Создаем Map для быстрого поиска временных слотов
    const timeSlotMap = new Map(timeSlots.map((slot, index) => [slot.id, index]));
    
    return scheduleData.lessons.map(lesson => {
      const startSlotIndex = timeSlotMap.get(lesson.time_slot);
      if (startSlotIndex === undefined) {
        return null;
      }
      
      const span = getLessonSpan(lesson.duration);
      
      return {
        ...lesson,
        startSlotIndex,
        span,
        endSlotIndex: startSlotIndex + span - 1
      };
    }).filter((lesson): lesson is NonNullable<typeof lesson> => lesson !== null);
  }, [scheduleData, timeSlots]);

  if (!scheduleData) {
    return (
      <div className="schedule-container">
        <div className="empty-state">
          <h3>Нет данных</h3>
          <p>Не удалось загрузить данные расписания</p>
        </div>
      </div>
    );
  }

  return (
    <div className="schedule-page">
      {/* Отдельная полоса сверху - фиксированная ширина экрана */}
      <div className="schedule-info-bar">
        <div className="schedule-info-content">
          <div>
            <strong>Расписание</strong>
            <span className="view-mode-indicator"> (Режим просмотра)</span>
          </div>
          <div className="schedule-actions">
            <span className="scroll-indicator">
              ← Прокрутите влево/вправо для просмотра всего расписания →
            </span>
            <div className="zoom-controls">
              <button 
                className="zoom-btn"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                title="Уменьшить масштаб"
              >
                −
              </button>
              <span className="zoom-level">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button 
                className="zoom-btn"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2}
                title="Увеличить масштаб"
              >
                +
              </button>
              <button 
                className="zoom-reset-btn"
                onClick={handleZoomReset}
                title="Сбросить масштаб"
              >
                ⌂
              </button>
            </div>
            <button 
              className="btn-primary login-btn"
              onClick={onLogin}
              title="Войти в систему"
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              Вход
            </button>
          </div>
        </div>
      </div>

      {/* Прокручиваемая таблица расписания */}
      <div className="schedule-wrapper">
        <div 
          id="schedule-container"
          className="schedule-container"
          style={{ 
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            height: `${100 / zoomLevel}%`
          }}
        >
          {/* Заголовок времени - 30-минутные интервалы */}
          <div className="schedule-header">
            <div className="group-header">Время</div>
            {Array.from({ length: Math.ceil(timeSlots.length / 6) }, (_, i) => {
              const startIndex = i * 6;
              const endIndex = Math.min(startIndex + 5, timeSlots.length - 1);
              const startSlot = timeSlots[startIndex];
              const endSlot = timeSlots[endIndex];
              
              return (
                <div 
                  key={`half-hour-${i}`} 
                  className="time-header first-row"
                  style={{ gridColumn: `span 6` }}
                >
                  <span>
                    {startSlot.startTime}-{endSlot.endTime}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Вторая строка заголовка */}
          <div className="schedule-header">
            <div className="group-header-empty"></div>
            {timeSlots.map((slot, index) => {
              const isHourStart = index % 12 === 0;
              const minute = parseInt(slot.startTime.split(':')[1]);
              
              return (
                <div 
                  key={`second-${slot.id}`} 
                  className={`time-header second-row ${isHourStart ? 'hour-marker' : ''}`}
                >
                  {isHourStart ? slot.startTime.split(':')[0] : minute.toString()}
                </div>
              );
            })}
          </div>

          {/* Строки расписания */}
          <div className="schedule-rows">
            {scheduleData.groups.map((group, groupIndex) => (
              <div key={group.id} className="schedule-row">
                <div className="group-header-with-labels">
                  <div className="group-name">{group.name}</div>
                  <div className="lesson-labels-in-group">
                    <div className="lesson-label">Урок</div>
                    <div className="lesson-label">Учитель</div>
                    <div className="lesson-label">Ассистент</div>
                    <div className="lesson-label">Кабинет</div>
                  </div>
                </div>
                {timeSlots.map((slot) => (
                  <div
                    key={`${group.id}-${slot.id}`}
                    className="schedule-cell view-only"
                  />
                ))}
                
                {/* Уроки для этой группы - только для просмотра */}
                {lessonsWithPositions
                  .filter(lesson => lesson.group_id === group.id)
                  .map(lesson => (
                    <ViewOnlyLesson
                      key={lesson.id}
                      lesson={lesson}
                      startSlotIndex={lesson.startSlotIndex!}
                      span={lesson.span!}
                      groupIndex={groupIndex}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOnlySchedule;
