import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  name: string;

  @IsString()
  surname: string;

  @IsOptional()
  @IsInt()
  jerseyNumber?: number;
}
