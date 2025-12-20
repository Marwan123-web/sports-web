import { PartialType } from '@nestjs/mapped-types';
import { CreateShippingMethodDto } from './create-shipping-method.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateShippingMethodDto extends PartialType(CreateShippingMethodDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
