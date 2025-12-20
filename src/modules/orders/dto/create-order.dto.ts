import { IsInt, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @IsInt()
  productId: number;

  @IsInt()
  quantity: number;
}

export class CreateOrderDto {
  @IsInt()
  shippingMethodId: number;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];
}
