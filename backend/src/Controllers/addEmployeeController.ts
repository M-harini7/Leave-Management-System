import { Request, ResponseToolkit } from '@hapi/hapi';
import * as employeeService from '../Services/addEmployeeServices';

export const addEmployeeController = async (request: Request, h: ResponseToolkit) => {
  try {
    const newEmployee = await employeeService.createEmployee(request.payload as any);
    return h.response({ message: 'Employee added successfully', employee: newEmployee }).code(201);
  } catch (err: any) {
    return h.response({ error: err.message || 'Failed to add employee' }).code(400);
  }
};

export const updateEmployeeController = async (request: Request, h: ResponseToolkit) => {
  try {
    const employeeId = Number(request.params.id);
    const updatedEmployee = await employeeService.updateEmployee(employeeId, request.payload as any);
    return h.response({ message: 'Employee updated successfully', employee: updatedEmployee }).code(200);
  } catch (err: any) {
    return h.response({ error: err.message || 'Failed to update employee' }).code(400);
  }
};

export const deleteEmployeeController = async (request: Request, h: ResponseToolkit) => {
  try {
    const employeeId = Number(request.params.id);
    await employeeService.deleteEmployee(employeeId);
    return h.response({ message: 'Employee deleted successfully' }).code(200);
  } catch (err: any) {
    return h.response({ error: err.message || 'Failed to delete employee' }).code(400);
  }
};

export const getAllEmployeesController = async (request: Request, h: ResponseToolkit) => {
  try {
    const employees = await employeeService.getAllEmployees();
    return h.response({ employees }).code(200);
  } catch (err) {
    return h.response({ error: 'Failed to fetch employees' }).code(500);
  }
};
