import React, { useState } from 'react';
import { 
  createTeachersBulk, 
  createSubjectsBulk, 
  createRoomsBulk, 
  createGroupsBulk, 
  createAssistantsBulk 
} from '../utils/api';

interface BulkUploadDialogProps {
  type: 'teachers' | 'subjects' | 'rooms' | 'groups' | 'assistants';
  title: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
  onNotification: (notification: { type: 'success' | 'error'; message: string }) => void;
}

const BulkUploadDialog: React.FC<BulkUploadDialogProps> = ({
  type,
  title,
  isOpen,
  onClose,
  onSuccess,
  onNotification
}) => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      onNotification({
        type: 'error',
        message: 'Пожалуйста, введите список данных'
      });
      return;
    }

    // Разбиваем текст на строки и фильтруем пустые
    const names = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (names.length === 0) {
      onNotification({
        type: 'error',
        message: 'Список не содержит валидных данных'
      });
      return;
    }

    setLoading(true);
    try {
      let result;
      switch (type) {
        case 'teachers':
          result = await createTeachersBulk(names);
          break;
        case 'subjects':
          result = await createSubjectsBulk(names);
          break;
        case 'rooms':
          result = await createRoomsBulk(names);
          break;
        case 'groups':
          result = await createGroupsBulk(names);
          break;
        case 'assistants':
          result = await createAssistantsBulk(names);
          break;
        default:
          throw new Error('Неизвестный тип данных');
      }

      onNotification({
        type: 'success',
        message: `Успешно добавлено ${result.length} элементов`
      });
      
      onSuccess(result.length);
      setText('');
      onClose();
    } catch (error) {
      onNotification({
        type: 'error',
        message: 'Ошибка при добавлении данных'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (type) {
      case 'teachers':
        return 'Иванов И.И.\nПетров П.П.\nСидоров С.С.';
      case 'subjects':
        return 'Математика\nФизика\nХимия\nБиология';
      case 'rooms':
        return 'Аудитория 101\nАудитория 102\nЛаборатория 201';
      case 'groups':
        return 'Группа А\nГруппа Б\nГруппа В';
      case 'assistants':
        return 'Козлов К.К.\nМорозов М.М.\nНовиков Н.Н.';
      default:
        return 'Введите данные, каждое с новой строки';
    }
  };

  const getDescription = () => {
    switch (type) {
      case 'teachers':
        return 'Введите ФИО преподавателей, каждое с новой строки. Цвет будет установлен по умолчанию.';
      case 'subjects':
        return 'Введите названия предметов, каждое с новой строки. Цвет будет установлен по умолчанию.';
      case 'rooms':
        return 'Введите названия аудиторий, каждое с новой строки.';
      case 'groups':
        return 'Введите названия групп, каждое с новой строки. Порядок отображения будет установлен автоматически.';
      case 'assistants':
        return 'Введите ФИО ассистентов, каждое с новой строки.';
      default:
        return 'Введите данные, каждое с новой строки.';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Массовое добавление {title.toLowerCase()}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="bulk-upload-content">
          <div className="bulk-upload-description">
            <div className="description-icon">💡</div>
            <div className="description-text">
              {getDescription()}
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="bulk-upload-form">
            <div className="form-group">
              <label htmlFor="bulk-text">
                Список данных *
              </label>
              <textarea
                id="bulk-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={getPlaceholder()}
                rows={8}
                className="bulk-textarea"
                disabled={loading}
                required
              />
              <div className="form-hint">
                <span className="hint-icon">ℹ️</span>
                Каждая строка = один элемент. Пустые строки будут проигнорированы.
              </div>
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                onClick={onClose} 
                className="btn-secondary"
                disabled={loading}
              >
                Отмена
              </button>
              <button 
                type="submit" 
                disabled={loading || !text.trim()} 
                className="btn-primary"
              >
                {loading ? 'Добавление...' : `Добавить (${text.split('\n').filter(line => line.trim()).length})`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BulkUploadDialog;
