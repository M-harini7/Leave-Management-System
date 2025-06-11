import { AppDataSource } from '../data-sources';
import { LeaveType } from '../Entities/LeaveType';

const seedLeaveTypes = async () => {
  await AppDataSource.initialize();
  const leaveTypeRepo = AppDataSource.getRepository(LeaveType);

  const leaveTypes = [
    {
      name: 'Annual Leave',
      totalDays: 14,
      approvalLevels: 2,
      description: 'Standard yearly leave for planned vacations or personal time off.',
      autoApprove: false,
    },
    {
      name: 'Sick Leave',
      totalDays: 10,
      approvalLevels: 1,
      description: 'Leave for illness or medical reasons.',
      autoApprove: false,
    },
    {
      name: 'Emergency Leave',
      totalDays: 5,
      approvalLevels: 1,
      description: 'Leave for emergency situations requiring immediate attention.',
      autoApprove: true,  // auto-approved leave type
    },
    {
      name: 'Maternity Leave',
      totalDays: 90,
      approvalLevels: 2,
      description: 'Leave for childbirth and recovery.',
      autoApprove: false,
    },
    {
      name: 'Paternity Leave',
      totalDays: 15,
      approvalLevels: 1,
      description: 'Leave for new fathers.',
      autoApprove: false,
    },
    {
      name: 'Unpaid Leave',
      totalDays: 0,
      approvalLevels: 1,
      description: 'Leave without pay.',
      autoApprove: false,
    },
    {
      name: 'Compensatory Leave',
      totalDays: 7,
      approvalLevels: 1,
      description: 'Leave given in compensation for extra work hours.',
      autoApprove: false,
    },
  ];

  for (const data of leaveTypes) {
    const exists = await leaveTypeRepo.findOneBy({ name: data.name });
    if (!exists) {
      const leaveType = leaveTypeRepo.create(data);
      await leaveTypeRepo.save(leaveType);
    }
  }

  console.log('✅ Leave types seeded');
  process.exit(0);
};

seedLeaveTypes().catch((err) => {
  console.error(err);
  process.exit(1);
});
