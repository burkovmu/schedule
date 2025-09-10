import React, { useState, useEffect } from 'react';
import { Lesson, Group, Subject, Teacher, Assistant, Room, TimeSlot } from '../types';
import { updateLesson, deleteLesson, UpdateLessonData } from '../utils/api';
import RoomSearch from './RoomSearch';

interface EditLessonFormProps {
  lesson: Lesson;
  groups: Group[];
  subjects: Subject[];
  teachers: Teacher[];
  assistants: Assistant[];
  rooms: Room[];
  timeSlots: TimeSlot[];
  existingLessons?: Lesson[];
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onDelete?: (lessonId: string) => void;
}

const EditLessonForm: React.FC<EditLessonFormProps> = ({
  lesson,
  groups,
  subjects,
  teachers,
  assistants,
  rooms,
  timeSlots,
  existingLessons = [],
  onClose,
  onSuccess,
  onError,
  onDelete
}) => {
  const [formData, setFormData] = useState({
    group_id: lesson.group_id,
    time_slot: lesson.time_slot,
    subject_id: lesson.subject_id,
    teacher_id: lesson.teacher_id,
    assistant_id: lesson.assistant_id || '',
    room_id: lesson.room_id,
    duration: lesson.duration,
    color: lesson.color || lesson.teacher_color || lesson.subject_color || '',
    comment: lesson.comment || '',
    additional_teachers: lesson.additional_teachers?.map(t => t.id) || [],
    additional_assistants: lesson.additional_assistants?.map(a => a.id) || []
  });

  const [loading, setLoading] = useState(false);
  const [showRoomSearch, setShowRoomSearch] = useState(false);

  // Показываем поиск кабинетов при изменении времени или длительности
  useEffect(() => {
    if (formData.time_slot && formData.duration) {
      setShowRoomSearch(true);
    } else {
      setShowRoomSearch(false);
    }
  }, [formData.time_slot, formData.duration]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.group_id || !formData.time_slot || !formData.subject_id || 
        !formData.teacher_id || !formData.room_id) {
      onError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    setLoading(true);
    try {
      const updateData: UpdateLessonData = formData;
      await updateLesson(lesson.id, updateData);
      
      onSuccess('Урок обновлен успешно');
      onClose();
    } catch (error) {
      onError('Ошибка при обновлении урока');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Вы уверены, что хотите удалить этот урок?')) {
      return;
    }

    setLoading(true);
    try {
      await deleteLesson(lesson.id);
      if (onDelete) {
        onDelete(lesson.id);
      }
      onSuccess('Урок удален успешно');
      onClose();
    } catch (error) {
      onError('Ошибка при удалении урока');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      
      // Если изменился преподаватель, обновляем цвет автоматически на цвет преподавателя
      if (field === 'teacher_id') {
        const selectedTeacher = teachers.find(t => t.id === value);
        if (selectedTeacher) {
          newData.color = selectedTeacher.color;
        }
      }
      // Если изменился предмет и нет выбранного преподавателя, используем цвет предмета
      else if (field === 'subject_id' && !newData.teacher_id) {
        const selectedSubject = subjects.find(s => s.id === value);
        if (selectedSubject) {
          newData.color = selectedSubject.color;
        }
      }
      // Если выбрано "Использовать ассистента группы" (пустое значение), подставляем ассистента группы
      else if (field === 'assistant_id' && value === '') {
        const selectedGroup = groups.find(g => g.id === newData.group_id);
        if (selectedGroup?.assistant_id) {
          newData.assistant_id = selectedGroup.assistant_id || '';
        }
      }
      
      return newData;
    });
  };

  // Обработчики для множественного выбора
  const handleAdditionalTeacherToggle = (teacherId: string) => {
    setFormData(prev => ({
      ...prev,
      additional_teachers: prev.additional_teachers.includes(teacherId)
        ? prev.additional_teachers.filter(id => id !== teacherId)
        : [...prev.additional_teachers, teacherId]
    }));
  };

  const handleAdditionalAssistantToggle = (assistantId: string) => {
    setFormData(prev => ({
      ...prev,
      additional_assistants: prev.additional_assistants.includes(assistantId)
        ? prev.additional_assistants.filter(id => id !== assistantId)
        : [...prev.additional_assistants, assistantId]
    }));
  };

  // Обработчик выбора кабинета из списка свободных
  const handleRoomSelect = (roomId: string) => {
    handleInputChange('room_id', roomId);
  };

  // const selectedSubject = subjects.find(s => s.id === formData.subject_id); // ESLint fix

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Редактировать урок</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="lesson-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="group">Группа *</label>
              <select
                id="group"
                value={formData.group_id}
                onChange={(e) => handleInputChange('group_id', e.target.value)}
                required
              >
                <option value="">Выберите группу</option>
                {groups.filter(group => group).map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="time_slot">Время *</label>
              <select
                id="time_slot"
                value={formData.time_slot}
                onChange={(e) => handleInputChange('time_slot', e.target.value)}
                required
              >
                <option value="">Выберите время</option>
                {timeSlots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {slot.displayTime}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="subject">Предмет *</label>
              <select
                id="subject"
                value={formData.subject_id}
                onChange={(e) => handleInputChange('subject_id', e.target.value)}
                required
              >
                <option value="">Выберите предмет</option>
                {subjects.filter(subject => subject).map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="duration">Длительность (мин) *</label>
              <select
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                required
              >
                <option value={10}>10 минут</option>
                <option value={15}>15 минут</option>
                <option value={20}>20 минут</option>
                <option value={25}>25 минут</option>
                <option value={30}>30 минут</option>
                <option value={35}>35 минут</option>
                <option value={40}>40 минут</option>
                <option value={45}>45 минут</option>
                <option value={50}>50 минут</option>
                <option value={55}>55 минут</option>
                <option value={60}>60 минут</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="teacher">Преподаватель *</label>
              <select
                id="teacher"
                value={formData.teacher_id}
                onChange={(e) => handleInputChange('teacher_id', e.target.value)}
                required
              >
                <option value="">Выберите преподавателя</option>
                {teachers.filter(teacher => teacher).map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="assistant">Ассистент</label>
              {(() => {
                const selectedGroup = groups.find(g => g.id === formData.group_id);
                const groupAssistant = selectedGroup?.assistant_name;
                return (
                  <>
                    {groupAssistant && (
                      <div className="group-assistant-info">
                        <small className="group-assistant-label">
                          Ассистент группы: <strong>{groupAssistant}</strong>
                        </small>
                      </div>
                    )}
                    <select
                      id="assistant"
                      value={formData.assistant_id}
                      onChange={(e) => handleInputChange('assistant_id', e.target.value)}
                    >
                      <option value="">{groupAssistant ? 'Использовать ассистента группы' : 'Без ассистента'}</option>
                      {assistants.filter(assistant => assistant).map(assistant => (
                        <option key={assistant.id} value={assistant.id}>
                          {assistant.name}
                        </option>
                      ))}
                    </select>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Дополнительные преподаватели */}
          <div className="form-row">
            <div className="form-group full-width">
              <label>Дополнительные преподаватели</label>
              <div className="checkbox-group">
                {teachers
                  .filter(teacher => teacher && teacher.id !== formData.teacher_id)
                  .map(teacher => (
                    <label key={teacher.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.additional_teachers.includes(teacher.id)}
                        onChange={() => handleAdditionalTeacherToggle(teacher.id)}
                      />
                      <span className="teacher-name" style={{ color: teacher?.color }}>
                        {teacher?.name || 'Неизвестный преподаватель'}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          </div>

          {/* Дополнительные ассистенты */}
          <div className="form-row">
            <div className="form-group full-width">
              <label>Дополнительные ассистенты</label>
              <div className="checkbox-group">
                {assistants
                  .filter(assistant => assistant && assistant.id !== formData.assistant_id)
                  .map(assistant => (
                    <label key={assistant.id} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={formData.additional_assistants.includes(assistant.id)}
                        onChange={() => handleAdditionalAssistantToggle(assistant.id)}
                      />
                      <span className="assistant-name">
                        {assistant?.name || 'Неизвестный ассистент'}
                      </span>
                    </label>
                  ))}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="room">Аудитория *</label>
              <select
                id="room"
                value={formData.room_id}
                onChange={(e) => handleInputChange('room_id', e.target.value)}
                required
              >
                <option value="">Выберите аудиторию</option>
                {rooms.filter(room => room).map(room => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="comment">Комментарий</label>
              <input
                type="text"
                id="comment"
                value={formData.comment}
                onChange={(e) => handleInputChange('comment', e.target.value)}
                placeholder="Дополнительная информация"
              />
            </div>
          </div>

          {/* Поиск свободных кабинетов */}
          {showRoomSearch && formData.time_slot && formData.duration && (
            <div className="form-row">
              <div className="form-group full-width">
                <RoomSearch
                  timeSlotId={formData.time_slot}
                  duration={formData.duration}
                  allLessons={existingLessons}
                  allRooms={rooms}
                  timeSlots={timeSlots}
                  onRoomSelect={handleRoomSelect}
                  selectedRoomId={formData.room_id}
                />
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="color">Цвет урока</label>
              <div className="color-input-group">
                <input
                  type="color"
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="color-picker"
                />
                <div className="color-preview">
                  <div 
                    className="color-sample"
                    style={{ backgroundColor: formData.color }}
                  ></div>
                  <span className="color-value">{formData.color}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Отмена
            </button>
            {onDelete && (
              <button type="button" onClick={handleDelete} className="btn-danger" disabled={loading}>
                {loading ? 'Удаление...' : 'Удалить'}
              </button>
            )}
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLessonForm;
