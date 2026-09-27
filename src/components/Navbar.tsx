import type { TwilioDeliveryMode } from '../types';
import { MessageSquare, Database, Activity, UserPlus, Wifi, WifiOff } from 'lucide-react';

interface NavbarProps {
  networkMode: TwilioDeliveryMode;
  onOpenAddModal: () => void;
  onOpenTwilioLogs: () => void;
  onOpenTelemetry: () => void;
  onOpenArchitecture: () => void;
  smsLogCount: number;
  telemetryCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  networkMode,
  onOpenAddModal,
  onOpenTwilioLogs,
  onOpenTelemetry,
  onOpenArchitecture,
  smsLogCount,
  telemetryCount
}) => {
  return (
    <header className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-8 lg:px-10 py-3 sm:py-4 sticky top-0 z-30 shadow-md backdrop-blur-md">
      <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        {/* Brand & Ticket Info */}
        <div className="flex items-center justify-between md:justify-start gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-100 font-bold shadow-inner flex-shrink-0">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-slate-200" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-semibold text-slate-100 tracking-tight">
                  Class Waitlist SMS Notification Job
                </h1>
                <span className="text-[10px] sm:text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700 px-1.5 py-0.5 rounded">
                  Twilio Mock
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">
                PulseFit Club Floor Management • Ticket ENG-135180 (P1)
              </p>
            </div>
          </div>

          {/* Connection Status Pill - Phone Compact View */}
          <div
            className={`md:hidden flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              networkMode === 'OFFLINE_QUEUE'
                ? 'bg-red-950/60 border-red-800 text-red-300'
                : networkMode === 'SLOW_3G'
                ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
            }`}
          >
            {networkMode === 'OFFLINE_QUEUE' ? (
              <WifiOff className="w-3 h-3" />
            ) : (
              <Wifi className="w-3 h-3" />
            )}
            <span>
              {networkMode === 'OFFLINE_QUEUE' ? 'Offline' : networkMode === 'SLOW_3G' ? '3G' : 'Online'}
            </span>
          </div>
        </div>

        {/* System Controls & Action Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-3 flex-wrap">
          {/* Connection Status Indicator - Desktop/Tablet */}
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
              networkMode === 'OFFLINE_QUEUE'
                ? 'bg-red-950/60 border-red-800 text-red-300'
                : networkMode === 'SLOW_3G'
                ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
            }`}
            aria-live="polite"
          >
            {networkMode === 'OFFLINE_QUEUE' ? (
              <WifiOff className="w-3.5 h-3.5" />
            ) : (
              <Wifi className="w-3.5 h-3.5" />
            )}
            <span>
              {networkMode === 'OFFLINE_QUEUE'
                ? 'Spotty Internet (Offline)'
                : networkMode === 'SLOW_3G'
                ? 'Slow 3G Latency (2500ms)'
                : 'Network Online (High-Speed)'}
            </span>
          </div>

          {/* Architecture / ERD Schema Button */}
          <button
            onClick={onOpenArchitecture}
            className="corp-button-secondary text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5"
            aria-label="View Database Schema ERD and API Contracts"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Database ERD</span>
            <span className="sm:hidden">ERD</span>
          </button>

          {/* Twilio SMS Dispatch Logs Button */}
          <button
            onClick={onOpenTwilioLogs}
            className="corp-button-secondary text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 relative"
            aria-label="View Twilio SMS Logs and Virtual Phone Simulator"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Twilio Logs</span>
            <span className="sm:hidden">Logs</span>
            {smsLogCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-slate-700 text-slate-200 rounded-full text-[10px] font-mono">
                {smsLogCount}
              </span>
            )}
          </button>

          {/* Telemetry Pings Button */}
          <button
            onClick={onOpenTelemetry}
            className="corp-button-secondary text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5 relative"
            aria-label="View Telemetry Pings Log"
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Telemetry</span>
            {telemetryCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-slate-700 text-slate-200 rounded-full text-[10px] font-mono">
                {telemetryCount}
              </span>
            )}
          </button>

          {/* Add Waitlist Entry Primary Action Button */}
          <button
            onClick={onOpenAddModal}
            className="corp-button-primary text-xs px-3 sm:px-4 py-1.5 flex-1 sm:flex-initial justify-center"
            aria-label="Add Waitlist Entry"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Entry</span>
          </button>
        </div>
      </div>
    </header>
  );
};

