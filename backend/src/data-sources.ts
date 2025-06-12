import { DataSource } from 'typeorm';
import { Role } from './Entities/Role'; 
import { Employee } from './Entities/Employee'; 
import { Team } from './Entities/Team'; 
import { LeaveType } from './Entities/LeaveType';
import { LeaveBalance } from './Entities/LeaveBalance';
import { LeaveApproval } from './Entities/LeaveApproval';
import { ApprovalFlow } from './Entities/ApprovalFlow';
import { LeaveRequest } from './Entities/LeaveRequest';
import { User } from './Entities/User';
import 'dotenv/config'; 
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT), 
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: true, 
  logging: false,
  entities: [User,Role,Employee,Team,LeaveType,LeaveBalance,LeaveApproval,ApprovalFlow,LeaveRequest], // add more later
});
