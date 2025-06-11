import { Request, ResponseToolkit } from '@hapi/hapi';
import { getTeamMembersService } from '../Services/getemployeeService';

export const getTeamMembers = async (request: Request, h: ResponseToolkit) => {
  try {
    const { role, teamId } = request.auth.credentials as {
      role: string;
      teamId: number;
    };

    if (!role || !teamId) {
      return h.response({ error: 'Missing role or teamId in token.' }).code(400);
    }

    const members = await getTeamMembersService(role.toLowerCase(), teamId);
    return h.response(members).code(200);
  } catch (err) {
    console.error('Error fetching team members:', err);
    return h.response({ error: 'Failed to fetch team members' }).code(500);
  }
};
