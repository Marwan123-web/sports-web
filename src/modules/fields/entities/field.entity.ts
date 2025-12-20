import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Booking } from '../../bookings/entities/booking.entity';

export type SportType = 'football' | 'volleyball' | 'basketball';

@Entity('fields')
export class Field {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar' })
  sport: SportType;

  @Column()
  address: string;

  // optional: any extra description
  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => Booking, (booking) => booking.field)
  bookings: Booking[];
}
