import React, { useEffect, useState } from 'react';
import TeamMembersPage from '../pages/lead/TeamMembersPage';
import MyTotalLeaveBalancePage from '../pages/lead/MyLeaveDetailsPage';
import LeaveCalendarPage from '../pages/lead/LeaveCalendarPage';
import LeaveRequestFormPage from '../pages/lead/LeaveRequestFormPage';
import TeamMemberLeaveDetails from '../pages/lead/TeamLeaveDetailsPage';

interface IUser {
  name: string;
  role: string;
}

const DeveloperDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('teamMembers');
  const [user, setUser] = useState<IUser>({ name: '', role: '' });

  useEffect(() => {
    const name = localStorage.getItem('name');
    const role = localStorage.getItem('role');
    if (name && role) {
      setUser({ name, role });
    }
  }, []);

  const getInitials = (name: string): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-gray-100 p-6 rounded-r-lg shadow-md flex flex-col">
        <h1 className="text-2xl font-extrabold mb-8 tracking-wide">Developer Dashboard</h1>
        <nav className="flex flex-col gap-4 flex-grow">
          <button onClick={() => setActiveTab('teamMembers')} className={`text-left px-4 py-3 rounded-md font-semibold transition-colors duration-300 ${activeTab === 'teamMembers' ? 'bg-gray-700 shadow-inner' : 'hover:bg-gray-700/80'}`}>Team Members</button>
          <button onClick={() => setActiveTab('myLeaveDetails')} className={`text-left px-4 py-3 rounded-md font-semibold transition-colors duration-300 ${activeTab === 'myLeaveDetails' ? 'bg-gray-700 shadow-inner' : 'hover:bg-gray-700/80'}`}>My Leave Details</button>
          <button onClick={() => setActiveTab('leaveCalendar')} className={`text-left px-4 py-3 rounded-md font-semibold transition-colors duration-300 ${activeTab === 'leaveCalendar' ? 'bg-gray-700 shadow-inner' : 'hover:bg-gray-700/80'}`}>Leave Calendar</button>
          <button onClick={() => setActiveTab('leaveRequestForm')} className={`text-left px-4 py-3 rounded-md font-semibold transition-colors duration-300 ${activeTab === 'leaveRequestForm' ? 'bg-gray-700 shadow-inner' : 'hover:bg-gray-700/80'}`}>Leave Request Form</button>
          <button onClick={() => setActiveTab('teamLeaveDetails')} className={`text-left px-4 py-3 rounded-md font-semibold transition-colors duration-300 ${activeTab === 'teamLeaveDetails' ? 'bg-gray-700 shadow-inner' : 'hover:bg-gray-700/80'}`}>Team Leave Details</button>
        </nav>
        <div className="mt-auto pt-6 border-t border-gray-700 text-gray-400 text-sm">
          © 2025 Our Company
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto bg-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4 shadow-sm">
          <h2 className="text-3xl font-bold capitalize tracking-wide">
            {activeTab.replace(/([A-Z])/g, ' $1')}
          </h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 text-right">
              <div className="w-10 h-10 rounded-full bg-yellow-500 text-gray-900 flex items-center justify-center font-bold text-lg select-none">
                {getInitials(user.name)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
            <button
              className="bg-red-600 hover:bg-red-700 transition-colors text-white px-5 py-2 rounded-md shadow-md"
              onClick={() => {
                localStorage.clear();
                window.location.href = '/auth';
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Page Content */}
        {activeTab === 'teamMembers' && <TeamMembersPage />}
        {activeTab === 'myLeaveDetails' && <MyTotalLeaveBalancePage />}
        {activeTab === 'leaveCalendar' && <LeaveCalendarPage />}
        {activeTab === 'leaveRequestForm' && <LeaveRequestFormPage />}
        {activeTab === 'teamLeaveDetails' && <TeamMemberLeaveDetails />}
      </main>
    </div>
  );
};

export default DeveloperDashboard;
