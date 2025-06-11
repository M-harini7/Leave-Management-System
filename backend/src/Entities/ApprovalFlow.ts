import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from './Role';
import { LeaveType } from './LeaveType';

@Entity()
export class ApprovalFlow {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => LeaveType, (leaveType) => leaveType.approvalFlows, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'leave_type_id' })
  leaveType!: LeaveType;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @Column({ type: 'int' })
  level!: number;
}
