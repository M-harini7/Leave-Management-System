import { Request, ResponseToolkit } from '@hapi/hapi';
import { TeamService } from '../Services/teamServices';
import { Employee } from '../Entities/Employee';
export class TeamController {
  static async create(req: Request, h: ResponseToolkit) {
    try {
      const { name } = req.payload as any;
      const team = await TeamService.createTeam(name);
      return h.response({ message: 'Team created', team }).code(201);
    } catch (err: any) {
      return h.response({ error: err.message }).code(400);
    }
  }

  static async update(req: Request, h: ResponseToolkit) {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.payload as any;
      const team = await TeamService.updateTeam(id, name);
      return h.response({ message: 'Team updated', team });
    } catch (err: any) {
      return h.response({ error: err.message }).code(400);
    }
  }

  static async remove(req: Request, h: ResponseToolkit) {
    try {
      const id = parseInt(req.params.id);
      await TeamService.deleteTeam(id);
      return h.response({ message: 'Team deleted' });
    } catch (err: any) {
      return h.response({ error: err.message }).code(400);
    }
  }

  static async getAll(req: Request, h: ResponseToolkit) {
    try {
      const teams = await TeamService.getAllTeams();
      return h.response({ teams });
    } catch (err: any) {
      return h.response({ error: err.message }).code(400);
    }
  }
  
}

