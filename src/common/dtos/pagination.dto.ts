import { IsNumberString, IsOptional, Max, IsIn } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsNumberString()
  page: string = '1';

  @IsOptional()
  @IsNumberString()
  @Max(100)
  limit: string = '10';

  @IsOptional()
  @IsIn(['id', 'email', 'name', 'role', 'createdAt'])
  sortBy: string = 'createdAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortOrder: string = 'DESC';
}
