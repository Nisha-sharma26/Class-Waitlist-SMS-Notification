import { useState, useEffect } from 'react';
import type { ClassItem, WaitlistEntry, TwilioSMSLog, TelemetryEvent, TwilioDeliveryMode } from './types';
import { Navbar } from './components/Navbar';
import { NetworkSimulatorBanner } from './components/NetworkSimulatorBanner';
import { StatsBar } from './components/StatsBar';
import { ClassList } from './components/ClassList';
import { WaitlistTable } from './components/WaitlistTable';
import { AddWaitlistModal } from './components/AddWaitlistModal';
import { TwilioLogsDrawer } from './components/TwilioLogsDrawer';
import { TelemetryDrawer } from './components/TelemetryDrawer';
import { ArchitectureModal } from './components/ArchitectureModal';
import { sendWaitlistSMSNotification, getTwilioSMSLogs, clearTwilioSMSLogs, flushOfflineQueue, getOfflineQueueCount } from './services/twilioMockService';
import { logTelemetry, getTelemetryHistory, clearTelemetryHistory } from './utils/telemetry';

// Initial Mock Seed Data
const INITIAL_CLASSES: ClassItem[] = [
  {
    id: 'c-1',
    name: 'Yoga Fusion & Mindfulness',
    schedule: 'Mon / Wed 07:00 AM',
    instructor: 'Elena Rostova',
    capacity: 15,
    enrolledCount: 15,
    waitlistCount: 3,
    status: 'FULL',
    room: 'Studio A (Hot Room)',
    category: 'Mind & Body'
  },
  {
    id: 'c-2',
    name: 'CrossFit High Intensity (HIIT)',
    schedule: 'Tue / Thu 08:30 AM',
    instructor: 'Marcus Vance',
    capacity: 12,
    enrolledCount: 12,
    waitlistCount: 2,
    status: 'FULL',
    room: 'Main Turf Arena',
    category: 'Strength & Conditioning'
  },
  {
    id: 'c-3',
    name: 'Pilates Reformer Core',
    schedule: 'Daily 05:30 PM',
    instructor: 'Sophia Lin',
    capacity: 10,
    enrolledCount: 9,
    waitlistCount: 1,
    status: 'SPOT_OPEN',
    room: 'Reformer Suite 2',
    category: 'Core & Flex'
  },
  {
    id: 'c-4',
    name: 'Spinning Velocity Sprint',
    schedule: 'Fri / Sat 06:00 PM',
    instructor: 'Jake Thorne',
    capacity: 20,
    enrolledCount: 20,
    waitlistCount: 2,
    status: 'FULL',
    room: 'Cycle Amphitheater',
    category: 'Cardio Sprint'
  }
];

const INITIAL_WAITLIST: WaitlistEntry[] = [
  {
    id: 'w-101',
    classId: 'c-1',
    className: 'Yoga Fusion & Mindfulness',
    studentName: 'Sarah Connor',
    phoneNumber: '+14155550199',
    email: 'sarah.c@example.com',
    position: 1,
    dateAdded: new Date(Date.now() - 3600000).toISOString(),
    status: 'WAITING',
    priority: 'VIP',
    notes: 'Prefers front row mat'
  },
  {
    id: 'w-102',
    classId: 'c-1',
    className: 'Yoga Fusion & Mindfulness',
    studentName: 'David Miller',
    phoneNumber: '+12125550144',
    email: 'dmiller@example.com',
    position: 2,
    dateAdded: new Date(Date.now() - 2500000).toISOString(),
    status: 'WAITING',
    priority: 'Member'
  },
  {
    id: 'w-103',
    classId: 'c-1',
    className: 'Yoga Fusion & Mindfulness',
    studentName: 'Amara Patel',
    phoneNumber: '+13125550188',
    email: 'amara.patel@example.com',
    position: 3,
    dateAdded: new Date(Date.now() - 1200000).toISOString(),
    status: 'WAITING',
    priority: 'Standard'
  },
  {
    id: 'w-104',
    classId: 'c-2',
    className: 'CrossFit High Intensity (HIIT)',
    studentName: 'Carlos Rodriguez',
    phoneNumber: '+17865550112',
    email: 'carlos.r@example.com',
    position: 1,
    dateAdded: new Date(Date.now() - 4200000).toISOString(),
    status: 'WAITING',
    priority: 'Member'
  },
  {
    id: 'w-105',
    classId: 'c-2',
    className: 'CrossFit High Intensity (HIIT)',
    studentName: 'Emma Watson',
    phoneNumber: '+16175550177',
    email: 'emma.w@example.com',
    position: 2,
    dateAdded: new Date(Date.now() - 1800000).toISOString(),
    status: 'WAITING',
    priority: 'Standard'
  }
];

export function App() {
  const [classes, setClasses] = useState<ClassItem[]>(INITIAL_CLASSES);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>(INITIAL_WAITLIST);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [networkMode, setNetworkMode] = useState<TwilioDeliveryMode>('SUCCESS');

  // Loading & Async State
  const [isSendingSMSId, setIsSendingSMSId] = useState<string | null>(null);
  const [isProcessingClassId, setIsProcessingClassId] = useState<string | null>(null);
  const [isFlushingQueue, setIsFlushingQueue] = useState(false);

  // Modal & Drawer State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTwilioLogsOpen, setIsTwilioLogsOpen] = useState(false);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const [isArchitectureOpen, setIsArchitectureOpen] = useState(false);

  // Logs & Telemetry
  const [smsLogs, setSmsLogs] = useState<TwilioSMSLog[]>([]);
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  // Sync logs and telemetry
  const refreshLogsAndTelemetry = () => {
    setSmsLogs(getTwilioSMSLogs());
    setTelemetryEvents(getTelemetryHistory());
    setOfflineQueueCount(getOfflineQueueCount());
  };

  useEffect(() => {
    logTelemetry('Application Initialized', { ticket: 'ENG-135180', totalClasses: INITIAL_CLASSES.length });
    refreshLogsAndTelemetry();
  }, []);

  // Recalculate Class waitlist counts
  const updateClassWaitlistCounts = (currentWaitlist: WaitlistEntry[]) => {
    setClasses((prevClasses) =>
      prevClasses.map((cls) => {
        const classWaitlistCount = currentWaitlist.filter(
          (w) => w.classId === cls.id && w.status === 'WAITING'
        ).length;
        return {
          ...cls,
          waitlistCount: classWaitlistCount,
          status: cls.enrolledCount >= cls.capacity ? 'FULL' : 'SPOT_OPEN'
        };
      })
    );
  };

  // Add Student to Waitlist
  const handleAddWaitlistEntry = (entryData: {
    classId: string;
    studentName: string;
    phoneNumber: string;
    email: string;
    priority: 'Standard' | 'VIP' | 'Member';
    notes?: string;
  }) => {
    const targetClass = classes.find((c) => c.id === entryData.classId);
    const className = targetClass ? targetClass.name : 'Fitness Class';

    // Calculate position in queue for this class
    const existingForClass = waitlist.filter((w) => w.classId === entryData.classId && w.status === 'WAITING');
    const newPosition = existingForClass.length + 1;

    const newEntry: WaitlistEntry = {
      id: `w-${Date.now()}`,
      classId: entryData.classId,
      className,
      studentName: entryData.studentName,
      phoneNumber: entryData.phoneNumber,
      email: entryData.email,
      position: newPosition,
      dateAdded: new Date().toISOString(),
      status: 'WAITING',
      priority: entryData.priority,
      notes: entryData.notes
    };

    const updatedWaitlist = [newEntry, ...waitlist];
    setWaitlist(updatedWaitlist);
    updateClassWaitlistCounts(updatedWaitlist);

    logTelemetry('Add Student to Waitlist', {
      entryId: newEntry.id,
      studentName: newEntry.studentName,
      classId: entryData.classId,
      position: newPosition
    });
    refreshLogsAndTelemetry();
  };

  // Trigger Twilio SMS Notification Job
  const handleSendSMS = async (entry: WaitlistEntry) => {
    setIsSendingSMSId(entry.id);
    try {
      const result = await sendWaitlistSMSNotification(entry, networkMode);
      
      if (result.success || networkMode === 'OFFLINE_QUEUE') {
        const updatedWaitlist = waitlist.map((item) => {
          if (item.id === entry.id) {
            return {
              ...item,
              status: 'NOTIFIED' as const,
              lastNotifiedAt: new Date().toISOString(),
              smsMessageSid: result.log.sid
            };
          }
          return item;
        });

        setWaitlist(updatedWaitlist);
      }
    } finally {
      setIsSendingSMSId(null);
      refreshLogsAndTelemetry();
    }
  };

  // Open Spot & Auto-Trigger Twilio SMS Notification Job for #1 in Queue
  const handleOpenSpotAndNotifyNext = async (classItem: ClassItem) => {
    setIsProcessingClassId(classItem.id);
    try {
      // Find top student waiting in line for this class
      const nextStudent = waitlist
        .filter((w) => w.classId === classItem.id && w.status === 'WAITING')
        .sort((a, b) => a.position - b.position)[0];

      if (nextStudent) {
        // Trigger Twilio SMS job for next student
        await sendWaitlistSMSNotification(nextStudent, networkMode);

        // Update student status to NOTIFIED
        const updatedWaitlist = waitlist.map((item) => {
          if (item.id === nextStudent.id) {
            return {
              ...item,
              status: 'NOTIFIED' as const,
              lastNotifiedAt: new Date().toISOString()
            };
          }
          return item;
        });
        setWaitlist(updatedWaitlist);

        // Update class enrolled count if needed
        setClasses((prev) =>
          prev.map((c) =>
            c.id === classItem.id
              ? { ...c, enrolledCount: Math.max(0, c.enrolledCount - 1), status: 'SPOT_OPEN' }
              : c
          )
        );

        logTelemetry('Open Spot & Auto-Trigger SMS Job', {
          classId: classItem.id,
          notifiedStudent: nextStudent.studentName
        });
      }
    } finally {
      setIsProcessingClassId(null);
      refreshLogsAndTelemetry();
    }
  };

  // Claim Spot
  const handleClaimSpot = (entryId: string) => {
    const updatedWaitlist = waitlist.map((item) => {
      if (item.id === entryId) {
        return { ...item, status: 'CLAIMED' as const };
      }
      return item;
    });

    setWaitlist(updatedWaitlist);
    updateClassWaitlistCounts(updatedWaitlist);

    const targetEntry = waitlist.find((w) => w.id === entryId);
    logTelemetry('Mark Spot Claimed', { entryId, studentName: targetEntry?.studentName });
    refreshLogsAndTelemetry();
  };

  // Remove Entry from Waitlist
  const handleRemoveEntry = (entryId: string) => {
    const target = waitlist.find((w) => w.id === entryId);
    const updatedWaitlist = waitlist.filter((w) => w.id !== entryId);

    // Re-index remaining waiting entry positions for that class
    if (target) {
      let pos = 1;
      updatedWaitlist.forEach((w) => {
        if (w.classId === target.classId && w.status === 'WAITING') {
          w.position = pos++;
        }
      });
    }

    setWaitlist(updatedWaitlist);
    updateClassWaitlistCounts(updatedWaitlist);

    logTelemetry('Remove Student from Waitlist', { entryId, studentName: target?.studentName });
    refreshLogsAndTelemetry();
  };

  // Flush Pending Offline Queue
  const handleFlushQueue = async () => {
    setIsFlushingQueue(true);
    try {
      await flushOfflineQueue();
    } finally {
      setIsFlushingQueue(false);
      refreshLogsAndTelemetry();
    }
  };

  // Filtered Waitlist Entries
  const filteredWaitlist = waitlist.filter((entry) => {
    // Class filter
    if (selectedClassId && entry.classId !== selectedClassId) return false;

    // Status filter
    if (statusFilter !== 'ALL' && entry.status !== statusFilter) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = entry.studentName.toLowerCase().includes(q);
      const phoneMatch = entry.phoneNumber.toLowerCase().includes(q);
      const classMatch = entry.className.toLowerCase().includes(q);
      return nameMatch || phoneMatch || classMatch;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Primary Header Navbar */}
      <Navbar
        networkMode={networkMode}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenTwilioLogs={() => setIsTwilioLogsOpen(true)}
        onOpenTelemetry={() => setIsTelemetryOpen(true)}
        onOpenArchitecture={() => setIsArchitectureOpen(true)}
        smsLogCount={smsLogs.length}
        telemetryCount={telemetryEvents.length}
      />

      {/* Network & Twilio Delivery Simulator Bar */}
      <NetworkSimulatorBanner
        currentMode={networkMode}
        onModeChange={(mode) => {
          setNetworkMode(mode);
          logTelemetry('Switch Network Mode', { mode });
          refreshLogsAndTelemetry();
        }}
        offlineQueueCount={offlineQueueCount}
        onFlushQueue={handleFlushQueue}
        isFlushing={isFlushingQueue}
      />

      {/* Main Dashboard Container - Full Screen Laptop Width */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-10 py-4 sm:py-8 space-y-6">
        {/* Executive Stats Summary Cards */}
        <StatsBar classes={classes} waitlist={waitlist} smsLogs={smsLogs} />

        {/* Active Class Cards Grid */}
        <ClassList
          classes={classes}
          selectedClassId={selectedClassId}
          onSelectClass={(id) => {
            setSelectedClassId(id);
            logTelemetry('Filter Class Waitlist View', { classId: id });
            refreshLogsAndTelemetry();
          }}
          onOpenSpotAndNotifyNext={handleOpenSpotAndNotifyNext}
          isProcessingId={isProcessingClassId}
        />

        {/* Waitlist Queue Table */}
        <WaitlistTable
          entries={filteredWaitlist}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            logTelemetry('Search Waitlist Queue', { query: q });
            refreshLogsAndTelemetry();
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={(st) => {
            setStatusFilter(st);
            logTelemetry('Filter Status Queue', { status: st });
            refreshLogsAndTelemetry();
          }}
          onSendSMS={handleSendSMS}
          onClaimSpot={handleClaimSpot}
          onRemoveEntry={handleRemoveEntry}
          isSendingSMSId={isSendingSMSId}
          networkLoading={networkMode === 'SLOW_3G' && isSendingSMSId !== null}
        />
      </main>

      {/* Footer - Full Screen */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 sm:px-8 lg:px-10 py-4 text-center text-xs text-slate-500">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-2">
          <span>PulseFit Club Floor Operations & Waitlist System • Ticket ENG-135180</span>
          <span>Twilio SMS Notification Job Engine (Mock) • 100% WCAG a11y Compliant</span>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <AddWaitlistModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        classes={classes}
        defaultClassId={selectedClassId || undefined}
        onAddEntry={handleAddWaitlistEntry}
      />

      <TwilioLogsDrawer
        isOpen={isTwilioLogsOpen}
        onClose={() => setIsTwilioLogsOpen(false)}
        logs={smsLogs}
        onClearLogs={() => {
          clearTwilioSMSLogs();
          refreshLogsAndTelemetry();
        }}
      />

      <TelemetryDrawer
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        telemetryEvents={telemetryEvents}
        onClearTelemetry={() => {
          clearTelemetryHistory();
          refreshLogsAndTelemetry();
        }}
      />

      <ArchitectureModal
        isOpen={isArchitectureOpen}
        onClose={() => setIsArchitectureOpen(false)}
      />
    </div>
  );
}

export default App;
