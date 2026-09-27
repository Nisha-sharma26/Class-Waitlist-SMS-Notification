import React, { useState } from 'react';
import { X, Database, Network, Key, Layers, Server } from 'lucide-react';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  const [activeSubTab, setActiveSubTab] = useState<'ERD' | 'APIS' | 'TWILIO'>('ERD');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="arch-modal-title"
    >
      <div className="corp-card w-full max-w-4xl p-6 relative border border-slate-700 shadow-2xl my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-100">
              <Database className="w-5 h-5 text-slate-200" />
            </div>
            <div>
              <h2 id="arch-modal-title" className="text-lg font-semibold text-slate-100">
                Architectural Blueprint & Database Schema (ERD)
              </h2>
              <p className="text-xs text-slate-400">
                Ticket ENG-135180 Architectural Design & API Contract Specification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 p-1 rounded-md transition-colors"
            aria-label="Close Architecture Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4 text-xs font-medium">
          <button
            onClick={() => setActiveSubTab('ERD')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'ERD' ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Database ERD Schema</span>
          </button>

          <button
            onClick={() => setActiveSubTab('APIS')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'APIS' ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>REST API Contracts</span>
          </button>

          <button
            onClick={() => setActiveSubTab('TWILIO')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'TWILIO' ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="w-4 h-4" />
            <span>Twilio Webhooks & Security</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-6 text-xs text-slate-300 pr-2">
          {activeSubTab === 'ERD' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <span>Relational Schema Architecture (PostgreSQL / MySQL)</span>
              </h3>

              {/* Visual ERD Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px]">
                {/* Table 1: Classes */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                  <div className="text-slate-100 font-bold border-b border-slate-800 pb-1.5 flex justify-between">
                    <span>TABLE: fitness_classes</span>
                    <span className="text-slate-500 font-normal">PK: class_id</span>
                  </div>
                  <div className="space-y-1 text-slate-400">
                    <div><span className="text-emerald-400">class_id</span> UUID PRIMARY KEY</div>
                    <div><span className="text-slate-200">name</span> VARCHAR(100) NOT NULL</div>
                    <div><span className="text-slate-200">schedule_time</span> TIMESTAMP WITH TIME ZONE</div>
                    <div><span className="text-slate-200">capacity</span> INTEGER DEFAULT 20</div>
                    <div><span className="text-slate-200">enrolled_count</span> INTEGER DEFAULT 0</div>
                    <div><span className="text-slate-200">instructor_id</span> UUID REFERENCES instructors</div>
                    <div><span className="text-slate-200">room</span> VARCHAR(50) NOT NULL</div>
                  </div>
                </div>

                {/* Table 2: Waitlist Entries */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                  <div className="text-slate-100 font-bold border-b border-slate-800 pb-1.5 flex justify-between">
                    <span>TABLE: waitlist_entries</span>
                    <span className="text-slate-500 font-normal">FK: class_id</span>
                  </div>
                  <div className="space-y-1 text-slate-400">
                    <div><span className="text-emerald-400">entry_id</span> UUID PRIMARY KEY</div>
                    <div><span className="text-amber-400">class_id</span> UUID REFERENCES fitness_classes</div>
                    <div><span className="text-slate-200">student_name</span> VARCHAR(150) NOT NULL</div>
                    <div><span className="text-slate-200">phone_number</span> VARCHAR(20) NOT NULL</div>
                    <div><span className="text-slate-200">email</span> VARCHAR(150) NULL</div>
                    <div><span className="text-slate-200">position</span> INTEGER NOT NULL</div>
                    <div><span className="text-slate-200">status</span> ENUM('WAITING','NOTIFIED','CLAIMED')</div>
                    <div><span className="text-slate-200">priority_tier</span> ENUM('Standard','Member','VIP')</div>
                  </div>
                </div>

                {/* Table 3: Twilio SMS Notification Jobs */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                  <div className="text-slate-100 font-bold border-b border-slate-800 pb-1.5 flex justify-between">
                    <span>TABLE: sms_notification_jobs</span>
                    <span className="text-slate-500 font-normal">FK: entry_id</span>
                  </div>
                  <div className="space-y-1 text-slate-400">
                    <div><span className="text-emerald-400">job_id</span> UUID PRIMARY KEY</div>
                    <div><span className="text-amber-400">entry_id</span> UUID REFERENCES waitlist_entries</div>
                    <div><span className="text-slate-200">message_sid</span> VARCHAR(34) UNIQUE</div>
                    <div><span className="text-slate-200">to_phone</span> VARCHAR(20) NOT NULL</div>
                    <div><span className="text-slate-200">delivery_status</span> ENUM('queued','sent','delivered','failed')</div>
                    <div><span className="text-slate-200">error_code</span> INTEGER NULL</div>
                    <div><span className="text-slate-200">dispatched_at</span> TIMESTAMP WITH TIME ZONE</div>
                  </div>
                </div>

                {/* Table 4: Audit & Telemetry Logs */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-lg space-y-2">
                  <div className="text-slate-100 font-bold border-b border-slate-800 pb-1.5 flex justify-between">
                    <span>TABLE: telemetry_audit_logs</span>
                    <span className="text-slate-500 font-normal">PK: log_id</span>
                  </div>
                  <div className="space-y-1 text-slate-400">
                    <div><span className="text-emerald-400">log_id</span> UUID PRIMARY KEY</div>
                    <div><span className="text-slate-200">staff_id</span> UUID REFERENCES staff_users</div>
                    <div><span className="text-slate-200">action_name</span> VARCHAR(100) NOT NULL</div>
                    <div><span className="text-slate-200">payload_json</span> JSONB NOT NULL</div>
                    <div><span className="text-slate-200">created_at</span> TIMESTAMP WITH TIME ZONE</div>
                  </div>
                </div>
              </div>

              {/* Indexing Strategy Note */}
              <div className="bg-slate-900 border border-slate-800 p-3 rounded text-[11px]">
                <strong className="text-slate-200">Performance Index Strategy:</strong> Compound Index <code>idx_waitlist_class_pos (class_id, position)</code> to ensure O(1) retrieval when shifting waitlist positions upon spot vacancy.
              </div>
            </div>
          )}

          {activeSubTab === 'APIS' && (
            <div className="space-y-4 font-mono text-[11px]">
              <h3 className="text-sm font-semibold text-slate-100 font-sans">API Contracts & Payload Schemas</h3>

              <div className="space-y-3">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-800">POST</span>
                    <span className="text-slate-100 font-bold">/api/v1/waitlist/entries</span>
                  </div>
                  <p className="text-slate-400 mb-2 font-sans text-xs">Add a new student to a class waitlist queue (Sanitized & Validated)</p>
                  <pre className="bg-slate-900 p-2 rounded text-slate-300">
{`// Request Payload:
{
  "classId": "cls_yoga_7am",
  "studentName": "Sarah Connor",
  "phoneNumber": "+14155550199",
  "email": "sarah@example.com",
  "priority": "VIP"
}

// 201 Created Response:
{
  "success": true,
  "data": {
    "entryId": "w_991823",
    "position": 1,
    "status": "WAITING",
    "createdAt": "2026-09-27T21:30:00Z"
  }
}`}
                  </pre>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-blue-950 text-blue-300 font-bold px-2 py-0.5 rounded border border-blue-800">POST</span>
                    <span className="text-slate-100 font-bold">/api/v1/jobs/twilio-sms/dispatch</span>
                  </div>
                  <p className="text-slate-400 mb-2 font-sans text-xs">Trigger Twilio SMS Notification Job when class spot opens up</p>
                  <pre className="bg-slate-900 p-2 rounded text-slate-300">
{`// 200 OK Response:
{
  "success": true,
  "messageSid": "SM8f9210c44a9821e902a7719d0831a29f",
  "twilioStatus": "delivered",
  "recipientPhone": "+14155550199",
  "expiryWindowMinutes": 15
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeSubTab === 'TWILIO' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-100">Twilio Webhook Integration & Security Architecture</h3>
              <p className="text-slate-400">
                Outbound SMS messages dispatch via Twilio REST API with automated status callback webhooks updating delivery state (`queued` &rarr; `sent` &rarr; `delivered`).
              </p>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded space-y-2 font-mono text-[11px]">
                <div className="text-slate-200 font-bold flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span>X-Twilio-Signature Webhook Verification:</span>
                </div>
                <p className="text-slate-400 font-sans text-xs">
                  All incoming status callbacks are HMAC-SHA1 validated using the auth token to prevent spoofed delivery status updates.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button onClick={onClose} className="corp-button-primary text-xs">
            Close Architecture Blueprint
          </button>
        </div>
      </div>
    </div>
  );
};
