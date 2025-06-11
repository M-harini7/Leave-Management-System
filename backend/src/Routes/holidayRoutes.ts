import { Server } from '@hapi/hapi';
import * as holidayController from '../Controllers/holidayController';
import { employeeAuth } from '../Middleware/addEmployeeAuth';

export const holidayRoutes = (server: Server) => {
  server.route([
    {
      method: 'GET',
      path: '/holidays',
      options: {
        pre: [{ method: employeeAuth }],
      },
      handler: holidayController.getAllHolidays,
    },
    {
      method: 'POST',
      path: '/holidays',
      options: {
        pre: [{ method: employeeAuth }],
      },
      handler: holidayController.createHoliday,
    },
    {
      method: 'PUT',
      path: '/holidays/{id}',
      options: {
        pre: [{ method: employeeAuth }],
      },
      handler: holidayController.updateHoliday,
    },
    {
      method: 'DELETE',
      path: '/holidays/{id}',
      options: {
        pre: [{ method: employeeAuth }],
      },
      handler: holidayController.deleteHoliday,
    },
  ]);
};
