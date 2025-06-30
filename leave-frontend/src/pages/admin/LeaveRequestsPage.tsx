import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

const ITEMS_PER_PAGE = 10;

interface IEmployee {
  id: number;
  name: string;
}

interface ILeaveType {
  id: number;
  name: string;
}

type LeaveStatus = 'pending' | 'approved' | 'rejected' | string;

interface LeaveRequest {
  id: number;
  employee?: IEmployee | null;
  leaveType?: ILeaveType | null;
  startDate: string;
  endDate: string;
  status: LeaveStatus;
}

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
};

const LeaveRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [filtered, setFiltered] = useState<LeaveRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | ''>('');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<number | ''>('');
  const [leaveTypes, setLeaveTypes] = useState<ILeaveType[]>([]);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => {
    api.get<LeaveRequest[]>('/leave-request').then((res) => {
      const sorted = res.data.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
      setRequests(sorted);
      setFiltered(sorted);
    });
    api.get<ILeaveType[]>('/leave-types').then((res) => setLeaveTypes(res.data));
  }, []);

  useEffect(() => {
    let result = [...requests];

    if (statusFilter) {
      result = result.filter((r) => r.status === statusFilter);
    }

    if (leaveTypeFilter) {
      result = result.filter((r) => r.leaveType?.id === leaveTypeFilter);
    }

    if (search) {
      result = result.filter((r) =>
        r.employee?.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (fromDate) {
      result = result.filter((r) => new Date(r.startDate) >= new Date(fromDate));
    }

    if (toDate) {
      result = result.filter((r) => new Date(r.endDate) <= new Date(toDate));
    }

    setFiltered(result);
    setCurrentPage(1);
  }, [statusFilter, leaveTypeFilter, search, fromDate, toDate, requests]);

  const clearFilters = () => {
    setStatusFilter('');
    setLeaveTypeFilter('');
    setSearch('');
    setFromDate('');
    setToDate('');
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const statusBadge = (status: LeaveStatus) => {
    const base = 'px-2 py-1 rounded-full text-xs font-medium';
    if (status === 'pending')
      return <span className={`${base} bg-yellow-200 text-yellow-800`}>Pending</span>;
    if (status === 'approved')
      return <span className={`${base} bg-green-200 text-green-800`}>Approved</span>;
    if (status === 'rejected')
      return <span className={`${base} bg-red-200 text-red-800`}>Rejected</span>;
    return <span className={`${base} bg-gray-200 text-gray-800`}>{status}</span>;
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-100 p-4 rounded shadow">
          Pending: {requests.filter((r) => r.status === 'pending').length}
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          Approved: {requests.filter((r) => r.status === 'approved').length}
        </div>
        <div className="bg-red-100 p-4 rounded shadow">
          Rejected: {requests.filter((r) => r.status === 'rejected').length}
        </div>
      </div>

      {/* Filters with Labels */}
      <div className="flex flex-wrap gap-4 items-end mb-4">
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Search by Name</label>
          <input
            type="text"
            placeholder="e.g. John"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded w-48"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as LeaveStatus | '')}
            className="border px-3 py-2 rounded w-40"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Leave Type</label>
          <select
            value={leaveTypeFilter}
            onChange={(e) => setLeaveTypeFilter(Number(e.target.value) || '')}
            className="border px-3 py-2 rounded w-44"
          >
            <option value="">All Types</option>
            {leaveTypes.map((lt) => (
              <option key={lt.id} value={lt.id}>
                {lt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border px-3 py-2 rounded w-36"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border px-3 py-2 rounded w-36"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={clearFilters}
            className="bg-gray-200 text-sm px-3 py-2 rounded hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <table className="w-full table-auto border mb-4 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">User</th>
            <th className="border px-4 py-2 text-left">Type</th>
            <th className="border px-4 py-2 text-left">Start</th>
            <th className="border px-4 py-2 text-left">End</th>
            <th className="border px-4 py-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((r) => (
            <tr key={r.id} className="border-t hover:bg-gray-50">
              <td className="px-4 py-2">{r.employee?.name ?? '-'}</td>
              <td className="px-4 py-2">{r.leaveType?.name ?? '-'}</td>
              <td className="px-4 py-2">{formatDate(r.startDate)}</td>
              <td className="px-4 py-2">{formatDate(r.endDate)}</td>
              <td className="px-4 py-2">{statusBadge(r.status)}</td>
            </tr>
          ))}
          {paginated.length === 0 && (
            <tr>
              <td colSpan={5} className="text-center py-4 text-gray-400">
                No results found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing {paginated.length} of {filtered.length} results
        </p>
        <div className="flex items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestsPage;
