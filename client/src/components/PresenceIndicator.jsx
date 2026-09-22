export default function PresenceIndicator({ activeUsers }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {activeUsers.map((user) => (
          <div
            key={user.id}
            title={user.name}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#faf9f4] bg-[#6c8d77] text-xs font-semibold text-white"
          >
            {user.name?.[0]?.toUpperCase()}
          </div>
        ))}
      </div>
      {activeUsers.length > 0 && (
        <span className="text-xs text-[#8b897f]">
          {activeUsers.length} collaborator{activeUsers.length === 1 ? '' : 's'} online
        </span>
      )}
    </div>
  );
}
