import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, Length, IsOptional, IsEnum, IsBoolean, IsInt, Min, Max } from 'class-validator';
import { SportPosition } from 'src/common/enums/enums';

export class CreatePlayerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

  @ApiProperty()
  @IsEnum(SportPosition)
  @IsString()
  @IsNotEmpty()
  @Length(2, 30)
  position: SportPosition;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  @Max(99)
  jerseyNumber: number;

  @IsBoolean()
  isCaptain: boolean;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  teamId: string;
}
