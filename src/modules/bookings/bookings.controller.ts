import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { BookingsService } from '../bookings/bookings.service';
import { CreateBookingDto } from '../bookings/dto/create-booking.dto';
import { FieldsService } from '../fields/fields.service';
import { CustomException } from 'src/common/exceptions/customException';

@Controller('api/bookings') 
export class BookingsController { 
  constructor(
    private readonly fieldsService: FieldsService,
    private readonly bookingsService: BookingsService,
  ) {}

  // ✅ NEW: Get all bookings (Admin only)
  @Get()
  getAllBookings() {
    return this.bookingsService.findAll();
  }

  // ✅ NEW: Get bookings by field (Public/Admin)
  @Get('field/:fieldId')
  getBookingsByField(@Param('fieldId') fieldId: string) {
    return this.bookingsService.findByField(fieldId);
  }

  // ✅ EXISTING: Get my bookings
  @Get('my-bookings')
  getMyBookings(@Req() req: any) {    
    if (!req.user?.id) {
      throw new CustomException(1003);
    }
    return this.bookingsService.findUserBookings(req.user.id);
  }

  @Get(':id/slots')
  async getSlots(@Param('id') id: string, @Query('date') date: string) {
    await this.fieldsService.findOne(id);

    const slots = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];
    const result = await this.bookingsService.findByFieldAndDate(id, date);
    const bookedTimes = new Set(result.startTimes); // ✅ Use result.startTimes

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
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  createBooking(@Param('id') id: string, @Body() dto: CreateBookingDto, @Req() req: any) {
    return this.bookingsService.create(id, req.user.id, dto);
  }

  @Delete(':id/bookings/:bookingId')
  cancelBooking(@Param('id') id: string, @Param('bookingId') bookingId: string, @Req() req: any) {    
    return this.bookingsService.remove(id, bookingId, req.user.id);
  }
}
