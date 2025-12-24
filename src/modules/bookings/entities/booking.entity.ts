import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import { Field } from '../../fields/entities/field.entity';
import { User } from 'src/modules/users/entities/user.entity';
  
@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  date: string; // "2025-12-25"

  @Column()
  startTime: string; // "09:00"

  @Column()
  endTime: string;   // "11:00"

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number; // 110.00

  @ManyToOne(() => Field, (field) => field.bookings, { 
    eager: true,
    onDelete: 'CASCADE' 
  })
  field: Field;

  @ManyToOne(() => User, (user) => user.bookings, { 
    eager: true,
    onDelete: 'CASCADE' 
  })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: true })
  isActive: boolean;
}

  