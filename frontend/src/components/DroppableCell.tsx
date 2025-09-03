import React, { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableCellProps {
  id: string;
  groupId: string;
  timeSlotId: string;
  onClick?: () => void;
}

const DroppableCell: React.FC<DroppableCellProps> = ({ id, groupId, timeSlotId, onClick }) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`schedule-cell ${isOver ? 'drop-over' : ''}`}
      data-group-id={groupId}
      data-time-slot={timeSlotId}
      onClick={handleClick}
      title="Кликните для создания урока"
    />
  );
};

export default memo(DroppableCell);
