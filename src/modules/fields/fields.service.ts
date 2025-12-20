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

  findAll(q?: string) {
    if (!q) return this.fieldsRepo.find();

    const like = `%${q}%`;
    return this.fieldsRepo.find({
      where: [
        { name: ILike(like) },
        { sport: ILike(like) as any },
        { address: ILike(like) },
      ],
    });
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
