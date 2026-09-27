import type { TwilioDeliveryMode } from '../types';
import { RefreshCw, Signal, CloudOff } from 'lucide-react';

interface NetworkSimulatorBannerProps {
  currentMode: TwilioDeliveryMode;
  onModeChange: (mode: TwilioDeliveryMode) => void;
  offlineQueueCount: number;
  onFlushQueue: () => void;
  isFlushing: boolean;
}

export const NetworkSimulatorBanner: React.FC<NetworkSimulatorBannerProps> = ({
  currentMode,
  onModeChange,
  offlineQueueCount,
  onFlushQueue,
  isFlushing
}) => {
  return (
    <div className="bg-slate-950/80 border-b border-slate-800 px-4 sm:px-8 lg:px-10 py-2.5 text-[11px] sm:text-xs backdrop-blur-md">
      <div className="w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
        {/* Network & Twilio Error Simulation Controller */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row sm:items-center gap-2">
          <span className="text-slate-400 font-medium flex items-center gap-1.5 flex-shrink-0">
            <Signal className="w-3.5 h-3.5 text-slate-300" />
            <span>Network / Twilio State:</span>
          </span>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg overflow-x-auto w-full sm:w-auto max-w-full">
            <button
              onClick={() => onModeChange('SUCCESS')}
              className={`px-2 sm:px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                currentMode === 'SUCCESS'
                  ? 'bg-slate-800 text-slate-100 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label="Set network mode to Normal High Speed"
            >
              Normal (100%)
            </button>
            <button
              onClick={() => onModeChange('SLOW_3G')}
              className={`px-2 sm:px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                currentMode === 'SLOW_3G'
                  ? 'bg-amber-950 text-amber-200 font-semibold border border-amber-800'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
              aria-label="Set network mode to Slow 3G Latency"
            >
              Slow 3G (2.5s)
            </button>
            <button
              onClick={() => onModeChange('INVALID_PHONE')}
              className={`px-2 sm:px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                currentMode === 'INVALID_PHONE'
                  ? 'bg-red-950 text-red-200 font-semibold border border-red-800'
                  : 'text-slate-400 hover:text-red-300'
              }`}
              aria-label="Simulate Invalid Phone Number Twilio Error 21211"
            >
              Err 21211
            </button>
            <button
              onClick={() => onModeChange('CARRIER_ERROR')}
              className={`px-2 sm:px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                currentMode === 'CARRIER_ERROR'
                  ? 'bg-red-950 text-red-200 font-semibold border border-red-800'
                  : 'text-slate-400 hover:text-red-300'
              }`}
              aria-label="Simulate Carrier Delivery Failure Twilio Error 30008"
            >
              Err 30008
            </button>
            <button
              onClick={() => onModeChange('OFFLINE_QUEUE')}
              className={`px-2 sm:px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                currentMode === 'OFFLINE_QUEUE'
                  ? 'bg-slate-800 text-red-300 font-semibold border border-red-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-label="Simulate Spotty Internet Disconnection Offline Queueing"
            >
              Offline
            </button>
          </div>
        </div>

        {/* Offline Queue Sync Status */}
        {offlineQueueCount > 0 && (
          <div className="w-full md:w-auto flex items-center justify-between gap-2 bg-amber-950/40 border border-amber-800/80 text-amber-300 px-3 py-1 rounded-md">
            <div className="flex items-center gap-1.5">
              <CloudOff className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              <span>{offlineQueueCount} job(s) offline</span>
            </div>
            <button
              onClick={onFlushQueue}
              disabled={isFlushing}
              className="ml-2 bg-amber-900 hover:bg-amber-800 text-amber-100 px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 border border-amber-700 disabled:opacity-50"
              aria-label="Flush and sync offline queued SMS jobs"
            >
              <RefreshCw className={`w-3 h-3 ${isFlushing ? 'animate-spin' : ''}`} />
              <span>{isFlushing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

