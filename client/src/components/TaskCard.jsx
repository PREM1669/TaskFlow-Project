import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function TaskCard({ task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: { type: 'Task', task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab rounded-2xl border border-[#e5e4dc] bg-white p-4 text-sm text-[#4e4c45] shadow-[0_5px_14px_rgba(48,47,43,0.05)] transition-shadow hover:shadow-[0_8px_20px_rgba(48,47,43,0.1)] active:cursor-grabbing"
    >
      {task.title}
    </div>
  );
}

