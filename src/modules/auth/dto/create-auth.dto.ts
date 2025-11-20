import { IsEmail, IsNotEmpty, MinLength, IsString } from 'class-validator';

export class CreateAuthDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
