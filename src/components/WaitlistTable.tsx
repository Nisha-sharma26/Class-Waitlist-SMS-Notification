import React from 'react';
import type { WaitlistEntry } from '../types';
import { Search, Send, CheckCircle, Trash2, PhoneCall, AlertCircle, RefreshCw, Filter } from 'lucide-react';

interface WaitlistTableProps {
  entries: WaitlistEntry[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onSendSMS: (entry: WaitlistEntry) => void;
  onClaimSpot: (entryId: string) => void;
  onRemoveEntry: (entryId: string) => void;
  isSendingSMSId: string | null;
  networkLoading: boolean;
}

export const WaitlistTable: React.FC<WaitlistTableProps> = ({
  entries,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onSendSMS,
  onClaimSpot,
  onRemoveEntry,
  isSendingSMSId,
  networkLoading
}) => {
  return (
    <section className="corp-card p-4 sm:p-6" aria-labelledby="waitlist-table-heading">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 id="waitlist-table-heading" className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>Floor Waitlist Queue</span>
            <span className="text-xs font-mono bg-slate-800/90 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
              {entries.length} Registered
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time digital waitlist queue replacing paper floor logs. Floor staff can dispatch SMS notifications directly via Twilio Mock.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search student name, phone, or class..."
              className="corp-input pl-9 text-xs w-full"
              aria-label="Search student name, phone, or class"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative flex items-center w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="corp-input pl-8 pr-8 text-xs bg-slate-900 border-slate-700 text-slate-200 cursor-pointer w-full"
              aria-label="Filter waitlist queue by status"
            >
              <option value="ALL">All Statuses</option>
              <option value="WAITING">Waiting Queue</option>
              <option value="NOTIFIED">SMS Sent (Notified)</option>
              <option value="CLAIMED">Spot Claimed</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Connectivity Loading Indicator Overlay */}
      {networkLoading && (
        <div className="mb-4 bg-slate-950/80 border border-slate-800 p-3 rounded-lg flex items-center justify-center gap-2 text-xs text-slate-300 backdrop-blur-md">
          <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
          <span>Synchronizing waitlist queue across network...</span>
        </div>
      )}

      {/* Waitlist Table or Empty State */}
      {entries.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl bg-slate-950/40">
          <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-500 shadow-inner">
            <AlertCircle className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No waitlist records found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
            No waitlist records found matching your search criteria. Try clearing your search filters or add a new student using the button above.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-800/80">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/90 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Pos</th>
                <th scope="col" className="px-4 py-3 font-semibold">Student Name</th>
                <th scope="col" className="px-4 py-3 font-semibold">Class Target</th>
                <th scope="col" className="px-4 py-3 font-semibold">Contact Details</th>
                <th scope="col" className="px-4 py-3 font-semibold">Priority</th>
                <th scope="col" className="px-4 py-3 font-semibold">Status</th>
                <th scope="col" className="px-4 py-3 font-semibold text-right">Floor Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {entries.map((entry) => {
                const isNotifyingThis = isSendingSMSId === entry.id;

                const initials = entry.studentName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .substring(0, 2);

                return (
                  <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Queue Position */}
                    <td className="px-4 py-3 font-mono font-bold text-slate-200">
                      <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs text-slate-200">
                        #{entry.position}
                      </span>
                    </td>

                    {/* Student Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600 flex items-center justify-center font-bold text-slate-200 text-[11px] flex-shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-100">{entry.studentName}</div>
                          {entry.notes && (
                            <div className="text-[11px] text-slate-400 italic truncate max-w-[180px]">
                              "{entry.notes}"
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Target Class */}
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-200">{entry.className}</span>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Added: {new Date(entry.dateAdded).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="px-4 py-3">
                      <div className="font-mono text-slate-200 flex items-center gap-1.5">
                        <PhoneCall className="w-3 h-3 text-slate-400" />
                        <span>{entry.phoneNumber}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">{entry.email}</div>
                    </td>

                    {/* Priority Badge */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          entry.priority === 'VIP'
                            ? 'bg-purple-950/80 text-purple-300 border border-purple-800 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                            : entry.priority === 'Member'
                            ? 'bg-blue-950/80 text-blue-300 border border-blue-800 shadow-[0_0_10px_rgba(59,130,246,0.15)]'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {entry.priority || 'Standard'}
                      </span>
                    </td>

                    {/* Waitlist & SMS Status */}
                    <td className="px-4 py-3">
                      {entry.status === 'WAITING' && (
                        <span className="badge badge-waiting">Waiting in Line</span>
                      )}
                      {entry.status === 'NOTIFIED' && (
                        <div>
                          <span className="badge badge-notified mb-0.5">SMS Sent (Twilio)</span>
                          {entry.lastNotifiedAt && (
                            <div className="text-[10px] text-amber-400/80 font-mono">
                              {new Date(entry.lastNotifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      )}
                      {entry.status === 'CLAIMED' && (
                        <span className="badge badge-claimed flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          <span>Spot Claimed</span>
                        </span>
                      )}
                      {entry.status === 'EXPIRED' && (
                        <span className="badge bg-red-950/60 text-red-300 border border-red-800">
                          Expired (15m)
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Send SMS Notification Job Button */}
                        <button
                          onClick={() => onSendSMS(entry)}
                          disabled={isNotifyingThis || entry.status === 'CLAIMED'}
                          className="corp-button-secondary text-xs px-2.5 py-1 disabled:opacity-40"
                          aria-label={`Send Twilio SMS notification to ${entry.studentName}`}
                          title="Send SMS notification via Twilio Mock"
                        >
                          <Send className={`w-3 h-3 ${isNotifyingThis ? 'animate-spin text-amber-400' : ''}`} />
                          <span>{isNotifyingThis ? 'Sending...' : 'SMS Job'}</span>
                        </button>

                        {/* Claim Spot Button */}
                        {entry.status !== 'CLAIMED' && (
                          <button
                            onClick={() => onClaimSpot(entry.id)}
                            className="bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                            aria-label={`Mark spot claimed for ${entry.studentName}`}
                            title="Confirm student claimed spot in class"
                          >
                            <CheckCircle className="w-3 h-3" />
                            <span>Claim</span>
                          </button>
                        )}

                        {/* Remove Button */}
                        <button
                          onClick={() => onRemoveEntry(entry.id)}
                          className="text-slate-500 hover:text-red-400 p-1.5 rounded-md transition-colors"
                          aria-label={`Remove ${entry.studentName} from waitlist`}
                          title="Remove from waitlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
