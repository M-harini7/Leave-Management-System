import { DataSource } from 'typeorm';
import { Role } from './Entities/Role'; // example entity, create soon
import { Employee } from './Entities/Employee'; // create this too
import { Team } from './Entities/Team'; // import more entities here...
import { LeaveType } from './Entities/LeaveType';
import { LeaveBalance } from './Entities/LeaveBalance';
import { LeaveApproval } from './Entities/LeaveApproval';
import { ApprovalFlow } from './Entities/ApprovalFlow';
import { LeaveRequest } from './Entities/LeaveRequest';
import { User } from './Entities/User';
import { Holiday } from './Entities/Holiday';
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '1234',
  database: 'Leave_management_system',
  synchronize: true, // auto create tables in dev
  logging: false,
  entities: [User,Role,Employee,Team,LeaveType,LeaveBalance,LeaveApproval,ApprovalFlow,LeaveRequest,Holiday], // add more later
});
