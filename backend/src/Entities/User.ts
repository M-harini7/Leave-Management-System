import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn ,ManyToOne} from 'typeorm';
import { Employee } from './Employee';
import { Role } from './Role';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @OneToOne(() => Employee, { onDelete: 'CASCADE' })
@JoinColumn({ name: 'employeeId' })
employee!: Employee;


  @ManyToOne(() => Role)
 @JoinColumn()
  role!: Role;

}