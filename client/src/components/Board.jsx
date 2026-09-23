import { useState } from 'react';
import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import useBoardStore from '../store/useBoardStore';
import Column from './Column';
import TaskCard from './TaskCard';

export default function Board({ boardId, columns, tasks }) {
  const moveTask = useBoardStore((state) => state.moveTask);
  const createTask = useBoardStore((state) => state.createTask);
  const updateTask = useBoardStore((state) => state.updateTask);
  const deleteTask = useBoardStore((state) => state.deleteTask);
  const createColumn = useBoardStore((state) => state.createColumn);
  const deleteColumn = useBoardStore((state) => state.deleteColumn);
  const moveColumn = useBoardStore((state) => state.moveColumn);
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const handleDragStart = ({ active }) => {
    const activeColumn = columns.find((column) => column._id === active.id);
    setActiveTask(activeColumn ? null : tasks.find((task) => task._id === active.id) || null);
  };

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null);
    if (!over) return;

    const activeColumn = columns.find((column) => column._id === active.id);
    if (activeColumn) {
      const orderedColumns = columns.slice().sort((a, b) => a.order - b.order);
      const overColumn = columns.find((column) => column._id === over.id);
      if (!overColumn || overColumn._id === activeColumn._id) return;

      const nextColumns = arrayMove(
        orderedColumns,
        orderedColumns.findIndex((column) => column._id === activeColumn._id),
        orderedColumns.findIndex((column) => column._id === overColumn._id),
      );
      const nextOrder = nextColumns.findIndex((column) => column._id === activeColumn._id);
      try {
        await moveColumn(activeColumn._id, nextOrder, boardId);
      } catch {
        // The store restores the previous order when persistence fails.
      }
      return;
    }

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
      await moveTask(activeTask._id, targetColumnId, order, boardId);
    } catch {
      // The store restores the previous state when persistence fails.
    }
  };

  const handleAddTask = async (columnId, title) => {
    await createTask(boardId, columnId, title);
  };

  const handleCreateColumn = async () => {
    const title = window.prompt('Column title');
    if (title?.trim()) await createColumn(boardId, title);
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
        <SortableContext
          items={columns.slice().sort((a, b) => a.order - b.order).map((column) => column._id)}
          strategy={horizontalListSortingStrategy}
        >
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
                onUpdateTask={(taskId, changes) => updateTask(taskId, changes, boardId)}
                onDeleteTask={(taskId) => deleteTask(taskId, boardId)}
                onDeleteColumn={(columnId) => deleteColumn(columnId, boardId)}
              />
            ))}
        </SortableContext>
        <button onClick={handleCreateColumn} className="h-fit w-[20rem] shrink-0 rounded-[1.5rem] border border-dashed border-[#c9d5cb] p-8 text-sm font-semibold text-[#6c8d77] hover:bg-[#eef3ed]">
          + Add column
        </button>
      </div>
      <DragOverlay>{activeTask ? <TaskCard task={activeTask} /> : null}</DragOverlay>
    </DndContext>
  );
}
