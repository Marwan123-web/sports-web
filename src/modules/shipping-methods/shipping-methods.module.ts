import { Module } from '@nestjs/common';
import { ShippingController } from './shipping-methods.controller';
import { ShippingService } from './shipping-methods.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingMethod } from './entities/shipping-method.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ShippingMethod])],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingMethodsModule {}
