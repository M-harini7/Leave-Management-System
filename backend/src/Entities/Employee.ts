import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Role } from './Role';
import { Team } from './Team';
import { LeaveBalance } from '../Entities/LeaveBalance';
import { User } from './User';

import {Gender} from '../types';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ type: 'varchar', nullable: true })
  password!: string;

  @Column()
  email!: string;

  @Column({ type: 'enum', enum: ['male', 'female'], nullable: true })
  gender!: 'male' | 'female' | null;


  @Column()
  joiningDate!: Date;

  @ManyToOne(() => Role)
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @ManyToOne(() => Team)
  @JoinColumn({ name: 'team_id' })
  team!: Team;

  @Column({ default: true })
  isActive!: boolean;

  @OneToOne(() => User, (user) => user.employee)  // inverse side, no @JoinColumn here
  user!: User;

  @OneToMany(() => LeaveBalance, (lb) => lb.employee)
  leaveBalances!: LeaveBalance[];
}
