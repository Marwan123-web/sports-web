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
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiParam, 
  ApiBody 
} from '@nestjs/swagger';
import { BookingsService } from '../bookings/bookings.service';
import { CreateBookingDto } from '../bookings/dto/create-booking.dto';
import { FieldsService } from '../fields/fields.service';
import { CustomException } from 'src/common/exceptions/customException';

@ApiTags('Bookings')
@Controller('api/bookings') 
export class BookingsController { 
  constructor(
    private readonly fieldsService: FieldsService,
    private readonly bookingsService: BookingsService,
  ) {}

  // ✅ NEW: Get all bookings (Admin only)
  @Get()
  @ApiOperation({ summary: 'Get all bookings (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'All bookings list' })
  getAllBookings() {
    return this.bookingsService.findAll();
  }

  // ✅ NEW: Get bookings by field (Public/Admin)
  @Get('field/:fieldId')
  @ApiOperation({ summary: 'Get bookings by field ID' })
  @ApiParam({ name: 'fieldId', description: 'Field UUID' })
  @ApiResponse({ status: 200, description: 'Field bookings list' })
  getBookingsByField(@Param('fieldId') fieldId: string) {
    return this.bookingsService.findByField(fieldId);
  }

  // ✅ EXISTING: Get my bookings
  @Get('my-bookings')
  @ApiOperation({ summary: 'Get current user bookings' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'User bookings list' })
  getMyBookings(@Req() req: any) {    
    if (!req.user?.id) {
      throw new CustomException(1003);
    }
    return this.bookingsService.findUserBookings(req.user.id);
  }

  @Get(':id/slots')
  @ApiOperation({ summary: 'Get available time slots for field' })
  @ApiParam({ name: 'id', description: 'Field UUID' })
  @ApiQuery({ name: 'date', example: '2025-12-27', description: 'YYYY-MM-DD format' })
  @ApiResponse({ 
    status: 200, 
    description: 'Available slots',
    schema: {
      example: [
        { time: '09:00', available: true },
        { time: '10:00', available: false },
        { time: '11:00', available: true }
      ]
    }
  })
  async getSlots(@Param('id') id: string, @Query('date') date: string) {
    await this.fieldsService.findOne(id);

    const slots = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00'];
    const result = await this.bookingsService.findByFieldAndDate(id, date);
    const bookedTimes = new Set(result.startTimes);

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
  @ApiOperation({ summary: 'Create new booking' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Field UUID' })
  @ApiBody({ type: CreateBookingDto })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Slot not available' })
  createBooking(@Param('id') id: string, @Body() dto: CreateBookingDto, @Req() req: any) {
    return this.bookingsService.create(id, req.user.id, dto);
  }

  @Delete(':id/bookings/:bookingId')
  @ApiOperation({ summary: 'Cancel booking' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Field UUID' })
  @ApiParam({ name: 'bookingId', description: 'Booking UUID' })
  @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
  cancelBooking(@Param('id') id: string, @Param('bookingId') bookingId: string, @Req() req: any) {    
    return this.bookingsService.remove(id, bookingId, req.user.id);
  }
}
