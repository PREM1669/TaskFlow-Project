import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id, data: { type: 'Task', task } });

  const save = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;
    await onUpdate?.(task._id, { title: title.trim() });
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.45 : 1 }}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-2xl border border-[#e5e4dc] bg-white p-4 text-sm text-[#4e4c45] shadow-[0_5px_14px_rgba(48,47,43,0.05)] active:cursor-grabbing"
    >
      {editing ? (
        <form onSubmit={save} onPointerDown={(event) => event.stopPropagation()}>
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="sage-input mb-2 w-full rounded-lg border px-2 py-1 text-sm"
          />
          <div className="flex gap-2 text-xs">
            <button className="font-semibold text-[#587764]">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="text-[#8b897f]">Cancel</button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <span>{task.title}</span>
          <span className="flex shrink-0 gap-1" onPointerDown={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setEditing(true)} className="text-xs text-[#6c8d77] hover:underline">Edit</button>
            <button
              type="button"
              onClick={() => window.confirm('Delete this task?') && onDelete?.(task._id)}
              className="text-xs text-[#a34f38] hover:underline"
            >
              Delete
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
