import { AppDataSource } from '../data-sources';
import { Holiday } from '../Entities/Holiday';

const holidayRepo = AppDataSource.getRepository(Holiday);

export const createHolidayService = async (payload: Partial<Holiday>) => {
  const holiday = holidayRepo.create(payload);
  return await holidayRepo.save(holiday);
};

export const getAllHolidaysService = async () => {
  return await holidayRepo.find({ order: { date: 'ASC' } });
};

export const updateHolidayService = async (id: number, payload: Partial<Holiday>) => {
  const holiday = await holidayRepo.findOneBy({ id });
  if (!holiday) throw new Error('Holiday not found');
  holidayRepo.merge(holiday, payload);
  return await holidayRepo.save(holiday);
};

export const deleteHolidayService = async (id: number) => {
  const holiday = await holidayRepo.findOneBy({ id });
  if (!holiday) throw new Error('Holiday not found');
  await holidayRepo.remove(holiday);
  return { message: 'Holiday deleted successfully' };
};
