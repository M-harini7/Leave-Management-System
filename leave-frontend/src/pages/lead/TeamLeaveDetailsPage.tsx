import { useEffect, useState } from 'react';
import api from '../../api/axios';

interface TeamMember {
  id: number;
  name: string;
}

interface LeaveType {
  name: string;
}

interface LeaveBalance {
  id: number;
  leaveType: LeaveType;
  totalDays: number;
  usedDays: number;
  remainingDays: number;
}

interface LeaveDetail {
  id: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
}

const getStatusBadgeClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

export default function TeamMemberLeaveDetails() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [leaveDetails, setLeaveDetails] = useState<LeaveDetail[]>([]);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    api.get('/employees/team-members')
      .then((res) => setTeamMembers(res.data))
      .catch((err) => console.error('Error fetching team members:', err));
  }, []);

  useEffect(() => {
    if (selectedId) {
      Promise.all([
        api.get(`/leave-balances/${selectedId}`),
        api.get(`/leaves/employee/${selectedId}`)
      ])
        .then(([balRes, detailRes]) => {
          setLeaveBalance(balRes.data);
          setLeaveDetails(detailRes.data);
        })
        .catch((err) => console.error('Error fetching leave data:', err));
    }
  }, [selectedId]);

  const filteredDetails = leaveDetails.filter((l) =>
    statusFilter ? l.status.toLowerCase() === statusFilter : true
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Select Team Member */}
      <div className="bg-white rounded shadow p-4 border">
        <label className="block text-sm font-medium text-teal-700 mb-2">Select Team Member</label>
        <select
          onChange={(e) => setSelectedId(Number(e.target.value))}
          value={selectedId ?? ''}
          className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="" disabled>Select a member</option>
          {teamMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      {/* Leave Balance Cards */}
      {leaveBalance.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {leaveBalance.map((bal) => (
            <div
              key={bal.id}
              className="bg-teal-50 border border-teal-200 rounded-lg p-4 shadow-sm"
            >
              <h3 className="text-sm font-semibold text-teal-800">
                {bal.leaveType?.name || 'Unknown'}
              </h3>
              <p className="text-xs mt-1 text-gray-600">Total: {bal.totalDays}</p>
              <p className="text-xs text-gray-600">Used: {bal.usedDays}</p>
              <p className="text-xs font-medium text-gray-900">
                Remaining: {bal.remainingDays}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Leave History Filter + Table */}
      {leaveDetails.length > 0 && (
        <div className="bg-white rounded shadow border p-4">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <h2 className="text-lg font-semibold text-teal-700">Leave History</h2>
            <select
              className="border px-3 py-2 rounded text-sm"
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="border px-4 py-2 text-left">Leave Type</th>
                  <th className="border px-4 py-2 text-left">Start Date</th>
                  <th className="border px-4 py-2 text-left">End Date</th>
                  <th className="border px-4 py-2 text-left">Reason</th>
                  <th className="border px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredDetails.length > 0 ? (
                  filteredDetails.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{leave.leaveType?.name}</td>
                      <td className="border px-4 py-2">{leave.startDate}</td>
                      <td className="border px-4 py-2">{leave.endDate}</td>
                      <td className="border px-4 py-2">{leave.reason}</td>
                      <td className="border px-4 py-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(leave.status)}`}>
                          {leave.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500">
                      No records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
