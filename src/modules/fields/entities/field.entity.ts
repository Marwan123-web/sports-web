import {
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';
import { Sport } from 'src/common/enums/enums';

@Entity('fields')
export class Field {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  name: string;

  @Column({
    type: 'enum',
    enum: Sport,
    default: Sport.FOOTBALL,
  })
  sport: Sport;

  @Column()
  address: string;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
    default: 25.0,
  })
  pricePerHour?: number;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => Booking, (booking) => booking.field)
  bookings: Booking[];

  @Column({ default: true })
  isActive: boolean;
}
