import { useState } from 'react';
import type { TwilioSMSLog } from '../types';
import { X, MessageSquare, Smartphone, CheckCheck, AlertOctagon, Terminal, Trash2 } from 'lucide-react';

interface TwilioLogsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  logs: TwilioSMSLog[];
  onClearLogs: () => void;
}

export const TwilioLogsDrawer: React.FC<TwilioLogsDrawerProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs
}) => {
  const [activeTab, setActiveTab] = useState<'LOGS' | 'PHONE'>('LOGS');
  const [selectedLog, setSelectedLog] = useState<TwilioSMSLog | null>(null);

  if (!isOpen) return null;

  const latestLog = logs[0];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="twilio-drawer-title"
    >
      <div className="corp-card w-full max-w-xl h-full flex flex-col border-l border-slate-800 rounded-none animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-slate-200" />
            <h2 id="twilio-drawer-title" className="text-base font-semibold text-slate-100">
              Twilio SMS Mock API Engine
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* View Tab Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setActiveTab('LOGS')}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                  activeTab === 'LOGS' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label="View Twilio API Logs"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>API Dispatch Logs</span>
              </button>
              <button
                onClick={() => setActiveTab('PHONE')}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                  activeTab === 'PHONE' ? 'bg-slate-800 text-slate-100 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
                aria-label="View Simulated Virtual Handset"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone Simulator</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 p-1.5 rounded-md transition-colors"
              aria-label="Close Twilio Logs drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab 1: API Logs */}
        {activeTab === 'LOGS' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Recorded Outbound Dispatches ({logs.length})</span>
              {logs.length > 0 && (
                <button
                  onClick={onClearLogs}
                  className="text-slate-400 hover:text-red-400 flex items-center gap-1 text-[11px]"
                  aria-label="Clear all Twilio SMS logs"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Logs</span>
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
                No Twilio SMS notification jobs executed yet. Trigger a job from the waitlist table.
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log) => (
                  <div
                    key={log.sid}
                    onClick={() => setSelectedLog(selectedLog?.sid === log.sid ? null : log)}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors cursor-pointer text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-slate-300 font-medium">
                        <span>{log.sid}</span>
                        <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                          {log.direction}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          log.status === 'delivered'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                            : log.status === 'queued'
                            ? 'bg-slate-800 text-slate-300 border border-slate-700'
                            : 'bg-red-950/80 text-red-300 border border-red-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>

                    <div className="text-slate-300">
                      Target: <strong className="text-slate-100">{log.studentName}</strong> ({log.phoneNumber}) — Class: <strong className="text-slate-200">{log.className}</strong>
                    </div>

                    <div className="bg-slate-900 border border-slate-800/80 p-2 rounded text-slate-300 font-mono text-[11px] whitespace-pre-wrap">
                      "{log.body}"
                    </div>

                    {log.errorMessage && (
                      <div className="text-red-400 bg-red-950/40 border border-red-900/60 p-2 rounded text-[11px] font-mono flex items-center gap-1.5">
                        <AlertOctagon className="w-4 h-4 flex-shrink-0" />
                        <span>{log.errorMessage}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                      <span>From: {log.fromNumber}</span>
                      <span>Cost: {log.price} • {new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>

                    {/* Detailed JSON Payload Inspector */}
                    {selectedLog?.sid === log.sid && (
                      <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                        <div className="text-slate-300 font-semibold mb-1">Twilio API Webhook Payload Inspector:</div>
                        <pre className="bg-slate-900 p-2 rounded border border-slate-800 overflow-x-auto text-slate-300">
                          {JSON.stringify(
                            {
                              AccountSid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
                              ApiVersion: '2010-04-01',
                              Body: log.body,
                              From: log.fromNumber,
                              MessageSid: log.sid,
                              SmsStatus: log.status,
                              To: log.phoneNumber,
                              ErrorCode: log.errorCode,
                              Timestamp: log.timestamp
                            },
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Tab 2: Virtual Handset Simulator */
          <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center bg-slate-950">
            {/* Phone Shell */}
            <div className="w-[320px] h-[580px] bg-slate-900 border-4 border-slate-800 rounded-[36px] shadow-2xl flex flex-col overflow-hidden relative border-t-8 border-t-slate-800">
              {/* Notch */}
              <div className="w-28 h-4 bg-slate-800 rounded-b-xl mx-auto flex justify-center items-center">
                <div className="w-3 h-3 rounded-full bg-slate-950" />
              </div>

              {/* Phone Header */}
              <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-slate-200">Messages</span>
                <span className="font-mono">PulseFit SMS</span>
              </div>

              {/* SMS Messages View */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-slate-950">
                {!latestLog ? (
                  <div className="text-center py-20 text-slate-600 text-xs">
                    No SMS notifications received yet on this simulated device.
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center text-[10px] text-slate-500 my-2">
                      Today {new Date(latestLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>

                    <div className="max-w-[85%] bg-slate-800 border border-slate-700 text-slate-100 p-3 rounded-2xl rounded-tl-xs text-xs space-y-1 shadow-sm">
                      <div className="text-[10px] font-semibold text-slate-300">
                        {latestLog.fromNumber} (PulseFit Club)
                      </div>
                      <p className="leading-relaxed">{latestLog.body}</p>
                      <div className="flex items-center justify-end gap-1 text-[9px] text-slate-400 font-mono">
                        <span>{new Date(latestLog.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        {latestLog.status === 'delivered' && (
                          <CheckCheck className="w-3 h-3 text-emerald-400" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Home Bar */}
              <div className="h-6 bg-slate-950 flex justify-center items-center">
                <div className="w-24 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>

            <p className="text-xs text-slate-400 mt-4 text-center max-w-xs">
              Simulated smartphone recipient view for student <strong>{latestLog?.studentName || 'Recipient'}</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
