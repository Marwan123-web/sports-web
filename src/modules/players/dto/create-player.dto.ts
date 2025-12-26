import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, Length, IsOptional } from 'class-validator';

export class CreatePlayerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(2, 30)
  position: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  teamId: string;
}
