import React from 'react';
import { ConflictInfo } from '../utils/scheduleUtils';

interface ConflictDialogProps {
  conflicts: ConflictInfo[];
  onClose: () => void;
  onContinue?: () => void;
}

const ConflictDialog: React.FC<ConflictDialogProps> = ({ conflicts, onClose, onContinue }) => {
  const getConflictIcon = (type: string) => {
    switch (type) {
      case 'teacher': return '👨‍🏫';
      case 'room': return '🏢';
      case 'group': return '👥';
      default: return '⚠️';
    }
  };

  const getConflictColor = (type: string) => {
    switch (type) {
      case 'teacher': return '#ff9500';
      case 'room': return '#ff3b30';
      case 'group': return '#007aff';
      default: return '#8e8e93';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content conflict-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚠️ Обнаружены конфликты в расписании</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="conflict-content">
          <p className="conflict-intro">
            Невозможно создать/переместить урок из-за следующих конфликтов:
          </p>
          
          <div className="conflicts-list">
            {conflicts.map((conflict, index) => (
              <div key={index} className="conflict-item">
                <div 
                  className="conflict-icon"
                  style={{ color: getConflictColor(conflict.type) }}
                >
                  {getConflictIcon(conflict.type)}
                </div>
                <div className="conflict-details">
                  <div className="conflict-type">
                    {conflict.type === 'teacher' && 'Конфликт преподавателя'}
                    {conflict.type === 'room' && 'Конфликт аудитории'}
                    {conflict.type === 'group' && 'Конфликт группы'}
                  </div>
                  <div className="conflict-message">
                    {conflict.message}
                  </div>
                  <div className="conflict-lesson-info">
                    <strong>Конфликтующий урок:</strong> {conflict.conflictingLesson.subject_name} 
                    в {conflict.conflictingLesson.room_name} 
                    с {conflict.conflictingLesson.teacher_name}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="conflict-suggestions">
            <h3>💡 Рекомендации:</h3>
            <ul>
              <li>Выберите другое время для урока</li>
              <li>Назначьте другого преподавателя</li>
              <li>Выберите другую аудиторию</li>
              <li>Переместите конфликтующий урок</li>
            </ul>
          </div>
        </div>
        
        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn-primary">
            Понятно
          </button>
          {onContinue && (
            <button type="button" onClick={onContinue} className="btn-secondary">
              Создать несмотря на конфликты
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConflictDialog;
