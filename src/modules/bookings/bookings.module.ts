import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { BookingsService } from './bookings.service';
import { Field } from '../fields/entities/field.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Field])],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
