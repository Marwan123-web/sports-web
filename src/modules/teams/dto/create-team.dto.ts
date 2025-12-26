import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsIn } from 'class-validator';

export class CreateTeamDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: ['football', 'volleyball', 'basketball'] })
  @IsIn(['football', 'volleyball', 'basketball'])
  sport: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  tournamentId: string;
}
