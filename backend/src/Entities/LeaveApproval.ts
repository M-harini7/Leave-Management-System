import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { LeaveRequest } from './LeaveRequest';
import { Employee } from './Employee';  // Approver
import { Role } from './Role';

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

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: 'pending' | 'approved' | 'rejected';

  @Column({ type: 'text', nullable: true })
  remarks?: string| null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
