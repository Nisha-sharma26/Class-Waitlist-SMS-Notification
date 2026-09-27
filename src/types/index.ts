export type WaitlistStatus = 'WAITING' | 'NOTIFIED' | 'CLAIMED' | 'EXPIRED' | 'CANCELLED';
export type ClassStatus = 'OPEN' | 'FULL' | 'SPOT_OPEN';
export type TwilioDeliveryMode = 'SUCCESS' | 'SLOW_3G' | 'INVALID_PHONE' | 'CARRIER_ERROR' | 'OFFLINE_QUEUE';

export interface ClassItem {
  id: string;
  name: string;
  schedule: string;
  instructor: string;
  capacity: number;
  enrolledCount: number;
  waitlistCount: number;
  status: ClassStatus;
  room: string;
  category: string;
}

export interface WaitlistEntry {
  id: string;
  classId: string;
  className: string;
  studentName: string;
  phoneNumber: string;
  email: string;
  position: number;
  dateAdded: string;
  status: WaitlistStatus;
  lastNotifiedAt?: string;
  smsMessageSid?: string;
  notes?: string;
  priority?: 'Standard' | 'VIP' | 'Member';
}

export interface TwilioSMSLog {
  sid: string;
  waitlistId: string;
  studentName: string;
  phoneNumber: string;
  className: string;
  body: string;
  status: 'queued' | 'sending' | 'delivered' | 'failed' | 'undelivered';
  timestamp: string;
  price: string;
  errorCode: number | null;
  errorMessage: string | null;
  direction: 'outbound-api';
  fromNumber: string;
}

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  action: string;
  component: string;
  payload?: Record<string, unknown>;
}

export interface ValidationErrors {
  studentName?: string;
  phoneNumber?: string;
  email?: string;
}
