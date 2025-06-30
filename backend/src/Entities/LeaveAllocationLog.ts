// src/Entities/LeaveAllocationLog.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Employee } from './Employee';
import { LeaveType } from './LeaveType';

@Entity()
export class LeaveAllocationLog {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Employee, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @ManyToOne(() => LeaveType, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leave_type_id' })
  leaveType!: LeaveType;

  @Column()
  frequency!: 'YEARLY' | 'MONTHLY' | 'QUARTERLY' | 'CARRY_FORWARD';

  @Column({ type: 'date' })
  date!: string; // e.g., '2025-01-01'
}
