import type { TelemetryEvent } from '../types';

let telemetryHistory: TelemetryEvent[] = [];

/**
 * Logs a telemetry analytics ping to console and maintains telemetry history
 */
export function logTelemetry(action: string, payload?: Record<string, unknown>): TelemetryEvent {
  const event: TelemetryEvent = {
    id: `tel-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: new Date().toISOString(),
    action,
    component: 'Class Waitlist SMS Notification Job (Twilio Mock)',
    payload
  };

  telemetryHistory.unshift(event);
  if (telemetryHistory.length > 50) {
    telemetryHistory = telemetryHistory.slice(0, 50);
  }

  // Exact required NFR format log
  console.log(`[Analytics] User interacted with Class Waitlist SMS Notification Job (Twilio Mock): ${action}`, payload || '');

  return event;
}

export function getTelemetryHistory(): TelemetryEvent[] {
  return [...telemetryHistory];
}

export function clearTelemetryHistory(): void {
  telemetryHistory = [];
}
