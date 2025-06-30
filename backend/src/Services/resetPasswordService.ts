import bcrypt from "bcrypt";
import { AppDataSource } from "../data-sources";
import { Employee } from "../Entities/Employee";
import { User } from "../Entities/User";

export class ResetPasswordService {
  static async resetByEmail(email: string, newPassword: string) {
    const employeeRepo = AppDataSource.getRepository(Employee);
    const userRepo = AppDataSource.getRepository(User);

    // Find employee by email
    const employee = await employeeRepo.findOne({ where: { email } });

    if (!employee) {
      return { success: false, message: "No employee found with this email." };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update Employee password
    employee.password = hashedPassword;
    await employeeRepo.save(employee);

    // Update User password (if linked)
    const user = await userRepo.findOne({ where: { email } });
    if (user) {
      user.password = hashedPassword;
      await userRepo.save(user);
    }

    return { success: true, message: "Password updated successfully." };
  }
}
