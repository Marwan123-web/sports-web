import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';
import { CreateBookingDto } from '../bookings/dto/create-booking.dto';
import { FieldsService } from '../fields/fields.service';

@Controller('api/fields')
export class FieldsController {
  constructor(
    private readonly fieldsService: FieldsService,
    private readonly bookingsService: BookingsService,
  ) {}

  @Get(':id/slots')
  async getSlots(
    @Param('id') id: string,
    @Query('date') date: string,
  ) {
    // define your slot grid here, e.g. 09:00–21:00 every 60 minutes
    const slots = [
      '09:00','10:00','11:00','12:00','13:00','14:00',
      '15:00','16:00','17:00','18:00','19:00','20:00',
    ];

    const bookings = await this.bookingsService.findByFieldAndDate(id, date);
    const bookedTimes = new Set(bookings.map((b) => b.time));

    const now = new Date();
    return slots.map((time) => {
      const slotDateTime = new Date(`${date}T${time}:00`);
      const isPast = slotDateTime < now;
      const isBooked = bookedTimes.has(time);
      return {
        time,
        available: !isPast && !isBooked,
      };
    });
  }

  @Post(':id/bookings')
  createBooking(
    @Param('id') id: string,
    @Body() dto: CreateBookingDto,
    @Req() req: any,
  ) {
    return this.bookingsService.create(id, req.user.id, dto);
  }

  @Delete(':id/bookings/:bookingId')
  cancelBooking(
    @Param('id') id: string,
    @Param('bookingId') bookingId: string,
    @Req() req: any,
  ) {
    return this.bookingsService.remove(id, bookingId, req.user.id);
  }
}
