import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Tournament } from '../../tournaments/entities/tournament.entity';
import { Booking } from '../../bookings/entities/booking.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  // use as username (spec: username must be unique)
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column({ default: 'user' })
  role: string;

  @OneToMany(() => Tournament, (t) => t.creator)
  tournaments: Tournament[];

  @OneToMany(() => Booking, (b) => b.user)
  bookings: Booking[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
