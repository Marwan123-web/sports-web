import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, Req, ForbiddenException, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { SystemRoles } from 'src/common/guards/roles/roles.enum';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}
  
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @Req() req) {    
    return this.ordersService.create(createOrderDto, req.user.id);
  }

  @Get()
  findAll(@Req() req) {
    return this.ordersService.findAllByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req) {
    return this.ordersService.findOneByUser(id, req.user.id);
  }

  @Roles(SystemRoles.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @Req() req,
  ) {
    return this.ordersService.update(id, updateOrderDto, req.user.id);
  }

  @Roles(SystemRoles.ADMIN)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const order = await this.ordersService.findOne(id);
    if (order.customerId !== req.user.id) {
      throw new ForbiddenException('You do not have permission to delete this order.');
    }
    return this.ordersService.remove(id);
  }
}
