import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventClickArg, DatesSetArg } from '@fullcalendar/core';
import api from '../../api/axios';
import { Tooltip } from 'react-tooltip';
interface LeaveEventRaw {
  id: number;
  status: string;
  start: string;
  end: string;
  employeeName: string;
  leaveTypeName: string;
  description?: string;
}

interface LeaveType {
  id: number;
  name: string;
}

export default function LeaveCalendar() {
  const [eventsRaw, setEventsRaw] = useState<LeaveEventRaw[]>([]);
  const [employeeNames, setEmployeeNames] = useState<string[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState('All');
  const [selectedLeaveType, setSelectedLeaveType] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState<LeaveEventRaw | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [currentRange, setCurrentRange] = useState<{ start: Date; end: Date } | null>(null);

  const LEAVE_TYPE_COLORS = [
    '#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
  ];

  useEffect(() => {
    (async () => {
      const [evRes, empRes, leaveTypeRes] = await Promise.all([
        api.get<LeaveEventRaw[]>('/api/calendar/team'),
        api.get<{ name: string }[]>('/employees/team-members'),
        api.get<LeaveType[]>('/leave-types'),
      ]);
      setEventsRaw(evRes.data.filter(e => e.status === 'approved'));
      setEmployeeNames(empRes.data.map(e => e.name));
      setLeaveTypes(leaveTypeRes.data);
    })();
  }, []);

  const leaveTypeColorMap: Record<string, string> = {};
  leaveTypes.forEach((lt, index) => {
    leaveTypeColorMap[lt.name] = LEAVE_TYPE_COLORS[index % LEAVE_TYPE_COLORS.length];
  });

  const getFilteredLeaveEvents = () => {
    const filtered: any[] = [];
  
    eventsRaw
      .filter(e =>
        (selectedEmployee === 'All' || e.employeeName === selectedEmployee) &&
        (selectedLeaveType === 'All' || e.leaveTypeName === selectedLeaveType)
      )
      .forEach(e => {
        const start = new Date(e.start);
        const end = new Date(e.end);
        let current = new Date(start);
  
        while (current <= end) {
          const day = current.getDay();
          if (day !== 0 && day !== 6) {
            filtered.push({
              id: `${e.id}-${current.toISOString().split('T')[0]}`, // make unique ID per day
              title: e.employeeName,
              start: new Date(current),
              end: new Date(current),
              allDay: true,
              backgroundColor: leaveTypeColorMap[e.leaveTypeName] || '#9ca3af',
              borderColor: leaveTypeColorMap[e.leaveTypeName] || '#9ca3af',
              extendedProps: {
                description: e.description,
                leaveTypeName: e.leaveTypeName,
              },
            });
          }
          current.setDate(current.getDate() + 1);
        }
      });
  
    return filtered;
  };
  

  const generateWeeklyOffEvents = (start: Date, end: Date) => {
    const offs: any[] = [];
    const current = new Date(start);
    while (current <= end) {
      if (current.getDay() === 0 || current.getDay() === 6) {
        offs.push({
          id: `weekly-off-${current.toISOString()}`,
          title: 'Weekly Off',
          start: new Date(current),
          allDay: true,
          backgroundColor: '#F3F4F6',
          textColor: '#4B5563',
        });
      }
      current.setDate(current.getDate() + 1);
    }
    return offs;
  };

  const updateCalendarEvents = (start: Date, end: Date) => {
    const leaveEvents = getFilteredLeaveEvents();
    const weeklyOffs = generateWeeklyOffEvents(start, end);
    setCalendarEvents([...leaveEvents, ...weeklyOffs]);
  };

  const handleDatesSet = (arg: DatesSetArg) => {
    setCurrentRange({ start: arg.start, end: arg.end });
    updateCalendarEvents(arg.start, arg.end);
  };

  useEffect(() => {
    if (currentRange) {
      updateCalendarEvents(currentRange.start, currentRange.end);
    }
  }, [selectedEmployee, selectedLeaveType, eventsRaw, currentRange]);

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Filters */}
      <div className="flex justify-center gap-6 mb-6">
        <div>
          <label className="block font-medium mb-1">Team Member</label>
          <select
            value={selectedEmployee}
            onChange={e => setSelectedEmployee(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            <option value="All">All</option>
            {employeeNames.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Leave Type</label>
          <select
            value={selectedLeaveType}
            onChange={e => setSelectedLeaveType(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            <option value="All">All</option>
            {leaveTypes.map(type => (
              <option key={type.id} value={type.name}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calendar */}
      <FullCalendar
  plugins={[dayGridPlugin, interactionPlugin]}
  initialView="dayGridMonth"
  headerToolbar={{ left: 'prev,next today', center: 'title', right: '' }}
  events={calendarEvents}
  datesSet={handleDatesSet}
  height="auto"
  eventContent={renderEventContent}
/>


      {/* Popup */}
      {selectedEvent && (
        <div
          onClick={() => setSelectedEvent(null)}
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full"
          >
            <h3 className="text-lg font-semibold mb-2">{selectedEvent.employeeName}</h3>
            <p><strong>Leave Type:</strong> {selectedEvent.leaveTypeName}</p>
            <p><strong>Start:</strong> {new Date(selectedEvent.start).toLocaleDateString()}</p>
            <p><strong>End:</strong> {new Date(selectedEvent.end).toLocaleDateString()}</p>
            {selectedEvent.description && <p className="mt-2">{selectedEvent.description}</p>}
            <button
              onClick={() => setSelectedEvent(null)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function renderEventContent(eventInfo: any) {
  const { leaveTypeName } = eventInfo.event.extendedProps;
  const start = new Date(eventInfo.event.start).toLocaleDateString();
  const end = new Date(eventInfo.event.end).toLocaleDateString();

  const tooltipId = `tooltip-${eventInfo.event.id}`;
  const tooltipContent = `Leave Type: ${leaveTypeName}\nStart Date: ${start}\nEnd Date: ${end}`;

  return (
    <>
      <div
        data-tooltip-id={tooltipId}
        data-tooltip-content={tooltipContent}
        className="text-sm text-center cursor-pointer"
      >
        {eventInfo.event.title}
      </div>
      <Tooltip
        id={tooltipId}
        place="top"
        className="max-w-xs whitespace-pre-line text-left text-sm"
      />
    </>
  );
}
