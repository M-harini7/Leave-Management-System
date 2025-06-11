import { Server } from '@hapi/hapi';
import * as employeeController from '../Controllers/addEmployeeController';
import { employeeAuth } from '../Middleware/addEmployeeAuth';

export const addemployeeRoutes = (server: Server) => {
  server.route([
    {
      method: 'POST',
      path: '/employees',
      options: {
        pre: [ { method: employeeAuth } ],
      },
      handler: employeeController.addEmployeeController,
    },
    {
      method: 'PUT',
      path: '/employees/{id}',
      options: {
        pre: [ { method: employeeAuth } ],
      },
      handler: employeeController.updateEmployeeController,
    },
    {
      method: 'DELETE',
      path: '/employees/{id}',
      options: {
        pre: [ { method: employeeAuth } ],
      },
      handler: employeeController.deleteEmployeeController,
    },
    {
      method: 'GET',
      path: '/employees',
      options: {
        pre: [ { method: employeeAuth } ],
      },
      handler: employeeController.getAllEmployeesController,
    },
  ]);
};
