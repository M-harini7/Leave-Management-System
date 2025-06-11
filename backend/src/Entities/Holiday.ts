import { Entity, PrimaryGeneratedColumn, Column ,CreateDateColumn,UpdateDateColumn} from 'typeorm';

@Entity()
export class Holiday {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'date' })
  date!: Date;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: '#9CA3AF' }) // grey
  color!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}

