import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { ShippingMethodsModule } from '../shipping-methods/shipping-methods.module';
import { ShippingMethod } from '../shipping-methods/entities/shipping-method.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, ShippingMethod]),
    ShippingMethodsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
