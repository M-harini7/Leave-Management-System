import  { useEffect, useState } from 'react';
import api from '../../api/axios';

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
  email: string;
  role: Role | null;
  team: Team | null;
}

export default function TeamMembersTable() {
  const [members, setMembers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get<Employee[]>('/employees/team-members');
        setMembers(res.data);
      } catch (error) {
        console.error('Failed to fetch team members:', error);
        alert('Error fetching team members');
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-600 p-8">Loading team members...</div>;
  }

  if (members.length === 0) {
    return <div className="text-center text-gray-600 p-8">No team members found.</div>;
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-blue-700 mb-6 border-b pb-2">👥 Team Members</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-blue-100 text-blue-800 uppercase text-xs font-semibold">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Team</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member, idx) => (
                <tr
                  key={member.id}
                  className={idx % 2 === 0 ? 'bg-gray-50 hover:bg-gray-100' : 'bg-white hover:bg-gray-100'}
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{member.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.role?.name ?? 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{member.team?.name ?? 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
