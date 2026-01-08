import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Field } from '../fields/entities/field.entity';
import { User } from '../users/entities/user.entity';
import { calculateDurationHours, minutesToTime, parseTimeToMinutes } from 'src/common/enums/enums';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepo: Repository<Booking>,
    @InjectRepository(Field)
    private readonly fieldsRepo: Repository<Field>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async findAll() {
    return this.bookingsRepo.find({
      where: { isActive: true },
      relations: ['field', 'user'],
      order: { date: 'ASC', startTime: 'ASC' }
    });
  }
  
  // ✅ NEW: Get bookings by field
  async findByField(fieldId: string) {
    const field = await this.fieldsRepo.findOne({ where: { id: fieldId } });
    if (!field) throw new NotFoundException('Field not found');
  
    return this.bookingsRepo.find({
      where: { 
        field: { id: fieldId }, 
        isActive: true 
      },
      relations: ['user'],
      order: { date: 'ASC', startTime: 'ASC' }
    });
  }

  async create(fieldId: string, userId: string, dto: CreateBookingDto) {
    const field = await this.fieldsRepo.findOne({ where: { id: fieldId } });
    if (!field) throw new NotFoundException('Field not found');
  
    const user = await this.usersRepo.findOne({ where: { id: Number(userId) } });
    if (!user) throw new NotFoundException('User not found');
  
    const now = new Date();
    const slotDateTime = new Date(`${dto.date}T${dto.startTime}:00`);
    if (slotDateTime < now) {
      throw new BadRequestException('Cannot book past slots');
    }    
    const hours = calculateDurationHours(dto.startTime, dto.endTime);
    const pricePerHour = field.pricePerHour || 25;
    const totalPrice = parseFloat((hours * pricePerHour).toFixed(2));
    
    // ✅ FIXED: Check for OVERLAPPING bookings
    const conflictingBookings = await this.bookingsRepo.find({
      where: { 
        field: { id: fieldId }, 
        date: dto.date,
        isActive: true 
      },
    });
  
    const newStartMinutes = parseTimeToMinutes(dto.startTime);
    const newEndMinutes = parseTimeToMinutes(dto.endTime);
  
    for (const booking of conflictingBookings) {
      const bookingStart = parseTimeToMinutes(booking.startTime);
      const bookingEnd = parseTimeToMinutes(booking.endTime);
      
      if (newStartMinutes < bookingEnd && newEndMinutes > bookingStart) {
        throw new BadRequestException(
          `Slot overlaps with booking #${booking.id.slice(-4)} (${booking.startTime}-${booking.endTime})`
        );
      }
    }
  
    const booking = this.bookingsRepo.create({
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      totalPrice,
      field,
      user,
    });
  
    return await this.bookingsRepo.save(booking);
  }
  

  async remove(fieldId: string, bookingId: string, userId: string) {
    const booking = await this.bookingsRepo.findOne({
      where: { id: bookingId },
      relations: ['field', 'user'],
    });

    if (!booking || booking.field.id !== fieldId) {
      throw new NotFoundException('Booking not found');
    }

    if (!userId || booking.user.id !== Number(userId)) {
      throw new BadRequestException('Invalid user');
    }

    const slotDateTime = new Date(`${booking.date}T${booking.startTime}:00`);
    if (slotDateTime < new Date()) {
      throw new BadRequestException('Cannot cancel past bookings');
    }

    if (!booking.isActive) {
      throw new BadRequestException('Booking already cancelled');
    }
    

    await this.bookingsRepo.update(booking.id, { 
      isActive: false,
    });

    return { deleted: true };
  }


  async findByFieldAndDate(fieldId: string, date: string) {
    const bookings = await this.bookingsRepo.find({
      where: { 
        field: { id: fieldId }, 
        date,
        isActive: true 
      },
      relations: ['field'], // Need full booking data
    });
  
    // ✅ Generate ALL occupied times from each booking
    const bookedTimes: string[] = [];
    
    bookings.forEach(booking => {
      // Parse times (e.g., "10:00" -> 10*60 = 600 minutes)
      const startMinutes = parseTimeToMinutes(booking.startTime);
      const endMinutes = parseTimeToMinutes(booking.endTime);
      
      // Add every hour slot this booking occupies
      for (let minute = startMinutes; minute < endMinutes; minute += 60) {
        const timeSlot = minutesToTime(minute);
        bookedTimes.push(timeSlot);
      }
    });
  
    return { startTimes: bookedTimes }; // Return as object
  }
  

  async findUserBookings(userId: number) {    
    return this.bookingsRepo.find({
      where: { user: { id: userId } },
      relations: ['field'],
      order: { date: 'DESC', startTime: 'DESC' }
    });
  }


  
  
}
