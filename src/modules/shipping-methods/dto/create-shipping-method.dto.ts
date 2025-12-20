import { IsString, IsNumber, IsNotEmpty, IsPositive, Min } from 'class-validator';

export class CreateShippingMethodDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  @Min(0)
  price: number;
}
