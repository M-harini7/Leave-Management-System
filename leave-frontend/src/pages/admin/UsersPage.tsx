import React, { useEffect, useRef, useState, ChangeEvent } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
interface Role {
  id: number;
  name: string;
}

interface Team {
  id: number;
  name: string;
}

interface Employee {
  id: number;
  name: string;
  email?: string;
  role?: Role | string;
  team?: Team | string | null;
  isActive: boolean;
  gender?: string;
  joiningDate?: string | null;
}

interface SummaryUsers {
  total: number;
  active: number;
  inactive: number;
}

interface Summary {
  users: SummaryUsers;
}

const initialForm = {
  name: '',
  email: '',
  role: '',
  team: '',
  isActive: true,
  gender: '',
  joiningDate: '',
};

const capitalize = (str?: string) => {
  if (!str) return 'N/A';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const UsersPage: React.FC = () => {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState<typeof initialForm>(initialForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
 
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter states
  const [searchName, setSearchName] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterStatus, setFilterStatus] = useState(''); // 'active' / 'inactive' / ''
  const navigate = useNavigate();
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [employees, filterRole, filterTeam, filterStatus, searchName]);

  // Filter employees based on filters and search
  const applyFilters = () => {
    let filtered = [...employees];

    if (searchName.trim() !== '') {
      filtered = filtered.filter((emp) =>
        emp.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (filterRole) {
      filtered = filtered.filter(
        (emp) =>
          (typeof emp.role === 'object' ? emp.role?.name : emp.role) === filterRole
      );
    }

    if (filterTeam) {
      filtered = filtered.filter(
        (emp) =>
          (typeof emp.team === 'object' ? emp.team?.name : emp.team) === filterTeam
      );
    }

    if (filterStatus) {
      const isActiveFilter = filterStatus === 'active';
      filtered = filtered.filter((emp) => emp.isActive === isActiveFilter);
    }

    setFilteredEmployees(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const fetchData = () => {
    api
      .get('/summary')
      .then((res) => setSummary(res.data))
      .catch(() => setSummary(null));

    api
      .get('/employees')
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data.employees || [];
        setEmployees(data);
      })
      .catch(() => setEmployees([]));

    api
      .get('/roles')
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setRoles(data);
        } else if (Array.isArray(data.roles)) {
          setRoles(data.roles);
        } else {
          setRoles([]);
        }
      })
      .catch(() => setRoles([]));

    api
      .get('/teams')
      .then((res) => {
        const data = res.data;
        if (Array.isArray(data)) {
          setTeams(data);
        } else if (Array.isArray(data.teams)) {
          setTeams(data.teams);
        } else {
          setTeams([]);
        }
      })
      .catch(() => setTeams([]));
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async () => {
    try {
      const selectedRole = roles.find((r) => r.name === formData.role);
      const selectedTeam = teams.find((t) => t.name === formData.team);

      const submitData = {
        name: formData.name,
        email: formData.email,
        gender: formData.gender?.toLowerCase(),
        isActive: formData.isActive,
        joiningDate: formData.joiningDate || undefined,
        roleId: selectedRole?.id,
        teamId: selectedTeam?.id,
      };

      if (editId) {
        await api.put(`/employees/${editId}`, submitData);
      } else {
        await api.post('/employees', submitData);
      }

      setFormData(initialForm);
      setEditId(null);
      setShowForm(false);
      fetchData();
    } catch (err) {
      alert('Error saving employee');
      console.error(err);
    }
  };

  const handleEdit = (emp: Employee) => {
    setEditId(emp.id);
    setFormData({
      name: emp.name || '',
      email: emp.email || '',
      role: typeof emp.role === 'object' ? emp.role.name : (emp.role ?? ''),
      team: emp.team && typeof emp.team === 'object' ? emp.team.name : (emp.team ?? ''),
      isActive: emp.isActive ?? true,
      gender: emp.gender || '',
      joiningDate: emp.joiningDate ? emp.joiningDate.slice(0, 10) : '',
    });
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      await api.delete(`/employees/${id}`);
      fetchData();
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Summary Cards */}
      {summary?.users && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white shadow-md rounded-lg p-6 border">
            <div className="text-sm text-gray-500 mb-1">Total Users</div>
            <div className="text-3xl font-semibold text-blue-600">
              {summary.users.total}
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 border">
            <div className="text-sm text-gray-500 mb-1">Active Users</div>
            <div className="text-3xl font-semibold text-green-600">
              {summary.users.active}
            </div>
          </div>
          <div className="bg-white shadow-md rounded-lg p-6 border">
            <div className="text-sm text-gray-500 mb-1">Inactive Users</div>
            <div className="text-3xl font-semibold text-red-500">
              {summary.users.inactive}
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Button */}
      {!showForm && (
        <button
          className="mb-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          onClick={() => {
            setFormData(initialForm);
            setEditId(null);
            setShowForm(true);
          }}
        >
          Add Employee
        </button>
      )}
      <button
        onClick={() => navigate('/bulk-upload')}
        className="bg-green-600 text-white m-5 px-5 py-2 rounded hover:bg-green-700 transition">
        Bulk Upload
      </button>
      {/* Add/Edit Form */}
      {showForm && (
        <div
          ref={formRef}
          className="bg-white shadow-md rounded-lg p-6 mb-6 border max-w-3xl mx-auto"
        >
          <h2 className="text-xl font-semibold mb-4">
            {editId ? 'Edit Employee' : 'Add Employee'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="border p-2 rounded w-full text-sm"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Name"
            />
            <input
              className="border p-2 rounded w-full text-sm"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
            />
            <input
              type="date"
              name="joiningDate"
              value={formData.joiningDate}
              onChange={handleInputChange}
              className="border p-2 rounded w-full text-sm"
            />

            {/* Role Dropdown */}
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="border p-2 rounded w-full text-sm"
            >
              <option value="">Select Role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>

            {/* Team Dropdown */}
            <select
              name="team"
              value={formData.team}
              onChange={handleInputChange}
              className="border p-2 rounded w-full text-sm"
            >
              <option value="">Select Team</option>
              {teams.map((team) => (
                <option key={team.id} value={team.name}>
                  {team.name}
                </option>
              ))}
            </select>

            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="border p-2 rounded w-full text-sm"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
              />
              Active
            </label>
          </div>

          <div className="mt-4 flex gap-4 justify-end">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              onClick={handleSubmit}
            >
              {editId ? 'Update' : 'Add'}
            </button>
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4 items-center justify-between max-w-4xl mx-auto">
        <div>
          <label className="mr-2 font-semibold text-gray-700">Search by Name:</label>
          <input
            type="text"
            className="border p-2 rounded text-sm"
            placeholder="Enter name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </div>

        <div>
          <label className="mr-2 font-semibold text-gray-700">Filter by Role:</label>
          <select
            className="border p-2 rounded text-sm"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">All Roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-2 font-semibold text-gray-700">Filter by Team:</label>
          <select
            className="border p-2 rounded text-sm"
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
          >
            <option value="">All Teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.name}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mr-2 font-semibold text-gray-700">Filter by Status:</label>
          <select
            className="border p-2 rounded text-sm"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
          onClick={() => {
            setSearchName('');
            setFilterRole('');
            setFilterTeam('');
            setFilterStatus('');
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Employee Table */}
      <div className="bg-white shadow-md rounded-lg p-6 border max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Employee List</h2>
        <div className="overflow-x-auto">
          <table className="w-full table-auto border-collapse text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2 border-b">Name</th>
                <th className="text-left px-4 py-2 border-b">Role</th>
                <th className="text-left px-4 py-2 border-b">Team</th>
                <th className="text-left px-4 py-2 border-b">Joining Date</th>
                <th className="text-left px-4 py-2 border-b">Gender</th>
                <th className="text-left px-4 py-2 border-b">Status</th>
                <th className="text-left px-4 py-2 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    No employees found.
                  </td>
                </tr>
              )}
              {paginatedEmployees.map((emp) => (
                <tr
                  key={emp.id}
                  className="hover:bg-gray-50 even:bg-gray-50 transition-all"
                >
                  <td className="px-4 py-3 border-b text-gray-800">{emp.name}</td>
                  <td className="px-4 py-3 border-b text-gray-700">
                    {typeof emp.role === 'object' ? emp.role.name : emp.role}
                  </td>
                  <td className="px-4 py-3 border-b text-gray-700">
                    {typeof emp.team === 'object' ? emp.team?.name : emp.team || 'N/A'}
                  </td>
                  <td className="px-4 py-3 border-b text-gray-800">
                    {emp.joiningDate
                      ? new Date(emp.joiningDate).toISOString().slice(0, 10)
                      : 'N/A'}
                  </td>

                  <td className="px-4 py-3 border-b text-gray-800">
                    {capitalize(emp.gender)}
                  </td>

                  <td
                    className={`px-4 py-3 border-b font-medium ${
                      emp.isActive ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {emp.isActive ? 'Active' : 'Inactive'}
                  </td>
                  <td className="px-4 py-3 border-b space-x-2">
                    <button
                      onClick={() => handleEdit(emp)}
                      className="text-blue-500 hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="text-red-500 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

       {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-1 mt-4 text-sm flex-wrap">
              <button
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded border ${
                  currentPage === 1
                    ? 'cursor-not-allowed text-gray-400 border-gray-300'
                    : 'hover:bg-gray-200'
                }`}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              >
                Prev
              </button>

              {(() => {
                const pageButtons = [];
                const startPage = Math.max(1, currentPage - 2);
                const endPage = Math.min(totalPages, currentPage + 2);

                // Always show first page
                if (startPage > 1) {
                  pageButtons.push(
                    <button
                      key={1}
                      className={`px-3 py-1 rounded border ${
                        currentPage === 1
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'hover:bg-gray-200'
                      }`}
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </button>
                  );

                  if (startPage > 2) {
                    pageButtons.push(
                      <span key="start-ellipsis" className="px-2">
                        ...
                      </span>
                    );
                  }
                }

                for (let i = startPage; i <= endPage; i++) {
                  pageButtons.push(
                    <button
                      key={i}
                      className={`px-3 py-1 rounded border ${
                        currentPage === i
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'hover:bg-gray-200'
                      }`}
                      onClick={() => setCurrentPage(i)}
                    >
                      {i}
                    </button>
                  );
                }

                if (endPage < totalPages) {
                  if (endPage < totalPages - 1) {
                    pageButtons.push(
                      <span key="end-ellipsis" className="px-2">
                        ...
                      </span>
                    );
                  }

                  pageButtons.push(
                    <button
                      key={totalPages}
                      className={`px-3 py-1 rounded border ${
                        currentPage === totalPages
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'hover:bg-gray-200'
                      }`}
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  );
                }

                return pageButtons;
              })()}

              <button
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded border ${
                  currentPage === totalPages
                    ? 'cursor-not-allowed text-gray-400 border-gray-300'
                    : 'hover:bg-gray-200'
                }`}
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </button>
            </div>
          )}

      </div>
    </div>
  );
};

export default UsersPage;
