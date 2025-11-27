import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ShippingMethod } from './entities/shipping-method.entity';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(ShippingMethod)
    private shippingRepository: Repository<ShippingMethod>,
  ) {}

  async create(createShippingMethodDto: CreateShippingMethodDto): Promise<ShippingMethod> {
    const shippingMethod = this.shippingRepository.create(createShippingMethodDto);
    return this.shippingRepository.save(shippingMethod);
  }

  async findAll(): Promise<ShippingMethod[]> {
    return this.shippingRepository.find({ where: { isActive: true } });
  }

  async findOne(id: number): Promise<ShippingMethod> {
    const shippingMethod = await this.shippingRepository.findOne({ where: { id } });
    if (!shippingMethod) {
      throw new NotFoundException(`Shipping method with ID ${id} not found`);
    }
    return shippingMethod;
  }

  async findById(id: number): Promise<ShippingMethod> {
    const shippingMethod = await this.shippingRepository.findOne({ where: { id, isActive: true } });
    if (!shippingMethod) {
      throw new NotFoundException(`Active shipping method with ID ${id} not found`);
    }
    return shippingMethod;
  }

  async update(id: number, updateShippingMethodDto: UpdateShippingMethodDto): Promise<ShippingMethod> {
    await this.findOne(id);
    await this.shippingRepository.update(id, updateShippingMethodDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const shippingMethod = await this.findOne(id);
    await this.shippingRepository.softDelete(id);
  }
}
