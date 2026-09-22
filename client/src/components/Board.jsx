import { useState } from 'react';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import useBoardStore from '../store/useBoardStore';
import Column from './Column';
import TaskCard from './TaskCard';

export default function Board({ boardId, columns, tasks }) {
  const moveTask = useBoardStore((state) => state.moveTask);
  const createTask = useBoardStore((state) => state.createTask);
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find((task) => task._id === active.id) || null);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const activeTask = tasks.find((task) => task._id === active.id);
    if (!activeTask) return;

    const overTask = tasks.find((task) => task._id === over.id);
    const targetColumnId = overTask?.columnId
      || columns.find((column) => column._id === over.id)?._id;
    if (!targetColumnId) return;

    const targetTasks = tasks
      .filter((task) => task.columnId === targetColumnId && task._id !== activeTask._id)
      .sort((a, b) => a.order - b.order);
    const overIndex = targetTasks.findIndex((task) => task._id === over.id);
    const order = overIndex === -1 ? targetTasks.length : overIndex;

    try {
      await moveTask(activeTask._id, targetColumnId, order);
    } catch {
      // The store restores the previous state when persistence fails.
    }
  };

  const handleAddTask = async (columnId, title) => {
    await createTask(boardId, columnId, title);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
    >
      <div className="flex gap-5 overflow-x-auto px-8 pb-8 pt-2 sm:px-12">
        {columns
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((column) => (
            <Column
              key={column._id}
              column={column}
              tasks={tasks
                .filter((task) => task.columnId === column._id)
                .sort((a, b) => a.order - b.order)}
              onAddTask={handleAddTask}
            />
          ))}
      </div>
      <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
    </DndContext>
  );
}
