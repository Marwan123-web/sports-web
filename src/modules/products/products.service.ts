import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CustomException } from 'src/common/exceptions/customException';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepo: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepo.create(createProductDto);
    return this.productRepo.save(product);
  }

  async findAllPaginated(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
  ) {
    const [data, total] = await this.productRepo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { [sortBy]: sortOrder },
    });

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const product = await this.productRepo.findOneBy({ id });
    if (!product) throw new CustomException(1007);
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.productRepo.update(id, updateProductDto);
    const updated = await this.productRepo.findOneBy({ id });
    if (!updated) throw new CustomException(1007);
    return updated;
  }

  async remove(id: number) {
    const result = await this.productRepo.delete(id);
    if (!result.affected) throw new CustomException(1007);
    return { message: 'Product deleted' };
  }
}
