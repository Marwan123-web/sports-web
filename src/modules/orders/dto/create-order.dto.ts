import { IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;

  @IsInt()
  price: number;
}

export class CreateOrderDto {
  @IsInt()
  customerId: number;

  @IsString()
  @IsOptional()
  status?: string;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];
}
