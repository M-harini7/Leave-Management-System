import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ApprovalFlow } from './ApprovalFlow';

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

  @Column({ type: 'boolean', default: false })
  carryForward!: boolean;

  @Column({ type: 'varchar', nullable: true })
  applicableGender?: 'male' | 'female' | null;

  @OneToMany(() => ApprovalFlow, (flow) => flow.leaveType)
  approvalFlows!: ApprovalFlow[];
}
