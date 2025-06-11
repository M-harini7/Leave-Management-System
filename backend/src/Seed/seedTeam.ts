import { AppDataSource } from '../data-sources';
import { Team } from '../Entities/Team';

const seedTeams = async () => {
  await AppDataSource.initialize();
  const teamRepo = AppDataSource.getRepository(Team);

  const teams = ['Frontend','Backend','DevOps'];

  for (const name of teams) {
    const existing = await teamRepo.findOneBy({ name });
    if (!existing) {
      const team = teamRepo.create({ name });
      await teamRepo.save(team);
    }
  }

  console.log('✅ Teams seeded');
  process.exit(0);
};

seedTeams().catch((err) => {
  console.error(err);
  process.exit(1);
});
