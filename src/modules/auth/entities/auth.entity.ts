import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('auth_logs')
export class AuthLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ nullable: true })
  userId?: number;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ default: true })
  success: boolean; // true => successful login/signup

  @CreateDateColumn()
  createdAt: Date;
}
