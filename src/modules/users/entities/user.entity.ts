import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Tournament } from '../../tournaments/entities/tournament.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // use as username (spec: username must be unique)
  @Column({ unique: true })
  @Index() // Performance boost
  username: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column({ default: 'user' })
  role: string;

  @OneToMany(() => Tournament, (t) => t.creator, { cascade: true })
  tournaments: Tournament[];

  @OneToMany(() => Booking, (b) => b.user, { cascade: true })
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}
