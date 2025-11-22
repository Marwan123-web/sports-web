import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsPaginationDto } from './dto/productsPagination.dto';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { SystemRoles } from 'src/common/guards/roles/roles.enum';
@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(SystemRoles.ADMIN)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Post('import')
  bulkCreate(@Body() products: CreateProductDto[]) {
    return this.productsService.importProducts(products);
  }

  @Get()
  async findAll(
    @Query() paginationDto: InstanceType<typeof ProductsPaginationDto>,
  ) {
    const page = parseInt(paginationDto.page ?? '1', 10);
    const limit = Math.min(parseInt(paginationDto.limit ?? '10', 10), 100);
    const sortBy = paginationDto.sortBy || 'id';
    const sortOrder = (paginationDto.sortOrder || 'ASC').toUpperCase() as
      | 'ASC'
      | 'DESC';
    return this.productsService.findAllPaginated(
      page,
      limit,
      sortBy,
      sortOrder,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(Number(id));
  }

  @Roles(SystemRoles.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(Number(id), updateProductDto);
  }

  @Roles(SystemRoles.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(Number(id));
  }
}
