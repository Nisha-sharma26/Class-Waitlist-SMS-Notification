import React from 'react';
import type { ClassItem } from '../types';
import { Users, Clock, BellRing, Sparkles } from 'lucide-react';

interface ClassListProps {
  classes: ClassItem[];
  selectedClassId: string | null;
  onSelectClass: (classId: string | null) => void;
  onOpenSpotAndNotifyNext: (classItem: ClassItem) => void;
  isProcessingId: string | null;
}

export const ClassList: React.FC<ClassListProps> = ({
  classes,
  selectedClassId,
  onSelectClass,
  onOpenSpotAndNotifyNext,
  isProcessingId
}) => {
  return (
    <section className="mb-8" aria-labelledby="active-classes-heading">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 id="active-classes-heading" className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            <span>Active Fitness Classes & Waitlist Status</span>
            <Sparkles className="w-4 h-4 text-slate-300" />
          </h2>
          <p className="text-xs text-slate-400">
            Select a class to filter waitlist floor entries or open a spot to auto-trigger Twilio SMS job.
          </p>
        </div>
        
        {selectedClassId && (
          <button
            onClick={() => onSelectClass(null)}
            className="text-xs text-slate-300 hover:text-white underline decoration-slate-600 cursor-pointer font-medium"
            aria-label="Clear active class filter"
          >
            Show All Classes ({classes.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {classes.map((cls) => {
          const isSelected = selectedClassId === cls.id;
          const openSpots = Math.max(0, cls.capacity - cls.enrolledCount);
          const isFull = openSpots === 0;

          // Instructor Initial Avatar
          const initials = cls.instructor
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2);

          return (
            <div
              key={cls.id}
              className={`corp-card p-4 transition-all duration-200 relative flex flex-col justify-between ${
                isSelected ? 'corp-card-glow ring-2 ring-slate-300 bg-slate-900/90' : 'hover:-translate-y-1'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-mono text-slate-300 uppercase tracking-wider bg-slate-800/90 px-2 py-0.5 rounded border border-slate-700">
                      {cls.category} • {cls.room}
                    </span>
                    <h3 className="text-base font-semibold text-slate-100 mt-1.5">{cls.name}</h3>
                  </div>
                  
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0 ${
                      isFull 
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-700/80 shadow-[0_0_10px_rgba(245,158,11,0.15)]' 
                        : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/80 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                    }`}
                  >
                    {isFull ? 'Waitlist Active' : `${openSpots} Spot(s) Open`}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300 my-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-[10px] font-bold text-slate-200 flex items-center justify-center border border-slate-600">
                      {initials}
                    </div>
                    <span>Instructor: <strong className="text-slate-100">{cls.instructor}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cls.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Enrolled: <strong className="text-slate-100">{cls.enrolledCount} / {cls.capacity}</strong> | Queued: <strong className="text-slate-100">{cls.waitlistCount}</strong>
                    </span>
                  </div>
                </div>

                {/* Progress Bar for Class Capacity */}
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 my-3">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isFull ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    style={{ width: `${Math.min(100, (cls.enrolledCount / cls.capacity) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800/80 mt-2">
                <button
                  onClick={() => onSelectClass(isSelected ? null : cls.id)}
                  className={`text-xs px-3 py-1.5 rounded-md transition-all font-medium ${
                    isSelected
                      ? 'bg-slate-200 text-slate-900 font-semibold shadow-sm'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                  aria-label={`Filter waitlist by ${cls.name}`}
                >
                  {isSelected ? 'Selected' : 'Filter Queue'}
                </button>

                <button
                  onClick={() => onOpenSpotAndNotifyNext(cls)}
                  disabled={cls.waitlistCount === 0 || isProcessingId === cls.id}
                  className="corp-button-primary text-xs px-3 py-1.5 disabled:opacity-40"
                  aria-label={`Open spot and trigger Twilio SMS notification job for next in waitlist of ${cls.name}`}
                >
                  <BellRing className={`w-3.5 h-3.5 ${isProcessingId === cls.id ? 'animate-bounce text-amber-500' : ''}`} />
                  <span>{isProcessingId === cls.id ? 'Notifying...' : 'SMS Job'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
