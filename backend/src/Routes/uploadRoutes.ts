import { ServerRoute } from '@hapi/hapi';
import { uploadEmployees } from '../Controllers/uploadEmployees';

export const employeeUploadRoutes: ServerRoute[] = [
  {
    method: 'POST',
    path: '/api/employees/upload',
    options: {
      payload: {
        output: 'data',   
        parse: true,
        multipart: true,
        maxBytes: 10 * 1024 * 1024,
        allow: 'multipart/form-data',
      },
      handler: uploadEmployees,
    },
  },
];
