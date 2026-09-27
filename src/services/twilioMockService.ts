import type { WaitlistEntry, TwilioSMSLog, TwilioDeliveryMode } from '../types';
import { logTelemetry } from '../utils/telemetry';

const TWILIO_CONFIG = {
  accountSid: 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
  fromNumber: '+1 (888) 555-0199',
  webhookUrl: 'https://api.fitnessclub.com/webhooks/twilio/status'
};

let smsLogs: TwilioSMSLog[] = [];
let offlineQueue: { entry: WaitlistEntry; mode: TwilioDeliveryMode }[] = [];

function generateMessageSid(): string {
  const chars = '0123456789abcdef';
  let sid = 'SM';
  for (let i = 0; i < 32; i++) {
    sid += chars[Math.floor(Math.random() * chars.length)];
  }
  return sid;
}

export async function sendWaitlistSMSNotification(
  entry: WaitlistEntry,
  mode: TwilioDeliveryMode = 'SUCCESS',
  customMessage?: string
): Promise<{ success: boolean; log: TwilioSMSLog }> {
  // Simulate network delay based on connection state
  const delay = mode === 'SLOW_3G' ? 2500 : 600;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const sid = generateMessageSid();
  const timestamp = new Date().toISOString();
  const body = customMessage || `Hi ${entry.studentName}! A spot has opened up for you in "${entry.className}". Reply YES within 15 mins to claim your spot or call front desk. - PulseFit Club`;

  let status: TwilioSMSLog['status'] = 'delivered';
  let errorCode: number | null = null;
  let errorMessage: string | null = null;
  let success = true;

  if (mode === 'INVALID_PHONE') {
    status = 'failed';
    errorCode = 21211;
    errorMessage = "Twilio Error 21211: The 'To' phone number is invalid or improperly formatted.";
    success = false;
  } else if (mode === 'CARRIER_ERROR') {
    status = 'undelivered';
    errorCode = 30008;
    errorMessage = "Twilio Error 30008: Carrier notification delivery failed due to network blackout or unreachable device.";
    success = false;
  } else if (mode === 'OFFLINE_QUEUE') {
    offlineQueue.push({ entry, mode });
    logTelemetry('SMS Job Queued Offline', { waitlistId: entry.id, studentName: entry.studentName });
    status = 'queued';
  }

  const logEntry: TwilioSMSLog = {
    sid,
    waitlistId: entry.id,
    studentName: entry.studentName,
    phoneNumber: entry.phoneNumber,
    className: entry.className,
    body,
    status,
    timestamp,
    price: '-$0.0075',
    errorCode,
    errorMessage,
    direction: 'outbound-api',
    fromNumber: TWILIO_CONFIG.fromNumber
  };

  smsLogs.unshift(logEntry);
  if (smsLogs.length > 100) {
    smsLogs = smsLogs.slice(0, 100);
  }

  logTelemetry('Execute Twilio SMS Notification Job', {
    messageSid: sid,
    waitlistId: entry.id,
    studentName: entry.studentName,
    status,
    deliveryMode: mode
  });

  return { success, log: logEntry };
}

export function getTwilioSMSLogs(): TwilioSMSLog[] {
  return [...smsLogs];
}

export function getOfflineQueueCount(): number {
  return offlineQueue.length;
}

export async function flushOfflineQueue(): Promise<{ processedCount: number }> {
  const queue = [...offlineQueue];
  offlineQueue = [];
  let processedCount = 0;
  for (const item of queue) {
    await sendWaitlistSMSNotification(item.entry, 'SUCCESS');
    processedCount++;
  }
  logTelemetry('Flushed Offline SMS Queue', { processedCount });
  return { processedCount };
}

export function clearTwilioSMSLogs(): void {
  smsLogs = [];
}
