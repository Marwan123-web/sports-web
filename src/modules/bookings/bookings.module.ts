import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Booking } from './entities/booking.entity';
import { Field } from '../fields/entities/field.entity';
import { User } from '../users/entities/user.entity';
import { FieldsModule } from '../fields/fields.module';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Field, User]), forwardRef(() => FieldsModule), ],
  controllers:[BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}

