import { IsIn, IsOptional, IsString } from 'class-validator';
import { SportType } from '../entities/field.entity';

export class CreateFieldDto {
  @IsString()
  name: string;

  @IsIn(['football', 'volleyball', 'basketball'])
  sport: SportType;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  description?: string;
}
