import React, { useState } from 'react';
import { Lesson, Group, Subject, Teacher, Assistant, Room, TimeSlot } from '../types';
import { createLesson } from '../utils/api';
import { validateLesson, ConflictInfo, getLessonSpan } from '../utils/scheduleUtils';

interface LessonFormProps {
  groups: Group[];
  subjects: Subject[];
  teachers: Teacher[];
  assistants: Assistant[];
  rooms: Room[];
  timeSlots: TimeSlot[];
  selectedGroupId?: string;
  selectedTimeSlot?: string;
  existingLessons?: Lesson[];
  onClose: () => void;
  onSuccess: (lesson: Lesson) => void;
  onError: (message: string) => void;
  onConflicts?: (conflicts: ConflictInfo[]) => void;
}

const LessonForm: React.FC<LessonFormProps> = ({
  groups,
  subjects,
  teachers,
  assistants,
  rooms,
  timeSlots,
  selectedGroupId,
  selectedTimeSlot,
  existingLessons = [],
  onClose,
  onSuccess,
  onError,
  onConflicts
}) => {
  const [formData, setFormData] = useState({
    group_id: selectedGroupId || '',
    time_slot: selectedTimeSlot || '',
    subject_id: '',
    teacher_id: '',
    assistant_id: '',
    room_id: '',
    duration: 45,
    comment: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.group_id || !formData.time_slot || !formData.subject_id || 
        !formData.teacher_id || !formData.room_id) {
      onError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    // Валидация конфликтов перед созданием
    if (existingLessons.length > 0 && onConflicts) {
      const newLesson: Lesson = {
        id: 'temp',
        group_id: formData.group_id,
        time_slot: formData.time_slot,
        subject_id: formData.subject_id,
        teacher_id: formData.teacher_id,
        assistant_id: formData.assistant_id || undefined,
        room_id: formData.room_id,
        duration: formData.duration,
        color: subjects.find(s => s.id === formData.subject_id)?.color,
        comment: formData.comment,
        // Добавляем вычисляемые поля для валидации
        startSlotIndex: timeSlots.findIndex(slot => slot.id === formData.time_slot),
        span: getLessonSpan(formData.duration),
        endSlotIndex: timeSlots.findIndex(slot => slot.id === formData.time_slot) + getLessonSpan(formData.duration) - 1,
        // Добавляем имена для отображения
        group_name: groups.find(g => g.id === formData.group_id)?.name,
        subject_name: subjects.find(s => s.id === formData.subject_id)?.name,
        teacher_name: teachers.find(t => t.id === formData.teacher_id)?.name,
        assistant_name: assistants.find(a => a.id === formData.assistant_id)?.name,
        room_name: rooms.find(r => r.id === formData.room_id)?.name
      };

      const detectedConflicts = validateLesson(newLesson, existingLessons);
      if (detectedConflicts.length > 0) {
        onConflicts(detectedConflicts);
        return;
      }
    }

    setLoading(true);
    try {
      const newLesson = await createLesson({
        ...formData,
        color: subjects.find(s => s.id === formData.subject_id)?.color
      });
      
      onSuccess(newLesson);
      onClose();
    } catch (error) {
      onError('Ошибка при создании урока');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectedSubject = subjects.find(s => s.id === formData.subject_id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Создать урок</h2>
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
                {groups.map(group => (
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
                {subjects.map(subject => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="duration">Длительность (мин)</label>
              <select
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
              >
                <option value={30}>30 минут</option>
                <option value={45}>45 минут</option>
                <option value={60}>60 минут</option>
                <option value={90}>90 минут</option>
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
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="assistant">Ассистент</label>
              <select
                id="assistant"
                value={formData.assistant_id}
                onChange={(e) => handleInputChange('assistant_id', e.target.value)}
              >
                <option value="">Без ассистента</option>
                {assistants.map(assistant => (
                  <option key={assistant.id} value={assistant.id}>
                    {assistant.name}
                  </option>
                ))}
              </select>
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
                {rooms.map(room => (
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

          {selectedSubject && (
            <div className="form-row">
              <div className="color-preview">
                <span>Цвет урока:</span>
                <div 
                  className="color-sample"
                  style={{ backgroundColor: selectedSubject.color }}
                ></div>
                <span>{selectedSubject.color}</span>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Отмена
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Создание...' : 'Создать урок'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonForm;
