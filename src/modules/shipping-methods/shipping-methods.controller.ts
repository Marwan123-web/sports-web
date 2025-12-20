import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { CreateShippingMethodDto } from './dto/create-shipping-method.dto';
import { UpdateShippingMethodDto } from './dto/update-shipping-method.dto';
import { ShippingService } from './shipping-methods.service';

@Controller('api/shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post()
  create(@Body() createShippingMethodDto: CreateShippingMethodDto) {    
    return this.shippingService.create(createShippingMethodDto);
  }

  @Get()
  findAll() {
    return this.shippingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shippingService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateShippingMethodDto: UpdateShippingMethodDto,
  ) {
    return this.shippingService.update(id, updateShippingMethodDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.shippingService.remove(id);
  }
}
