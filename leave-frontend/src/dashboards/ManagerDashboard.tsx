import { useState, useEffect } from 'react';
import TeamMembersPage from '../pages/lead/TeamMembersPage';
import MyTotalLeaveBalancePage from '../pages/lead/MyLeaveDetailsPage';
import LeaveCalendarPage from '../pages/lead/LeaveCalendarPage';
import ApproveLeaveRequestsPage from '../pages/lead/ApproveLeaveRequestsPage';
import LeaveRequestFormPage from '../pages/lead/LeaveRequestFormPage';
import TeamMemberLeaveDetails from '../pages/lead/TeamLeaveDetailsPage';

type TabKey =
  | 'teamMembers'
  | 'myLeaveDetails'
  | 'leaveCalendar'
  | 'approveLeaves'
  | 'leaveRequestForm'
  | 'teamLeaveDetails';

interface UserInfo {
  name: string;
  role: string;
}

const ManagerDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('teamMembers');
  const [user, setUser] = useState<UserInfo>({ name: '', role: '' });

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
        <h1 className="text-2xl font-extrabold mb-8 tracking-wide">Manager Dashboard</h1>
        <nav className="flex flex-col gap-4 flex-grow">
          {[
            { key: 'teamMembers', label: 'Team Members' },
            { key: 'myLeaveDetails', label: 'My Leave Details' },
            { key: 'leaveCalendar', label: 'Leave Calendar' },
            { key: 'approveLeaves', label: 'Approve/Reject Requests' },
            { key: 'leaveRequestForm', label: 'Leave Request Form' },
            { key: 'teamLeaveDetails', label: 'Team Leave Details' },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key as TabKey)}
              className={`text-left px-4 py-3 rounded-md font-semibold transition-colors duration-300 ${
                activeTab === item.key ? 'bg-gray-700 shadow-inner' : 'hover:bg-gray-700/80'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto pt-6 border-t border-gray-700 text-gray-400 text-sm">
          © 2025 Our Company
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto bg-white">
        {/* Header */}
        <div className="flex justify-end items-center mb-8 border-b border-gray-200 pb-4 shadow-sm">
        <h2 className="text-3xl font-bold capitalize tracking-wide">
            {activeTab.replace(/([A-Z])/g, ' $1')}
          </h2>
            {/* User Info */}
            <div className="flex items-center gap-3 text-right">
              <div className="w-10 h-10 rounded-full bg-yellow-500 text-gray-900 flex items-center justify-center font-bold text-lg select-none">
                {getInitials(user.name)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>

            {/* Logout Button */}
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

        {/* Page Content */}
        {activeTab === 'teamMembers' && <TeamMembersPage />}
        {activeTab === 'myLeaveDetails' && <MyTotalLeaveBalancePage />}
        {activeTab === 'leaveCalendar' && <LeaveCalendarPage />}
        {activeTab === 'approveLeaves' && <ApproveLeaveRequestsPage />}
        {activeTab === 'leaveRequestForm' && <LeaveRequestFormPage />}
        {activeTab === 'teamLeaveDetails' && <TeamMemberLeaveDetails />}
      </main>
    </div>
  );
};

export default ManagerDashboard;
