function alertTone(action) {
  if (action?.includes('deleted')) return 'border-[#e7b8a8] bg-[#fff4ef]';
  if (action === 'presence') return 'border-[#c9dcca] bg-[#f1f8f1]';
  return 'border-[#d6dfd7] bg-white';
}

export default function ActivityAlerts({ alerts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed right-5 top-5 z-50 flex w-[min(24rem,calc(100vw-2.5rem))] flex-col gap-3">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          role="status"
          className={`pointer-events-auto rounded-2xl border px-4 py-3 shadow-[0_12px_30px_rgba(48,47,43,0.12)] ${alertTone(alert.action)}`}
        >
          <div className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#6c8d77]" />
            <p className="flex-1 text-sm leading-5 text-[#4e4c45]">{alert.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(alert.id)}
              className="text-xs text-[#8b897f] hover:text-[#302f2b]"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
