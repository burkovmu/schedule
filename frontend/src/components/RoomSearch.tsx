import React from 'react';
import { Room, TimeSlot, Lesson } from '../types';
import { findAvailableRooms } from '../utils/scheduleUtils';

interface RoomSearchProps {
  timeSlotId: string;
  duration: number;
  allLessons: Lesson[];
  allRooms: Room[];
  timeSlots: TimeSlot[];
  onRoomSelect: (roomId: string) => void;
  selectedRoomId?: string;
}

const RoomSearch: React.FC<RoomSearchProps> = ({
  timeSlotId,
  duration,
  allLessons,
  allRooms,
  timeSlots,
  onRoomSelect,
  selectedRoomId
}) => {
  // Находим свободные кабинеты для выбранного временного слота
  const availableRooms = findAvailableRooms(
    timeSlotId,
    duration,
    allLessons,
    allRooms,
    timeSlots
  );

  // Находим выбранный временной слот для отображения времени
  const selectedTimeSlot = timeSlots.find(slot => slot.id === timeSlotId);

  if (!timeSlotId || !selectedTimeSlot) {
    return null;
  }

  return (
    <div className="room-search">
      <div className="room-search-header">
        <h4>Свободные кабинеты</h4>
        <div className="time-info">
          {selectedTimeSlot.startTime} - {selectedTimeSlot.endTime}
          {duration > 5 && ` (${duration} мин)`}
        </div>
      </div>
      
      {availableRooms.length === 0 ? (
        <div className="no-rooms-message">
          <p>Нет свободных кабинетов в это время</p>
          <small>Попробуйте выбрать другое время или уменьшить длительность урока</small>
        </div>
      ) : (
        <div className="rooms-list">
          {availableRooms.map(room => (
            <button
              key={room.id}
              className={`room-item ${selectedRoomId === room.id ? 'selected' : ''}`}
              onClick={() => onRoomSelect(room.id)}
              type="button"
            >
              <div className="room-name">{room.name}</div>
              <div className="room-status">
                {selectedRoomId === room.id ? '✓ Выбран' : 'Свободен'}
              </div>
            </button>
          ))}
        </div>
      )}
      
      <div className="room-search-footer">
        <small>
          Показано {availableRooms.length} из {allRooms.length} кабинетов
        </small>
      </div>
    </div>
  );
};

export default RoomSearch;
