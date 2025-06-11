import { Server } from '@hapi/hapi';
import { config } from 'dotenv';
import Jwt from '@hapi/jwt';
import { AppDataSource } from './data-sources';
import { employeeRoutes } from './Routes/employeeRoutes';
import { addemployeeRoutes } from './Routes/addEmployeeRoutes';
import { registerLeaveRoutes } from './Routes/leaveRoutes';
import { leaveTypeRoutes } from './Routes/leaveTypeRoutes';
import { teamRoutes } from './Routes/teamRoutes';
import { leaveApprovalRoutes } from './Routes/leaveApprovalRoutes';
import { Employee } from './Entities/Employee'; 
import { leaveStatusRoutes } from './Routes/leaveStatusRoutes';
import { holidayRoutes } from './Routes/holidayRoutes';
import cron from 'node-cron';
import { carryForwardUnusedLeave } from './Services/carryForwardServices';
import { roleRoutes } from './Routes/roleRoutes';
import { summaryRoute } from './Routes/summaryRoutes';
import { approverSummaryRoute } from './Routes/approverSummaryRoute';
import { leaveHistoryRoutes } from './Routes/leaveHistoryRoutes';
import { getemployeeRoute } from './Routes/getemployeeRoutes'
import { teamLeaveCalendarRoutes } from './Routes/teamLeaveCalendarRoutes';
config();

const init = async () => {
  const server = new Server({
    port: process.env.PORT ? parseInt(process.env.PORT) : 4000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['http://localhost:5173'],
        credentials:true,
        additionalHeaders: ['cache-control', 'x-requested-with', 'authorization'],
      },
    },
    
  });

  await AppDataSource.initialize();
  console.log('DB Connected');

  // Register JWT plugin
  await server.register(Jwt);

  // ✅ JWT auth strategy with async validation
  server.auth.strategy('jwt', 'jwt', {
    keys: process.env.JWT_SECRET || '731f3f5d2a1a2d2f7f387bcc0e4c29b6dfe2589528b97edb0eba96b009078de7',
    verify: {
      aud: false,
      iss: false,
      sub: false,
      nbf: true,
      exp: true,
      maxAgeSec: 14400,
      timeSkewSec: 15,
    },
    validate: async (artifacts: any) => {
      try {
        const userId = artifacts.decoded.payload.userId;

        const employeeRepo = AppDataSource.getRepository(Employee);
        const employee = await employeeRepo.findOne({
          where: { user: { id: userId } },
          relations: ['user', 'role', 'team'],
        });

        if (!employee) {
          return { isValid: false, credentials: null };
        }

        return {
          isValid: true,
          credentials: {
            userId,
            employeeId: employee.id,
            role: employee.role?.name,
        teamId: employee.team?.id,
          },
        };
      } catch (err) {
        console.error('JWT validation error:', err);
        return { isValid: false, credentials: null };
      }
    }
  });

   //server.auth.default('jwt'); // Optional: set default auth strategy

  // Register routes
  employeeRoutes(server);
  addemployeeRoutes(server);
  registerLeaveRoutes(server);
  leaveTypeRoutes(server);
  teamRoutes(server);
  leaveApprovalRoutes(server);
  server.route(leaveStatusRoutes);
  roleRoutes(server);
  holidayRoutes(server); 
  leaveHistoryRoutes(server);
  server.route(summaryRoute);
  server.route(approverSummaryRoute);
  // register after server is created
  getemployeeRoute(server);
  teamLeaveCalendarRoutes(server);
  await server.start();
    
    cron.schedule('0 0 1 1 *', async () => {
      console.log('🔁 Running scheduled carry forward...');
      await carryForwardUnusedLeave();
    });
  
  console.log('🚀 Server running on %s', server.info.uri);
};

init().catch((err) => {
  console.error('❌ Server init failed:', err);
});
