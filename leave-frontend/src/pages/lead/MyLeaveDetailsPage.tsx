import  { useEffect, useState } from 'react';
import api from '../../api/axios';

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

interface LeaveHistory {
  id: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
}

type SortKey = 'startDate' | 'status' | null;

export default function LeaveDashboard() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [history, setHistory] = useState<LeaveHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<LeaveHistory[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>(null);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/leave-dashboard');
        setBalances(res.data.balances);
        setHistory(res.data.history);
        setFilteredHistory(res.data.history);
      } catch (err) {
        console.error('Failed to fetch leave dashboard:', err);
      }
    };
    fetchData();
  }, []);

  // Cancel handler
  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) return;
    try {
      await api.patch(`/leave-requests/${id}/cancel`);
      const updatedHistory = history.map((item) =>
        item.id === id ? { ...item, status: 'cancelled' as const } : item
      );
      setHistory(updatedHistory);
    } catch (err) {
      console.error('Failed to cancel leave request:', err);
      alert('Unable to cancel. Please try again.');
    }
  };

  // Filter and sort
  useEffect(() => {
    let filtered = [...history];

    if (statusFilter !== 'all') {
      filtered = filtered.filter((item) => item.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.reason.toLowerCase().includes(lowerSearch) ||
          item.leaveType?.name.toLowerCase().includes(lowerSearch)
      );
    }

    if (sortKey) {
      filtered.sort((a, b) => {
        let valA, valB;
        if (sortKey === 'startDate') {
          valA = new Date(a.startDate).getTime();
          valB = new Date(b.startDate).getTime();
        } else if (sortKey === 'status') {
          valA = a.status;
          valB = b.status;
        } else {
          valA = '';
          valB = '';
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
    }

    setFilteredHistory(filtered);
  }, [history, statusFilter, searchTerm, sortKey, sortAsc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      {/* Leave Balances */}
      <div className="mb-10">
        <h3 className="text-2xl font-semibold mb-4 text-gray-700">Leave Balances</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {balances.map((b) => (
            <div key={b.id} className="bg-white shadow rounded-lg p-5 border border-gray-200">
              <h4 className="text-lg font-bold text-blue-700 mb-1">{b.leaveType?.name || 'N/A'}</h4>
              <p className="text-sm text-gray-600">Total: {b.totalDays}</p>
              <p className="text-sm text-gray-600">Used: {b.usedDays}</p>
              <p className="text-sm font-semibold text-green-700">Remaining: {b.remainingDays}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <label className="mr-2 font-semibold text-gray-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded p-1"
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <input
            type="text"
            placeholder="Search by Reason or Type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded p-2 w-60"
          />
        </div>
      </div>

      {/* Leave History */}
      <div>
        <h3 className="text-2xl font-semibold mb-4 text-gray-700">Leave History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg border border-gray-200">
            <thead className="bg-blue-100 text-gray-700 cursor-pointer">
              <tr>
                <th className="px-4 py-2 text-left" onClick={() => handleSort(null)} title="No sorting">Type</th>
                <th className="px-4 py-2 text-left" onClick={() => handleSort('startDate')}>
                  Start {sortKey === 'startDate' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="px-4 py-2 text-left">End</th>
                <th className="px-4 py-2 text-left">Days</th>
                <th className="px-4 py-2 text-left">Reason</th>
                <th className="px-4 py-2 text-left" onClick={() => handleSort('status')}>
                  Status {sortKey === 'status' ? (sortAsc ? '▲' : '▼') : ''}
                </th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{req.leaveType?.name || 'N/A'}</td>
                    <td className="px-4 py-2">{req.startDate.slice(0, 10)}</td>
                    <td className="px-4 py-2">{req.endDate.slice(0, 10)}</td>
                    <td className="px-4 py-2">{req.totalDays}</td>
                    <td className="px-4 py-2 truncate max-w-xs" title={req.reason}>
                      {req.reason.length > 30 ? req.reason.slice(0, 30) + '…' : req.reason}
                    </td>
                    <td
                      className={`px-4 py-2 font-medium ${
                        req.status === 'approved'
                          ? 'text-green-600'
                          : req.status === 'pending'
                          ? 'text-yellow-600'
                          : req.status === 'rejected'
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {req.status}
                    </td>
                    <td className="px-4 py-2">
                      {req.status === 'pending' && (
                        <button
                          onClick={() => handleCancel(req.id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500">
                    No leave history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
