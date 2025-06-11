import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './Employee';
import { LeaveType } from './LeaveType';

@Entity()
export class LeaveBalance {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Employee, (employee) => employee.leaveBalances, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @ManyToOne(() => LeaveType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leaveTypeId' })
  leaveType!: LeaveType;

  @Column({ type: 'int',nullable: true })
  year!: number; 

  @Column({ type: 'int' })
  totalDays!: number;

  @Column({ type: 'int', default: 0 })
  usedDays!: number;

  @Column({ type: 'int', default: 0 })
  remainingDays!: number; // NOW stored in the DB
}
