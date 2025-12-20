import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Field } from '../fields/entities/field.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingsRepo: Repository<Booking>,
    @InjectRepository(Field)
    private readonly fieldsRepo: Repository<Field>,
  ) {}

  async create(fieldId: string, userId: string, dto: CreateBookingDto) {
    const field = await this.fieldsRepo.findOne({ where: { id: fieldId } });
    if (!field) throw new NotFoundException('Field not found');

    const now = new Date();
    const slotDateTime = new Date(`${dto.date}T${dto.time}:00`);

    if (slotDateTime < now) {
      throw new BadRequestException('Cannot book past slots');
    }

    const existing = await this.bookingsRepo.findOne({
      where: {
        field: { id: fieldId },
        date: dto.date,
        time: dto.time,
      },
      relations: ['field'],
    });

    if (existing) {
      throw new BadRequestException('Slot already booked');
    }

    const booking = this.bookingsRepo.create({
      date: dto.date,
      time: dto.time,
      field: { id: fieldId } as Field,
      user: { id: userId } as any,
    });

    return this.bookingsRepo.save(booking);
  }

  async remove(fieldId: string, bookingId: string, userId: string) {
    const booking = await this.bookingsRepo.findOne({
      where: { id: bookingId },
      relations: ['field', 'user'],
    });
  
    if (!booking || booking.field.id !== fieldId) {
      throw new NotFoundException('Booking not found');
    }
  
    const currentUserId = Number(userId); // normalize type
  
    if (booking.user.id !== currentUserId) {
      throw new BadRequestException('Cannot cancel a booking of another user');
    }
  
    const slotDateTime = new Date(`${booking.date}T${booking.time}:00`);
    if (slotDateTime < new Date()) {
      throw new BadRequestException('Cannot cancel past bookings');
    }
  
    await this.bookingsRepo.remove(booking);
    return { deleted: true };
  }
  

  async findByFieldAndDate(fieldId: string, date: string) {
    return this.bookingsRepo.find({
      where: { field: { id: fieldId }, date },
    });
  }
}
