import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  CollisionDetection
} from '@dnd-kit/core';
import { ScheduleData, Lesson, Notification } from '../types';
import { getLessonSpan, validateLesson, ConflictInfo } from '../utils/scheduleUtils';
import { updateLesson, deleteLesson } from '../utils/api';
import { exportScheduleToPNG } from '../utils/exportUtils';
import DraggableLesson from './DraggableLesson';
import DroppableCell from './DroppableCell';
import LessonForm from './LessonForm';
import EditLessonForm from './EditLessonForm';
import ConflictDialog from './ConflictDialog';

interface ScheduleProps {
  scheduleData: ScheduleData | null;
  onNotification: (notification: Omit<Notification, 'id'>) => void;
  onRefresh: () => Promise<void>;
}

// Кастомный алгоритм определения коллизий для точного выделения ячеек
const createCustomCollisionDetection = (
  setHoveredTimeSlot: (timeSlotId: string | null) => void,
  setMousePosition: (position: { x: number; y: number } | null) => void
): CollisionDetection => (args) => {
  const { droppableContainers, pointerCoordinates } = args;
  
  if (!pointerCoordinates) {
    setHoveredTimeSlot(null);
    setMousePosition(null);
    return closestCenter(args);
  }

  // Обновляем позицию мыши
  setMousePosition({ x: pointerCoordinates.x, y: pointerCoordinates.y });

  // Находим все droppable элементы
  const droppableElements = Array.from(droppableContainers.values());
  
  // Фильтруем только ячейки расписания (исключаем уроки)
  const scheduleCells = droppableElements.filter(element => 
    element.id.toString().includes('-') && 
    !element.id.toString().startsWith('lesson-')
  );

  if (scheduleCells.length === 0) {
    setHoveredTimeSlot(null);
    return closestCenter(args);
  }

  // Находим ячейку, которая содержит координаты мыши
  const targetCell = scheduleCells.find(element => {
    const rect = element.rect.current;
    if (!rect) return false;
    
    return (
      pointerCoordinates.x >= rect.left &&
      pointerCoordinates.x <= rect.right &&
      pointerCoordinates.y >= rect.top &&
      pointerCoordinates.y <= rect.bottom
    );
  });

  if (targetCell) {
    // Извлекаем timeSlotId из ID ячейки
    const parts = targetCell.id.toString().split('-');
    if (parts.length >= 2) {
      const timeSlotId = parts[parts.length - 1];
      setHoveredTimeSlot(timeSlotId);
    }
    return [{ id: targetCell.id }];
  }

  // Если не нашли точное попадание, сбрасываем hoveredTimeSlot
  setHoveredTimeSlot(null);
  return closestCenter(args);
};

const Schedule: React.FC<ScheduleProps> = ({ scheduleData, onNotification, onRefresh }) => {
  const [draggedLesson, setDraggedLesson] = useState<Lesson | null>(null);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showConflictDialog, setShowConflictDialog] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [hoveredTimeSlot, setHoveredTimeSlot] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<string | undefined>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>();

  // Мемоизированные функции для обновления состояния
  const updateHoveredTimeSlot = useCallback((timeSlotId: string | null) => {
    setHoveredTimeSlot(timeSlotId);
  }, []);

  const updateMousePosition = useCallback((position: { x: number; y: number } | null) => {
    setMousePosition(position);
  }, []);

  // Создаем кастомный алгоритм коллизий с доступом к setHoveredTimeSlot и setMousePosition
  const customCollisionDetection = useMemo(() => 
    createCustomCollisionDetection(updateHoveredTimeSlot, updateMousePosition), 
    [updateHoveredTimeSlot, updateMousePosition]
  );

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

  // Функция для экспорта расписания в PNG
  const handleExportToPNG = useCallback(async () => {
    try {
      console.log('Начинаем экспорт...');
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `schedule_${timestamp}.png`;
      
      await exportScheduleToPNG('schedule-container', filename);
      
      onNotification({
        type: 'success',
        message: 'Расписание успешно экспортировано в PNG'
      });
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      onNotification({
        type: 'error',
        message: `Ошибка при экспорте расписания: ${errorMessage}`
      });
    }
  }, [onNotification]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Уменьшено для более быстрого отклика
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Использование временных слотов с сервера
  const timeSlots = useMemo(() => scheduleData?.timeSlots || [], [scheduleData]);

  // Функция для получения времени по ID временного слота
  const getTimeSlotTime = useCallback((timeSlotId: string) => {
    const timeSlot = timeSlots.find(slot => slot.id === timeSlotId);
    return timeSlot ? timeSlot.startTime : '';
  }, [timeSlots]);

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

  // Обработка начала перетаскивания - мемоизированная версия
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const lessonId = event.active.id as string;
    const lesson = lessonsWithPositions.find(l => l.id === lessonId);
    if (lesson) {
      setDraggedLesson(lesson);
      setHoveredTimeSlot(null); // Сбрасываем при начале перетаскивания
      setMousePosition(null); // Сбрасываем позицию мыши
    }
  }, [lessonsWithPositions]);

  // Обработка завершения перетаскивания - мемоизированная версия
  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedLesson(null);
    setHoveredTimeSlot(null); // Сбрасываем при завершении перетаскивания
    setMousePosition(null); // Сбрасываем позицию мыши
    
    if (!over || !scheduleData) return;
    
    const lessonId = active.id as string;
    const overId = over.id as string;
    
    // Парсим ID ячейки: "groupId-timeSlotId"
    // Нужно найти последний дефис, так как groupId может содержать дефисы
    const parts = overId.split('-');
    if (parts.length < 2) {
      console.error('Invalid drop target ID:', overId);
      return;
    }
    
    // timeSlotId всегда последняя часть
    const timeSlotId = parts[parts.length - 1];
    // groupId - все остальные части, соединенные дефисами
    const groupId = parts.slice(0, -1).join('-');
    
    // Проверяем, что timeSlotId является числом
    if (!/^\d+$/.test(timeSlotId)) {
      console.error('Invalid time slot ID (not a number):', timeSlotId);
      onNotification({
        type: 'error',
        message: 'Неверный временной слот'
      });
      return;
    }
    
    // Проверяем, что timeSlotId является валидным ID временного слота
    const validTimeSlot = timeSlots.find(slot => slot.id === timeSlotId);
    if (!validTimeSlot) {
      console.error('Invalid time slot ID:', timeSlotId);
      onNotification({
        type: 'error',
        message: 'Неверный временной слот'
      });
      return;
    }
    
    const lesson = lessonsWithPositions.find(l => l.id === lessonId);
    if (!lesson) return;
    
    // ИСПРАВЛЕНИЕ: Урок должен встать точно в то место, куда его перетащили
    // timeSlotId - это ID временного слота, в который перетащили урок
    const finalTimeSlotId = timeSlotId;
    
    // Оптимизированный поиск индекса временного слота
    const timeSlotIndex = timeSlots.findIndex(slot => slot.id === timeSlotId);
    const lessonSpan = getLessonSpan(lesson.duration);

    // Проверяем, что урок действительно перемещается
    if (lesson.group_id === groupId && lesson.time_slot === finalTimeSlotId) {
      onNotification({
        type: 'warning',
        message: 'Урок уже находится в этом месте'
      });
      return;
    }

    // Валидация конфликтов - создаем обновленный урок с новыми координатами
    const updatedLesson = {
      ...lesson,
      group_id: groupId,
      time_slot: finalTimeSlotId,
      startSlotIndex: timeSlotIndex,
      endSlotIndex: timeSlotIndex + lessonSpan - 1
    };

    const detectedConflicts = validateLesson(updatedLesson, lessonsWithPositions);
    if (detectedConflicts.length > 0) {
      setConflicts(detectedConflicts);
      setShowConflictDialog(true);
      return;
    }

    try {
      await updateLesson(lessonId, { group_id: groupId, time_slot: finalTimeSlotId });
      
      // Перезагружаем данные для обновления интерфейса
      await onRefresh();

      onNotification({
        type: 'success',
        message: 'Урок перемещен успешно'
      });
    } catch (error) {
      console.error('Ошибка при обновлении урока:', error);
      onNotification({
        type: 'error',
        message: 'Ошибка при обновлении урока'
      });
    }
  }, [scheduleData, timeSlots, lessonsWithPositions, onNotification, onRefresh]);

  // Обработка клика по ячейке для создания урока - мемоизированная версия
  const handleCellClick = useCallback((groupId: string, timeSlotId: string) => {
    setSelectedGroupId(groupId);
    setSelectedTimeSlot(timeSlotId);
    setShowLessonForm(true);
  }, []);

  // Обработка успешного создания урока - мемоизированная версия
  const handleLessonCreated = useCallback(async (newLesson: Lesson) => {
    await onRefresh();
    onNotification({
      type: 'success',
      message: 'Урок создан успешно'
    });
  }, [onRefresh, onNotification]);

  // Обработка ошибки создания урока
  const handleLessonError = (message: string) => {
    onNotification({
      type: 'error',
      message
    });
  };

  // Обработка редактирования урока
  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setShowEditForm(true);
  };

  // Обработка удаления урока
  const handleDeleteLesson = async (lessonId: string) => {
    try {
      await deleteLesson(lessonId);
      await onRefresh();
      onNotification({
        type: 'success',
        message: 'Урок удален успешно'
      });
    } catch (error) {
      console.error('Ошибка при удалении урока:', error);
      onNotification({
        type: 'error',
        message: 'Ошибка при удалении урока'
      });
    }
  };

  // Обработка изменения размера урока
  const handleResizeLesson = async (lessonId: string, newDuration: number) => {
    console.log('handleResizeLesson called:', lessonId, newDuration);
    try {
      const lesson = lessonsWithPositions.find(l => l.id === lessonId);
      if (!lesson) {
        console.log('Lesson not found:', lessonId);
        return;
      }

      console.log('Found lesson:', lesson);

      // Проверяем конфликты с новой длительностью
      const updatedLesson = {
        ...lesson,
        duration: newDuration,
        span: getLessonSpan(newDuration)
      };

      const conflicts = validateLesson(updatedLesson, lessonsWithPositions);
      if (conflicts.length > 0) {
        console.log('Conflicts found:', conflicts);
        onNotification({
          type: 'error',
          message: 'Нельзя изменить размер урока: есть конфликты'
        });
        return;
      }

      console.log('Updating lesson duration to:', newDuration);
      await updateLesson(lessonId, { duration: newDuration });
      await onRefresh();
      onNotification({
        type: 'success',
        message: `Длительность урока изменена на ${newDuration} минут`
      });
    } catch (error) {
      console.error('Ошибка при изменении размера урока:', error);
      onNotification({
        type: 'error',
        message: 'Ошибка при изменении размера урока'
      });
    }
  };

  // Обработка успешного редактирования урока
  const handleEditSuccess = async (message: string) => {
    await onRefresh();
    onNotification({
      type: 'success',
      message
    });
    setShowEditForm(false);
    setEditingLesson(null);
  };

  // Обработка ошибки редактирования урока
  const handleEditError = (message: string) => {
    onNotification({
      type: 'error',
      message
    });
  };

  // Обработка конфликтов при создании урока
  const handleLessonConflicts = (conflicts: ConflictInfo[]) => {
    setConflicts(conflicts);
    setShowConflictDialog(true);
  };

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

  // Удалены console.log для улучшения производительности

  return (
    <div className="schedule-page">
      {/* Отдельная полоса сверху - фиксированная ширина экрана */}
      <div className="schedule-info-bar">
        <div className="schedule-info-content">
          <div>
            <strong>Расписание</strong> • {scheduleData.groups.length} групп • {lessonsWithPositions.length} уроков
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
              className="btn-secondary"
              onClick={handleExportToPNG}
              style={{ padding: '8px 16px', fontSize: '14px', marginRight: '8px' }}
              title="Экспортировать расписание в PNG"
            >
              📷 PNG
            </button>
            <button 
              className="btn-primary"
              onClick={() => {
                setSelectedGroupId(undefined);
                setSelectedTimeSlot(undefined);
                setShowLessonForm(true);
              }}
              style={{ padding: '8px 16px', fontSize: '14px' }}
            >
              + Создать урок
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
        <DndContext
          sensors={sensors}
          collisionDetection={customCollisionDetection}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
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
                <DroppableCell
                  key={`${group.id}-${slot.id}`}
                  id={`${group.id}-${slot.id}`}
                  groupId={group.id}
                  timeSlotId={slot.id}
                  onClick={() => handleCellClick(group.id, slot.id)}
                />
              ))}
              
              {/* Уроки для этой группы */}
              {lessonsWithPositions
                .filter(lesson => lesson.group_id === group.id)
                .map(lesson => (
                  <DraggableLesson
                    key={lesson.id}
                    lesson={lesson}
                    startSlotIndex={lesson.startSlotIndex!}
                    span={lesson.span!}
                    groupIndex={groupIndex}
                    onEdit={handleEditLesson}
                    onDelete={handleDeleteLesson}
                    onResize={handleResizeLesson}
                  />
                ))}
            </div>
          ))}
        </div>

        <DragOverlay>
          {draggedLesson ? (
            <>
              <div className="lesson dragging">
                <div className="lesson-title">{draggedLesson.subject_name}</div>
                <div className="lesson-details">
                  {draggedLesson.teacher_name} • {draggedLesson.room_name}
                </div>
              </div>
              {/* Подсказка с временем выбранной ячейки - позиционируется по координатам мыши */}
              {hoveredTimeSlot && mousePosition && (
                <div 
                  className="drag-time-tooltip"
                  style={{
                    left: mousePosition.x,
                    top: mousePosition.y - 50,
                  }}
                >
                  {getTimeSlotTime(hoveredTimeSlot)}
                </div>
              )}
            </>
          ) : null}
        </DragOverlay>
        </DndContext>
      </div>

      {/* Модальное окно для создания урока */}
      {showLessonForm && scheduleData && (
        <LessonForm
          groups={scheduleData.groups}
          subjects={scheduleData.subjects}
          teachers={scheduleData.teachers}
          assistants={scheduleData.assistants}
          rooms={scheduleData.rooms}
          timeSlots={timeSlots}
          selectedGroupId={selectedGroupId}
          selectedTimeSlot={selectedTimeSlot}

          existingLessons={lessonsWithPositions}
          onClose={() => setShowLessonForm(false)}
          onSuccess={handleLessonCreated}
          onError={handleLessonError}
          onConflicts={handleLessonConflicts}
        />
      )}

      {/* Модальное окно для редактирования урока */}
      {showEditForm && editingLesson && scheduleData && (
        <EditLessonForm
          lesson={editingLesson}
          groups={scheduleData.groups}
          subjects={scheduleData.subjects}
          teachers={scheduleData.teachers}
          assistants={scheduleData.assistants}
          rooms={scheduleData.rooms}
          timeSlots={timeSlots}
          onClose={() => {
            setShowEditForm(false);
            setEditingLesson(null);
          }}
          onSuccess={handleEditSuccess}
          onError={handleEditError}
          onDelete={handleDeleteLesson}
        />
      )}

      {/* Диалог конфликтов */}
      {showConflictDialog && (
        <ConflictDialog
          conflicts={conflicts}
          onClose={() => setShowConflictDialog(false)}
        />
      )}
      </div>
    </div>
  );
};

export default Schedule;
