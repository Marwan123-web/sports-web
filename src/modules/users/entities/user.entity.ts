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
import { SystemRoles } from 'src/common/enums/enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @Index()
  username: string;

  @Column({ unique: true, nullable: true })
  email?: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column()
  surname: string;

  @Column({
    type: 'enum',
    enum: SystemRoles,
    default: SystemRoles.USER,
  })
  role: SystemRoles;

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
