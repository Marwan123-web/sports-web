import { IsDateString, IsString, Matches } from 'class-validator';

export class CreateBookingDto {
  @IsDateString()
  date: string; // YYYY-MM-DD

  // very simple time validation HH:MM
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  time: string;
}
