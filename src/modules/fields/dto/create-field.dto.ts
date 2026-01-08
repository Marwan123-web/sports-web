import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Sport } from 'src/common/enums/enums';

export class CreateFieldDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: Sport })
  @IsEnum(Sport)
  sport: Sport;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @Min(0)
  pricePerHour: number;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  capacity?: number;
}
