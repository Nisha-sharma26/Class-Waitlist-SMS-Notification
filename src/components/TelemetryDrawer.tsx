import type { TelemetryEvent } from '../types';
import { X, Activity, Terminal, Trash2 } from 'lucide-react';

interface TelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  telemetryEvents: TelemetryEvent[];
  onClearTelemetry: () => void;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({
  isOpen,
  onClose,
  telemetryEvents,
  onClearTelemetry
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="telemetry-drawer-title"
    >
      <div className="corp-card w-full max-w-lg h-full flex flex-col border-l border-slate-800 rounded-none animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-200" />
            <h2 id="telemetry-drawer-title" className="text-base font-semibold text-slate-100">
              Telemetry & Analytics Simulation Log
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1.5 rounded-md transition-colors"
            aria-label="Close Telemetry drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Console Log Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-slate-300" />
              <span>Console Event Log Stream ({telemetryEvents.length})</span>
            </span>
            {telemetryEvents.length > 0 && (
              <button
                onClick={onClearTelemetry}
                className="text-slate-400 hover:text-red-400 flex items-center gap-1 text-[11px]"
                aria-label="Clear telemetry logs"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {telemetryEvents.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-lg">
              No analytics pings logged yet. Perform primary user actions (add waitlist entry, trigger SMS, filter queue).
            </div>
          ) : (
            <div className="space-y-2">
              {telemetryEvents.map((event) => (
                <div key={event.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1">
                  <div className="text-[10px] text-slate-500 flex items-center justify-between">
                    <span>{event.id}</span>
                    <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <div className="text-emerald-400 font-semibold text-[11px]">
                    [Analytics] User interacted with {event.component}: {event.action}
                  </div>

                  {event.payload && (
                    <pre className="text-[10px] text-slate-300 bg-slate-900 p-2 rounded border border-slate-800/80 overflow-x-auto">
                      {JSON.stringify(event.payload, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
