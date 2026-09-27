import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { sanitizeInput, validatePhoneNumber } from '../utils/sanitizer';
import { logTelemetry } from '../utils/telemetry';
import { sendWaitlistSMSNotification, clearTwilioSMSLogs } from '../services/twilioMockService';
import type { WaitlistEntry } from '../types';

describe('Class Waitlist SMS Notification Job (Twilio Mock) - TDD Test Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearTwilioSMSLogs();
  });

  describe('1. Security & Input Sanitization (XSS Prevention)', () => {
    it('should sanitize HTML script tags from user inputs', () => {
      const maliciousInput = '<script>alert("xss")</script>John Doe';
      const sanitized = sanitizeInput(maliciousInput);
      expect(sanitized).not.toContain('<script>');
      expect(sanitized).toContain('&lt;script&gt;');
    });

    it('should strip javascript: pseudoprotocol from input', () => {
      const maliciousProtocol = 'javascript:alert(1)';
      const sanitized = sanitizeInput(maliciousProtocol);
      expect(sanitized).not.toContain('javascript:');
    });

    it('should validate phone numbers correctly', () => {
      expect(validatePhoneNumber('+14155552671')).toBe(true);
      expect(validatePhoneNumber('4155552671')).toBe(true);
      expect(validatePhoneNumber('invalid-phone')).toBe(false);
      expect(validatePhoneNumber('123')).toBe(false);
    });
  });

  describe('2. Telemetry Simulation NFR', () => {
    it('should log analytics ping with exact required prefix on primary actions', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      logTelemetry('Add Student to Waitlist', { studentName: 'Alice Smith' });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Analytics] User interacted with Class Waitlist SMS Notification Job (Twilio Mock)'),
        expect.anything()
      );
      consoleSpy.mockRestore();
    });
  });

  describe('3. Twilio SMS Notification Job Mock Engine', () => {
    it('should simulate successful SMS dispatch to waitlist student', async () => {
      const mockEntry: WaitlistEntry = {
        id: 'w-1',
        classId: 'c-1',
        className: 'Yoga Fusion',
        studentName: 'Sarah Connor',
        phoneNumber: '+14155550199',
        email: 'sarah@example.com',
        position: 1,
        dateAdded: new Date().toISOString(),
        status: 'WAITING'
      };

      const result = await sendWaitlistSMSNotification(mockEntry, 'SUCCESS');
      expect(result.success).toBe(true);
      expect(result.log.status).toBe('delivered');
      expect(result.log.sid).toMatch(/^SM[a-f0-9]{32}$/);
      expect(result.log.fromNumber).toBe('+1 (888) 555-0199');
    });

    it('should handle Twilio delivery failure mode for invalid phone number', async () => {
      const mockEntry: WaitlistEntry = {
        id: 'w-2',
        classId: 'c-1',
        className: 'CrossFit HIIT',
        studentName: 'Invalid User',
        phoneNumber: '000000',
        email: 'invalid@example.com',
        position: 2,
        dateAdded: new Date().toISOString(),
        status: 'WAITING'
      };

      const result = await sendWaitlistSMSNotification(mockEntry, 'INVALID_PHONE');
      expect(result.success).toBe(false);
      expect(result.log.status).toBe('failed');
      expect(result.log.errorCode).toBe(21211);
    });
  });

  describe('4. UI Component Integration & Happy Path', () => {
    it('should render the application title and main components correctly', async () => {
      render(<App />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Class Waitlist SMS Notification Job/i);
      expect(screen.getByText(/PulseFit Club Floor Management/i)).toBeInTheDocument();
    });

    it('should filter waitlist entries and show empty state when no results match', async () => {
      render(<App />);
      const searchInput = screen.getByPlaceholderText(/Search student name, phone, or class/i);
      await userEvent.type(searchInput, 'NonExistentStudent12345');
      
      expect(screen.getByText(/No waitlist records found matching your search criteria/i)).toBeInTheDocument();
    });

    it('should show validation error when submitting form with invalid/empty fields', async () => {
      render(<App />);
      const openModalBtn = screen.getByRole('button', { name: /Add Waitlist Entry/i });
      fireEvent.click(openModalBtn);

      const submitBtn = screen.getByRole('button', { name: /Add to Waitlist/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/Student name is required/i)).toBeInTheDocument();
    });
  });
});
