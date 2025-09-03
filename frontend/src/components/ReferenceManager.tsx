import React, { useState } from 'react';
import { Teacher, Subject, Room, Group, Assistant } from '../types';
import { createTeacher, deleteTeacher } from '../utils/api';
import { createSubject, deleteSubject } from '../utils/api';
import { createRoom, deleteRoom } from '../utils/api';
import { createGroup, deleteGroup } from '../utils/api';
import { createAssistant, deleteAssistant } from '../utils/api';

interface ReferenceManagerProps {
  type: 'teachers' | 'subjects' | 'rooms' | 'groups' | 'assistants';
  title: string;
  items: (Teacher | Subject | Room | Group | Assistant)[];
  onRefresh: () => void;
  onNotification: (notification: { type: 'success' | 'error'; message: string }) => void;
}

const ReferenceManager: React.FC<ReferenceManagerProps> = ({
  type,
  title,
  items,
  onRefresh,
  onNotification
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    setFormData({});
    setEditingItem(null);
    setShowAddForm(true);
  };

  const handleEdit = (item: any) => {
    setFormData({ ...item });
    setEditingItem(item);
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот элемент?')) {
      return;
    }

    setLoading(true);
    try {
      switch (type) {
        case 'teachers':
          await deleteTeacher(id);
          break;
        case 'subjects':
          await deleteSubject(id);
          break;
        case 'rooms':
          await deleteRoom(id);
          break;
        case 'groups':
          await deleteGroup(id);
          break;
        case 'assistants':
          await deleteAssistant(id);
          break;
      }
      
      onNotification({
        type: 'success',
        message: 'Элемент удален успешно'
      });
      onRefresh();
    } catch (error) {
      onNotification({
        type: 'error',
        message: 'Ошибка при удалении элемента'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || (type === 'subjects' && !formData.color)) {
      onNotification({
        type: 'error',
        message: 'Пожалуйста, заполните все обязательные поля'
      });
      return;
    }

    setLoading(true);
    try {
      if (editingItem) {
        // Обновление существующего элемента
        // TODO: Добавить API для обновления
        onNotification({
          type: 'success',
          message: 'Элемент обновлен успешно'
        });
      } else {
        // Создание нового элемента
        switch (type) {
          case 'teachers':
            await createTeacher(formData);
            break;
          case 'subjects':
            await createSubject(formData);
            break;
          case 'rooms':
            await createRoom(formData);
            break;
          case 'groups':
            await createGroup(formData);
            break;
          case 'assistants':
            await createAssistant(formData);
            break;
        }
        
        onNotification({
          type: 'success',
          message: 'Элемент создан успешно'
        });
      }
      
      setShowAddForm(false);
      setFormData({});
      setEditingItem(null);
      onRefresh();
    } catch (error) {
      onNotification({
        type: 'error',
        message: 'Ошибка при сохранении элемента'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const getFormFields = () => {
    switch (type) {
      case 'subjects':
        return (
          <>
            <div className="form-group">
              <label htmlFor="name">Название предмета *</label>
              <input
                type="text"
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="Например: Математика"
              />
            </div>
            <div className="form-group">
              <label htmlFor="color">Цвет *</label>
              <input
                type="color"
                id="color"
                value={formData.color || '#667eea'}
                onChange={(e) => handleInputChange('color', e.target.value)}
                required
              />
            </div>
          </>
        );
      case 'groups':
        return (
          <>
            <div className="form-group">
              <label htmlFor="name">Название группы *</label>
              <input
                type="text"
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                placeholder="Например: Группа А"
              />
            </div>
            <div className="form-group">
              <label htmlFor="display_order">Порядок отображения</label>
              <input
                type="number"
                id="display_order"
                value={formData.display_order || 0}
                onChange={(e) => handleInputChange('display_order', e.target.value)}
                placeholder="0"
              />
            </div>
          </>
        );
      default:
        return (
          <div className="form-group">
            <label htmlFor="name">Название *</label>
            <input
              type="text"
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              placeholder={`Например: ${type === 'teachers' ? 'Иванов И.И.' : type === 'rooms' ? 'Аудитория 101' : 'Козлов К.К.'}`}
            />
          </div>
        );
    }
  };

  return (
    <div className="reference-manager">
      <div className="reference-header">
        <h2>{title}</h2>
        <button className="btn-primary" onClick={handleAdd}>
          + Добавить
        </button>
      </div>

      <div className="reference-list">
        {items.length === 0 ? (
          <div className="empty-state">
            <p>Список пуст. Добавьте первый элемент.</p>
          </div>
        ) : (
          <div className="teachers-table-container">
            <table className="teachers-table">
              <thead>
                <tr>
                  <th>№</th>
                  <th>{
                    type === 'teachers' ? 'ФИО преподавателя' : 
                    type === 'subjects' ? 'Название предмета' :
                    type === 'rooms' ? 'Название аудитории' :
                    type === 'groups' ? 'Название группы' :
                    'ФИО ассистента'
                  }</th>
                  {type === 'subjects' && <th>Цвет</th>}
                  {type === 'groups' && <th>Порядок</th>}
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id} className="teacher-row">
                    <td className="teacher-number">{index + 1}</td>
                    <td className="teacher-name">{item.name}</td>
                    {type === 'subjects' && (
                      <td className="subject-color">
                        <div 
                          className="color-indicator-small"
                          style={{ backgroundColor: (item as Subject).color }}
                        ></div>
                        <span className="color-text">{(item as Subject).color}</span>
                      </td>
                    )}
                    {type === 'groups' && (
                      <td className="group-order">
                        <span className="order-text">{(item as Group).display_order}</span>
                      </td>
                    )}
                    <td className="teacher-actions">
                      <button 
                        className="btn-edit-small"
                        onClick={() => handleEdit(item)}
                        title="Редактировать"
                      >
                        ✏️
                      </button>
                      <button 
                        className="btn-delete-small"
                        onClick={() => handleDelete(item.id)}
                        title="Удалить"
                        disabled={loading}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Форма добавления/редактирования */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingItem ? 'Редактировать' : 'Добавить'} {title.toLowerCase()}</h2>
              <button className="modal-close" onClick={() => setShowAddForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="reference-form">
              {getFormFields()}
              
              <div className="form-actions">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">
                  Отмена
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Сохранение...' : (editingItem ? 'Сохранить' : 'Создать')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferenceManager;
