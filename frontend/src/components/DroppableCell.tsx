import React, { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableCellProps {
  id: string;
  groupId: string;
  timeSlotId: string;
  onClick?: () => void;
  onPaste?: (groupId: string, timeSlotId: string) => void;
  hasCopiedLesson?: boolean;
}

const DroppableCell: React.FC<DroppableCellProps> = ({ 
  id, 
  groupId, 
  timeSlotId, 
  onClick, 
  onPaste, 
  hasCopiedLesson = false 
}) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hasCopiedLesson && onPaste) {
      onPaste(groupId, timeSlotId);
    }
  };

  return (
    <div
      ref={setNodeRef}
      className={`schedule-cell ${isOver ? 'drop-over' : ''} ${hasCopiedLesson ? 'paste-available' : ''}`}
      data-group-id={groupId}
      data-time-slot={timeSlotId}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      title={hasCopiedLesson ? "Кликните для создания урока, правый клик для вставки" : "Кликните для создания урока"}
    />
  );
};

export default memo(DroppableCell);
