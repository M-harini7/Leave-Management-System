import React, { useEffect, useState, Fragment, ChangeEvent, FormEvent } from 'react';
import api from '../../api/axios'; 
import { Dialog, Transition } from '@headlessui/react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => (
  <div
    className={`fixed bottom-4 right-4 px-4 py-2 rounded shadow-lg text-white font-semibold
    ${type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}
  >
    {message}
    <button
      onClick={onClose}
      className="ml-4 font-bold hover:text-gray-300"
      aria-label="Close notification"
    >
      ×
    </button>
  </div>
);

const TAB_KEYS = {
  LEAVE_TYPES: 'leaveTypes',
  TEAMS: 'teams',
  ROLES: 'roles',
} as const;

type TabKey = typeof TAB_KEYS[keyof typeof TAB_KEYS];

interface Team {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
}

interface LeaveType {
  id: number;
  name: string;
  totalDays: number;
  approvalLevels: number;
  autoApprove: boolean;
  description?: string;
  applicableGender?: '' | 'male' | 'female';
}
// Union type for form data (partial, as fields differ)
type FormData = Partial<Team & Role & LeaveType> & { id?: number };

const ManageSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>(TAB_KEYS.LEAVE_TYPES);
  // Data states
  const [teams, setTeams] = useState<Team[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  // UI states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastProps | null>(null);
  // Modal state and form data
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [modalEntity, setModalEntity] = useState<TabKey | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  // Fetch data from API
  const fetchData = async () => {
    setLoading(true);
    try {
      const [teamsRes, rolesRes, leaveTypesRes] = await Promise.all([
        api.get<{ teams: Team[] }>('/teams'),
        api.get<Role[]>('/roles'),
        api.get<LeaveType[]>('/leave-types'),
      ]);
      setTeams(Array.isArray(teamsRes.data.teams) ? teamsRes.data.teams : []);
      setRoles(Array.isArray(rolesRes.data) ? rolesRes.data : []);
      setLeaveTypes(Array.isArray(leaveTypesRes.data) ? leaveTypesRes.data : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  // Open modal
  const openModal = (entity: TabKey, mode: 'add' | 'edit', item: FormData | null = null) => {
    setModalEntity(entity);
    setModalMode(mode);
    if (mode === 'edit' && item) {
      setFormData(item);
    } else {
      setFormData({});
    }
    setModalOpen(true);
  };
  // Close modal
  const closeModal = () => {
    setModalOpen(false);
    setFormData({});
  };
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  // Delete handler with confirmation
  const handleDelete = async (entity: TabKey, id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const route = getApiRoute(entity);
      await api.delete(`/${route}/${id}`);
      setToast({ message: `${name} deleted successfully`, type: 'success', onClose: () => setToast(null) });
      fetchData();
    } catch (err) {
      setToast({ message: `Failed to delete ${name}`, type: 'error', onClose: () => setToast(null) });
    }
  };
  // Submit add/edit form
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!modalEntity) return;

      const route = getApiRoute(modalEntity);

      if (modalMode === 'add') {
        await api.post(`/${route}`, formData);
        setToast({ message: 'Created successfully', type: 'success', onClose: () => setToast(null) });
      } else if (formData.id) {
        await api.put(`/${route}/${formData.id}`, formData);
        setToast({ message: 'Updated successfully', type: 'success', onClose: () => setToast(null) });
      }
      closeModal();
      fetchData();
    } catch (err) {
      setToast({ message: 'Operation failed. Please check inputs.', type: 'error', onClose: () => setToast(null) });
    }
  };
  // Map modal entity to API route names
  const getApiRoute = (entityKey: TabKey) => {
    switch (entityKey) {
      case TAB_KEYS.LEAVE_TYPES:
        return 'leave-types';
      case TAB_KEYS.TEAMS:
        return 'teams';
      case TAB_KEYS.ROLES:
        return 'roles';
      default:
        return '';
    }
  };
  // Get current list to display
  const currentList = (): (Team | Role | LeaveType)[] => {
    if (activeTab === TAB_KEYS.TEAMS) return teams;
    if (activeTab === TAB_KEYS.ROLES) return roles;
    return leaveTypes;
  };
  // Render form fields based on modal entity
  const renderFormFields = () => {
    if (!modalEntity) return null;

    if (modalEntity === TAB_KEYS.TEAMS) {
      return (
        <>
          <label className="block font-semibold mb-1" htmlFor="name">
            Team Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </>
      );
    } else if (modalEntity === TAB_KEYS.ROLES) {
      return (
        <>
          <label className="block font-semibold mb-1" htmlFor="name">
            Role Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </>
      );
    } else if (modalEntity === TAB_KEYS.LEAVE_TYPES) {
      return (
        <>
          <label className="block font-semibold mb-1" htmlFor="name">
            Leave Type Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <label className="block font-semibold mb-1 mt-4" htmlFor="totalDays">
            Total Days
          </label>
          <input
            id="totalDays"
            name="totalDays"
            type="number"
            min={0}
            value={formData.totalDays !== undefined ? formData.totalDays : ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <label className="block font-semibold mb-1 mt-4" htmlFor="approvalLevels">
            Approval Levels
          </label>
          <input
            id="approvalLevels"
            name="approvalLevels"
            type="number"
            min={0}
            max={3}
            value={formData.approvalLevels !== undefined ? formData.approvalLevels : ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <label className="block font-semibold mb-1 mt-4" htmlFor="autoApprove">
            Auto Approve
          </label>
          <input
            id="autoApprove"
            name="autoApprove"
            type="checkbox"
            checked={formData.autoApprove || false}
            onChange={handleInputChange}
            className="mr-2"
          />

          <label className="block font-semibold mb-1 mt-4" htmlFor="description">
            Description (optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            rows={3}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <label className="block font-semibold mb-1 mt-4" htmlFor="applicableGender">
            Applicable Gender (optional)
          </label>
          <select
            id="applicableGender"
            name="applicableGender"
            value={formData.applicableGender || ''}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Tabs */}
      <div className="flex justify-center space-x-6 mb-6 border-b border-gray-300">
        {Object.entries(TAB_KEYS).map(([key, value]) => (
          <button
            key={value}
            onClick={() => setActiveTab(value)}
            className={`py-2 px-6 font-semibold rounded-t-lg
              ${
                activeTab === value
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-indigo-600'
              }`}
          >
            {key.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Add New button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => openModal(activeTab, 'add')}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition"
        >
          + Add New
        </button>
      </div>

      {/* Error or Loading */}
      {error && <p className="text-red-600 mb-4">{error}</p>}
      {loading && <p className="text-gray-600 mb-4">Loading...</p>}

      {/* List */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="border-b bg-gray-100 text-left">
              <th className="px-6 py-3 font-medium">Name</th>
              {activeTab === TAB_KEYS.LEAVE_TYPES && (
                <>
                  <th className="px-6 py-3 font-medium">Total Days</th>
                  <th className="px-6 py-3 font-medium">Approval Levels</th>
                  <th className="px-6 py-3 font-medium">Auto Approve</th>
                </>
              )}
              <th className="px-6 py-3 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentList().map((item) => (
              <tr key={item.id} className="border-b hover:bg-indigo-50 transition">
                <td className="px-6 py-3">{item.name}</td>
                {activeTab === TAB_KEYS.LEAVE_TYPES && (
                  <>
                    <td className="px-6 py-3">{(item as LeaveType).totalDays}</td>
                    <td className="px-6 py-3">{(item as LeaveType).approvalLevels}</td>
                    <td className="px-6 py-3">{(item as LeaveType).autoApprove ? 'Yes' : 'No'}</td>
                  </>
                )}
                <td className="px-6 py-3 text-center space-x-2">
                  <button
                    onClick={() => openModal(activeTab, 'edit', item)}
                    className="text-indigo-600 hover:underline font-semibold"
                    aria-label={`Edit ${item.name}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(activeTab, item.id, item.name)}
                    className="text-red-600 hover:underline font-semibold"
                    aria-label={`Delete ${item.name}`}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {currentList().length === 0 && !loading && (
              <tr>
                <td colSpan={activeTab === TAB_KEYS.LEAVE_TYPES ? 4 : 2} className="text-center py-6 text-gray-500">
                  No {activeTab.replace(/([A-Z])/g, ' $1').toLowerCase()} found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <Transition appear show={modalOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={closeModal}
        >
          <div className="min-h-screen px-4 text-center bg-black bg-opacity-40">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 my-16 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  {modalMode === 'add' ? 'Add New' : 'Edit'}{' '}
                  {modalEntity === TAB_KEYS.LEAVE_TYPES
                    ? 'Leave Type'
                    : modalEntity === TAB_KEYS.TEAMS
                    ? 'Team'
                    : 'Role'}
                </Dialog.Title>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {renderFormFields()}

                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60"
                      disabled={
                        !formData.name ||
                        (modalEntity === TAB_KEYS.LEAVE_TYPES &&
                          (!formData.totalDays ||
                            formData.totalDays < 0 ||
                            !formData.approvalLevels ||
                            formData.approvalLevels < 0))
                      }
                    >
                      {modalMode === 'add' ? 'Create' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={toast.onClose}
        />
      )}
    </div>
  );
};

export default ManageSettingsPage;
