import { AppDataSource } from '../data-sources';
import { Employee } from '../Entities/Employee';
import { User } from '../Entities/User';
import bcrypt from 'bcrypt';
import { generateToken } from '../Utils/jwt';
import { Role } from '../Entities/Role';

export const registerEmployee = async (data: { email: string; password: string }) => {
  const employeeRepo = AppDataSource.getRepository(Employee);
  const userRepo = AppDataSource.getRepository(User);
  const roleRepo = AppDataSource.getRepository(Role);

  const employee = await employeeRepo.findOne({
    where: { email: data.email },
    relations: ['role'],
  });

  if (!employee) throw new Error('Employee does not exist.');

  const existingUser = await userRepo.findOneBy({ email: data.email });
  if (existingUser) throw new Error('User already registered, please login.');

  const hashedPassword = await bcrypt.hash(data.password, 10);
   employee.password=hashedPassword;
   await employeeRepo.save(employee); 
  const role = await roleRepo.findOneBy({ id: employee.role.id });
  if (!role) throw new Error('Employee has no valid role assigned.');

  const newUser = userRepo.create({
    email: data.email,
    password: hashedPassword,
    employee,
    role,
  });

  await userRepo.save(newUser);
  return { message: 'User registered successfully.' };
};

  
export const loginEmployee = async (data: { email: string; password: string }) => {
  const userRepo = AppDataSource.getRepository(User);

  const { email, password } = data;

  const user = await userRepo.findOne({
    where: { email },
    relations: ['role', 'employee', 'employee.team'], // load relations needed
  });

  if (!user) throw new Error('User not registered. Please register first.');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Invalid email or password.');

  const token = generateToken({
    userId: user.id,
    role: user.role.name.toLowerCase(),
    employeeId: user.employee.id,
    teamId: user.employee.team?.id,
  });

  return {
    token,
    role: user.role.name.toLowerCase(),
    name: user.employee.name,
    teamId: user.employee.team?.id,
    employeeId: user.employee.id,
    message: 'Login successful.',
  };
};
  export const getUserProfile = async (userId: number) => {
    try {
      const userRepo = AppDataSource.getRepository(User);
  
      const user = await userRepo.findOne({
        where: { id: userId },
        relations: ['role', 'employee', 'employee.role', 'employee.team'],
      });
  
      if (!user) {
        throw new Error('User not found');
      }
  
      const employee = user.employee;
  
      return {

          id: employee.id,
          name: employee.name,
          email: employee.email,
          gender: employee.gender,
          joiningDate: employee.joiningDate,
          isActive: employee.isActive,
          role: employee.role ? employee.role.name : 'N/A',
          team: employee.team ? employee.team.name : 'N/A',
   
      };
    } catch (err) {
      console.error(' Error in getUserProfile:', err);
      throw err;
    }
  };
  
  
  
