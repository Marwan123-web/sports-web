import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { User } from '../../users/entities/user.entity';
  
  @Entity()
  export class Auth {
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
    success: boolean; // true for success, false for failed login
  
    @CreateDateColumn()
    createdAt: Date;
  }
  