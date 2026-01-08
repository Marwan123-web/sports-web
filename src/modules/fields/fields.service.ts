import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Field } from './entities/field.entity';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';

@Injectable()
export class FieldsService {
  constructor(
    @InjectRepository(Field)
    private readonly fieldsRepo: Repository<Field>,
  ) {}

  create(dto: CreateFieldDto) {
    const field = this.fieldsRepo.create(dto);
    return this.fieldsRepo.save(field);
  }

  async findAll(q?: string, date?: string) {
    const query = this.fieldsRepo
      .createQueryBuilder('field')
      .leftJoinAndSelect('field.bookings', 'booking')
      .where('field.isActive = :isActive', { isActive: true });

    // 👈 SIMPLE: Filter bookings by date
    if (date) {
      query.andWhere('(booking.date = :date OR booking.date IS NULL)', {
        date,
      });
    }

    if (q) {
      const like = `%${q}%`;
      query.andWhere(
        '(field.name ILike :like OR field.sport::text ILike :like OR field.address ILike :like)',
        { like },
      );
    }

    return query.orderBy('field.pricePerHour', 'ASC').getMany();
  }

  async findOne(id: string) {
    const field = await this.fieldsRepo.findOne({ where: { id } });
    if (!field) throw new NotFoundException('Field not found');
    return field;
  }

  async update(id: string, dto: UpdateFieldDto) {
    const field = await this.findOne(id);
    Object.assign(field, dto);
    return this.fieldsRepo.save(field);
  }

  async remove(id: string) {
    const field = await this.findOne(id);
    await this.fieldsRepo.remove(field);
    return { deleted: true };
  }
}
