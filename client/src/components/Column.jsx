import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import TaskCard from './TaskCard';

export default function Column({ column, tasks, onAddTask }) {
  const { setNodeRef, isOver } = useDroppable({
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
    <section className="flex w-[20rem] shrink-0 flex-col rounded-[1.5rem] border border-[#e5e4dc] bg-[#f1f2eb] p-4">
      <div className="mb-4 flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-semibold text-[#4e6254]">{column.title}</h3>
          <p className="mt-1 text-xs text-[#9a988f]">Keep momentum moving</p>
        </div>
        <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-[#e1e9e1] px-2 text-xs font-semibold text-[#6c8d77]">
          {tasks.length}
        </span>
      </div>
      <div ref={setNodeRef} className={`flex min-h-28 flex-col gap-3 rounded-2xl p-1 transition-colors ${isOver ? 'bg-[#e0ebe2]' : ''}`}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => <TaskCard key={task._id} task={task} />)}
        </SortableContext>
        {tasks.length === 0 && <p className="rounded-xl border border-dashed border-[#c9d5cb] px-3 py-5 text-center text-xs text-[#9a988f]">Drop a task here</p>}
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
      {!showForm && (
        <button onClick={() => setShowForm(true)} className="mt-3 rounded-xl px-3 py-2 text-left text-xs font-medium text-[#7d8f81] hover:bg-[#e6ebe3]">
          + Add task
        </button>
      )}
    </section>
  );
}
