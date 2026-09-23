import { useState } from 'react';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';

export default function Column({ column, tasks, onAddTask, onUpdateTask, onDeleteTask, onDeleteColumn }) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column._id,
    data: { type: 'Column', column },
  });
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const taskIds = tasks.map((task) => task._id);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    await onAddTask(column._id, title);
    setTitle('');
    setShowForm(false);
  };

  return (
    <section
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className="flex w-[20rem] shrink-0 flex-col rounded-[1.5rem] border border-[#e5e4dc] bg-[#f1f2eb] p-4 dark:border-slate-700 dark:bg-slate-900"
    >
      <div className="mb-4 flex items-center justify-between px-1">
        <div>
          <h3
            {...attributes}
            {...listeners}
            className="cursor-grab text-sm font-semibold text-[#4e6254] active:cursor-grabbing dark:text-slate-200"
          >
            {column.title}
          </h3>
          <p className="mt-1 text-xs text-[#9a988f] dark:text-slate-400">Keep momentum moving</p>
        </div>
        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#e1e9e1] px-2 text-xs font-semibold text-[#6c8d77] dark:bg-slate-800 dark:text-emerald-300">
          {tasks.length}
        </span>
      </div>
      <div className="flex min-h-28 flex-col gap-3 rounded-2xl p-1">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onUpdate={onUpdateTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && <p className="rounded-xl border border-dashed border-[#c9d5cb] px-3 py-5 text-center text-xs text-[#9a988f] dark:border-slate-700 dark:text-slate-400">Drop a task here</p>}
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Task title"
            className="sage-input min-w-0 flex-1 rounded-xl border px-3 py-2 text-xs"
          />
          <button className="sage-button rounded-xl px-3 text-xs font-semibold">Add</button>
        </form>
      )}
      <div className="mt-3 flex items-center justify-between">
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="rounded-xl px-3 py-2 text-left text-xs font-medium text-[#7d8f81] hover:bg-[#e6ebe3] dark:text-emerald-300 dark:hover:bg-slate-800">
            + Add task
          </button>
        )}
        <button
          type="button"
          onClick={() => window.confirm(`Delete "${column.title}" and its tasks?`) && onDeleteColumn(column._id)}
          className="rounded-xl px-2 py-2 text-xs text-[#a34f38] hover:bg-[#f8e4dc] dark:text-red-300 dark:hover:bg-red-950"
        >
          Delete column
        </button>
      </div>
    </section>
  );
}
