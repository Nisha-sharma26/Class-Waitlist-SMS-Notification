import React, { useState } from 'react';
import type { ClassItem, ValidationErrors } from '../types';
import { sanitizeInput, validatePhoneNumber, validateEmail } from '../utils/sanitizer';
import { X, UserPlus, AlertCircle, ShieldCheck } from 'lucide-react';

interface AddWaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassItem[];
  defaultClassId?: string;
  onAddEntry: (entryData: {
    classId: string;
    studentName: string;
    phoneNumber: string;
    email: string;
    priority: 'Standard' | 'VIP' | 'Member';
    notes?: string;
  }) => void;
}

export const AddWaitlistModal: React.FC<AddWaitlistModalProps> = ({
  isOpen,
  onClose,
  classes,
  defaultClassId,
  onAddEntry
}) => {
  const [classId, setClassId] = useState(defaultClassId || classes[0]?.id || '');
  const [studentName, setStudentName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [priority, setPriority] = useState<'Standard' | 'VIP' | 'Member'>('Standard');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<ValidationErrors>({});

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedName = sanitizeInput(studentName);
    const sanitizedNotes = sanitizeInput(notes);
    const newErrors: ValidationErrors = {};

    if (!sanitizedName.trim()) {
      newErrors.studentName = 'Student name is required.';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required for SMS notifications.';
    } else if (!validatePhoneNumber(phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format. Please enter a valid number (e.g., +14155552671 or 10-15 digits).';
    }

    if (email.trim() && !validateEmail(email)) {
      newErrors.email = 'Invalid email address format.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onAddEntry({
      classId: classId || classes[0]?.id || '',
      studentName: sanitizedName,
      phoneNumber,
      email,
      priority,
      notes: sanitizedNotes
    });

    // Reset form
    setStudentName('');
    setPhoneNumber('');
    setEmail('');
    setNotes('');
    setErrors({});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="corp-card w-full max-w-lg p-6 relative border border-slate-700 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 rounded-md transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-100">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-slate-100">
              Add Student to Class Waitlist
            </h2>
            <p className="text-xs text-slate-400">
              Enter student details. Phone numbers are sanitized and formatted for Twilio SMS dispatches.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Class Selection */}
          <div>
            <label htmlFor="class-select" className="block text-xs font-semibold text-slate-300 mb-1">
              Target Fitness Class <span className="text-red-400">*</span>
            </label>
            <select
              id="class-select"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="corp-input bg-slate-950 text-xs"
              required
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.schedule}) — {c.capacity - c.enrolledCount <= 0 ? 'Waitlist Active' : `${c.capacity - c.enrolledCount} Spot(s) Open`}
                </option>
              ))}
            </select>
          </div>

          {/* Student Name Input */}
          <div>
            <label htmlFor="student-name" className="block text-xs font-semibold text-slate-300 mb-1">
              Student Full Name <span className="text-red-400">*</span>
            </label>
            <input
              id="student-name"
              type="text"
              value={studentName}
              onChange={(e) => {
                setStudentName(e.target.value);
                if (errors.studentName) setErrors({ ...errors, studentName: undefined });
              }}
              placeholder="e.g. Sarah Connor"
              className={`corp-input text-xs ${errors.studentName ? 'corp-input-error' : ''}`}
              aria-invalid={!!errors.studentName}
              aria-describedby={errors.studentName ? 'student-name-error' : undefined}
            />
            {errors.studentName && (
              <p id="student-name-error" className="text-xs text-red-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.studentName}</span>
              </p>
            )}
          </div>

          {/* Phone Number Input */}
          <div>
            <label htmlFor="phone-number" className="block text-xs font-semibold text-slate-300 mb-1">
              Phone Number (Twilio SMS Target) <span className="text-red-400">*</span>
            </label>
            <input
              id="phone-number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: undefined });
              }}
              placeholder="e.g. +1 (415) 555-0199 or 4155550199"
              className={`corp-input text-xs ${errors.phoneNumber ? 'corp-input-error' : ''}`}
              aria-invalid={!!errors.phoneNumber}
              aria-describedby={errors.phoneNumber ? 'phone-error' : undefined}
            />
            {errors.phoneNumber && (
              <p id="phone-error" className="text-xs text-red-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.phoneNumber}</span>
              </p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email-input" className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address (Optional)
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              placeholder="e.g. sarah@example.com"
              className={`corp-input text-xs ${errors.email ? 'corp-input-error' : ''}`}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <p id="email-error" className="text-xs text-red-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.email}</span>
              </p>
            )}
          </div>

          {/* Priority Tier & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="priority-select" className="block text-xs font-semibold text-slate-300 mb-1">
                Waitlist Priority Tier
              </label>
              <select
                id="priority-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'Standard' | 'VIP' | 'Member')}
                className="corp-input bg-slate-950 text-xs"
              >
                <option value="Standard">Standard</option>
                <option value="Member">Club Member</option>
                <option value="VIP">VIP Executive</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes-input" className="block text-xs font-semibold text-slate-300 mb-1">
                Floor Notes
              </label>
              <input
                id="notes-input"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Needs front row mat"
                className="corp-input text-xs"
              />
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 p-2.5 rounded text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>XSS Protection Enabled: All text input fields sanitized before database insertion.</span>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="corp-button-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="corp-button-primary text-xs"
            >
              Add to Waitlist
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
