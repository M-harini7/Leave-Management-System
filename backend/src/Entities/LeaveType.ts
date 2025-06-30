import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { ApprovalFlow } from './ApprovalFlow';

export enum AllocationFrequency {
  YEARLY = 'YEARLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
}

@Entity()
export class LeaveType {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'int', default: 0 })
  totalDays!: number;

  @Column({ type: 'int', default: 1 })
  approvalLevels!: number;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'boolean', default: false })
  autoApprove!: boolean;

  @Column({
    type: 'enum',
    enum: AllocationFrequency,
    default: AllocationFrequency.YEARLY,
  })
  allocationFrequency!: AllocationFrequency;

  @Column({ type: 'boolean', default: false })
  isCarryForwardAllowed!: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  carryForwardLimit!: number;

  @Column({ type: 'boolean', default: false })
  isAutoAllocatable!: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  defaultAnnualAllocation!: number;

  @Column({ type: 'varchar', nullable: true })
  applicableGender?: 'male' | 'female' | null;

  @OneToMany(() => ApprovalFlow, (flow) => flow.leaveType)
  approvalFlows!: ApprovalFlow[];
}
