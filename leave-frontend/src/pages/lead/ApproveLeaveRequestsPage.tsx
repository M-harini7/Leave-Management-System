import React, { useEffect, useState } from 'react';
import api from '../../api/axios';

interface Employee {
  name: string;
}

interface LeaveType {
  name: string;
}

interface LeaveRequest {
  employee: Employee;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
}

interface LeaveApproval {
  id: number;
  leaveRequest: LeaveRequest;
  remarks: string | null;
  status: 'pending' | 'approved' | 'rejected';
}

interface Summary {
  pending: number;
  approved: number;
  rejected: number;
}

const ITEMS_PER_PAGE = 10;

export default function LeaveApprovalPage() {
  const [pendingApprovals, setPendingApprovals] = useState<LeaveApproval[]>([]);
  const [processedApprovals, setProcessedApprovals] = useState<LeaveApproval[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'processed'>('pending');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [modalData, setModalData] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchApprovals();
    fetchSummary();
  }, []);

  const fetchApprovals = async () => {
    setLoading(true);
    try {
      const [pendingRes, processedRes] = await Promise.all([
        api.get<LeaveApproval[]>('/api/approvals/pending'),
        api.get<LeaveApproval[]>('/api/approvals/processed'),
      ]);
      setPendingApprovals(pendingRes.data);
      setProcessedApprovals(processedRes.data);
    } catch (err) {
      alert('Error fetching approvals.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get<Summary>('/approver-summary');
      setSummary(res.data);
    } catch {
      alert('Failed to load summary.');
    }
  };

  const handleOpenModal = (id: number, action: 'approve' | 'reject') => {
    setModalData({ id, action });
    setRemarks('');
  };

  const handleConfirm = async () => {
    if (!modalData ) return;
    try {
      await api.post('/leave-approval/action', {
        leaveApprovalId: modalData.id,
        action: modalData.action,
        remarks,
      });
      setModalData(null);
      fetchApprovals();
      fetchSummary();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Action failed');
    }
  };

  const handleCloseModal = () => {
    setModalData(null);
    setRemarks('');
  };

  const getPaginatedData = (data: LeaveApproval[]) => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return data.slice(start, start + ITEMS_PER_PAGE);
  };

  const totalPages = Math.ceil(
    (activeTab === 'pending' ? pendingApprovals.length : processedApprovals.length) / ITEMS_PER_PAGE
  );

  const renderTable = (approvals: LeaveApproval[], isPending: boolean) => (
    <div className="overflow-x-auto rounded shadow">
      <table className="min-w-full bg-white border">
        <thead className="bg-gray-100 text-sm text-gray-700">
          <tr>
            <th className="py-3 px-4 text-left">Employee</th>
            <th className="py-3 px-4 text-left">Type</th>
            <th className="py-3 px-4 text-left">From</th>
            <th className="py-3 px-4 text-left">To</th>
            <th className="py-3 px-4 text-left">Days</th>
            {!isPending && <th className="py-3 px-4 text-left">Remarks</th>}
            <th className="py-3 px-4 text-left">Status</th>
            {isPending && <th className="py-3 px-4 text-center">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {getPaginatedData(approvals).map((approval, idx) => (
            <tr key={approval.id} className={`border-t text-sm ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
              <td className="px-4 py-2">{approval.leaveRequest.employee.name}</td>
              <td className="px-4 py-2">{approval.leaveRequest.leaveType.name}</td>
              <td className="px-4 py-2">{approval.leaveRequest.startDate.slice(0, 10)}</td>
              <td className="px-4 py-2">{approval.leaveRequest.endDate.slice(0, 10)}</td>
              <td className="px-4 py-2">{approval.leaveRequest.totalDays}</td>
              {!isPending && (<td className="px-4 py-2 text-gray-600">{approval.remarks}</td>)}
              <td className="px-4 py-2 capitalize font-medium">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    approval.status === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : approval.status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {approval.status}
                </span>
              </td>
              {isPending && (
                <td className="px-4 py-2 flex space-x-2 justify-center">
                  <button
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded shadow"
                    onClick={() => handleOpenModal(approval.id, 'approve')}
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow"
                    onClick={() => handleOpenModal(approval.id, 'reject')}
                  >
                    Reject
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Pending Approvals</h3>
            <p className="text-2xl">{summary.pending}</p>
          </div>
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Approved</h3>
            <p className="text-2xl">{summary.approved}</p>
          </div>
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow">
            <h3 className="text-lg font-semibold">Rejected</h3>
            <p className="text-2xl">{summary.rejected}</p>
          </div>
        </div>
      )}

      <div className="flex justify-center space-x-4 mb-6">
        <button
          className={`px-5 py-2 font-semibold rounded-full transition ${
            activeTab === 'pending'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
          onClick={() => {
            setActiveTab('pending');
            setCurrentPage(1);
          }}
        >
          Pending
        </button>
        <button
          className={`px-5 py-2 font-semibold rounded-full transition ${
            activeTab === 'processed'
              ? 'bg-blue-600 text-white shadow-md'
              : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
          onClick={() => {
            setActiveTab('processed');
            setCurrentPage(1);
          }}
        >
          Processed
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading approvals...</p>
      ) : activeTab === 'pending' ? (
        pendingApprovals.length > 0 ? (
          <>
            {renderTable(pendingApprovals, true)}
            <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
          </>
        ) : (
          <p className="text-center text-gray-600">No pending approvals.</p>
        )
      ) : processedApprovals.length > 0 ? (
        <>
          {renderTable(processedApprovals, false)}
          <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={setCurrentPage} />
        </>
      ) : (
        <p className="text-center text-gray-600">No processed approvals.</p>
      )}

      {/* Modal */}
      {modalData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 space-y-4">
            <h2 className="text-lg font-bold text-gray-800 capitalize">Confirm {modalData.action}</h2>
            <textarea
              placeholder="Enter remarks..."
              className="w-full p-2 border rounded focus:outline-none focus:ring"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded text-white ${
                  modalData.action === 'approve' ? 'bg-green-600' : 'bg-red-600'
                } hover:opacity-90`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const Pagination = ({
  totalPages,
  currentPage,
  onPageChange,
}: {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) => {
  return (
    <div className="flex justify-center mt-4 space-x-2">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`px-3 py-1 rounded border ${
            page === currentPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-800'
          }`}
        >
          {page}
        </button>
      ))}
    </div>
  );
};
