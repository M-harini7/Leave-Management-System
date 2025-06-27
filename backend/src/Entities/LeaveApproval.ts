import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { LeaveRequest } from './LeaveRequest';
import { Employee } from './Employee';  // Approver
import { Role } from './Role';
export enum LeaveRequestStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
  cancelled = 'cancelled'
}

@Entity('leave_approval')
export class LeaveApproval {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => LeaveRequest, leaveRequest => leaveRequest.approvals)
  @JoinColumn({ name: 'leave_request_id' })
  leaveRequest!: LeaveRequest;

  @ManyToOne(() => Employee, { nullable: true })
  @JoinColumn({ name: 'approver_id' })
  approver?: Employee;  // Approver may be null before assigned

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role!: Role;  // Role responsible for approval at this level

  @Column({ type: 'int' })
  level!: number;

  @Column({ 
    type: 'enum', 
    enum: LeaveRequestStatus, 
    default: LeaveRequestStatus.pending 
  })
  status!: LeaveRequestStatus;
  

  @Column({ type: 'text', nullable: true })
  remarks?: string| null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
