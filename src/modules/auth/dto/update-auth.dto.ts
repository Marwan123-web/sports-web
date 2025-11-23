import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthDto } from './create-auth.dto';
import { IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class UpdateAuthDto extends PartialType(CreateAuthDto) {
    @IsOptional()
    @IsNotEmpty()
    @MinLength(6)
    oldPassword: string;
}

