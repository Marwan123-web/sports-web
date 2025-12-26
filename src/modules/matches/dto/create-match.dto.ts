import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateMatchDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  tournamentId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  team1Id: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  team2Id: string;
}
