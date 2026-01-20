import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Field } from './entities/field.entity';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { Sport } from 'src/common/enums/enums';

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

  async findAll(filters?: {
    sport?: Sport;
    date?: string;
    q?: string;
    priceFrom?: number;
    priceTo?: number;
    address?: string;
  }) {
    const query = this.fieldsRepo
      .createQueryBuilder('field')
      .leftJoinAndSelect('field.bookings', 'booking')
      .leftJoinAndSelect('booking.user', 'user')
      .where('field.isActive = :isActive', { isActive: true });

    if (filters?.sport) {
      query.andWhere('field.sport::text ILike :sport', {
        sport: `%${filters.sport}%`,
      });
    }

    // if (filters?.date) {
    //   query.andWhere('(booking.date = :date OR booking.date IS NULL)', {
    //     date: filters.date,
    //   });
    // }

    if (filters?.q) {
      const like = `%${filters.q}%`;
      query.andWhere(
        '(field.name ILike :like OR field.sport::text ILike :like OR field.address ILike :like)',
        { like },
      );
    }

    if (filters?.priceFrom !== undefined) {
      query.andWhere('field.pricePerHour >= :priceFrom', {
        priceFrom: filters.priceFrom,
      });
    }
    if (filters?.priceTo !== undefined) {
      query.andWhere('field.pricePerHour <= :priceTo', {
        priceTo: filters.priceTo,
      });
    }

    if (filters?.address) {
      query.andWhere('field.address ILike :city', {
        city: `%${filters.address}%`,
      });
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
