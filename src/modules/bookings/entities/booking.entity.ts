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
  
    // YYYY-MM-DD
    @Column()
    date: string;
  
    // HH:MM (e.g. 09:00, 09:30)
    @Column()
    time: string;
  
    @ManyToOne(() => Field, (field) => field.bookings, { eager: true })
    field: Field;
  
    @ManyToOne(() => User, (user) => user.bookings, { eager: true })
    user: User;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  