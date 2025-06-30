import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Employee } from './Employee';
import { LeaveType } from './LeaveType';
import { LeaveApproval } from './LeaveApproval';
export enum LeaveRequestStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
  cancelled = 'cancelled'
}

@Entity()
export class LeaveRequest {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Employee)
  @JoinColumn({ name: 'employee_id' })
  employee!: Employee;

  @ManyToOne(() => LeaveType)
  @JoinColumn({ name: 'leave_type_id' })
  leaveType!: LeaveType;

  @Column({ type: 'date' })
  startDate!: Date;

  @Column({ type: 'date' })
  endDate!: Date;

  @Column({ type: 'decimal', precision: 4, scale: 2 })
  totalDays!: number;

  @Column({ type: 'boolean', default: false })
lastDayHalf!: boolean;

  @Column({ type: 'text', nullable: true })
  reason?: string;

  @Column({ 
    type: 'enum', 
    enum: LeaveRequestStatus, 
    default: LeaveRequestStatus.pending 
  })
  status!: LeaveRequestStatus;
  

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => LeaveApproval, approval => approval.leaveRequest)
  approvals!: LeaveApproval[];

  @Column({ type: 'text', nullable:true})
  remarks?: string;

}
