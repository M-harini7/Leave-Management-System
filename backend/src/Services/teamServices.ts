import { AppDataSource } from '../data-sources';
import { Team } from '../Entities/Team';
import { Employee } from '../Entities/Employee'

export class TeamService {
  static teamRepo = AppDataSource.getRepository(Team);
  static employeeRepo = AppDataSource.getRepository(Employee);
  static async createTeam(name: string): Promise<Team> {
    const existing = await this.teamRepo.findOneBy({ name });
    if (existing) throw new Error('Team already exists');

    const team = this.teamRepo.create({ name });
    return this.teamRepo.save(team);
  }

  static async updateTeam(id: number, name: string): Promise<Team> {
    const team = await this.teamRepo.findOneBy({ id });
    if (!team) throw new Error('Team not found');

    team.name = name;
    return this.teamRepo.save(team);
  }

  static async deleteTeam(id: number): Promise<void> {
    const team = await this.teamRepo.findOneBy({ id });
    if (!team) throw new Error('Team not found');

    await this.teamRepo.remove(team);
  }

  static async getAllTeams(): Promise<Team[]> {
    return this.teamRepo.find();
  }
  
  }

