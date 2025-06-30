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

  @Column({ type: 'int', nullable: true })
  year!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  totalDays!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  usedDays!: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  remainingDays!: number;
}
