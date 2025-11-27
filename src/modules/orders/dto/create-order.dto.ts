import { IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested, ArrayMinSize, IsArray, IsNumber, Min } from 'class-validator';
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

  @IsNumber()
  @IsOptional()
  @Min(0)
  shippingPrice?: number;

  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];
}
