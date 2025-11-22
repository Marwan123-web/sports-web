import { IsOptional, IsNumberString, Max, IsIn } from 'class-validator';

export function createPaginationDto(allowedSortFields: string[]) {
  class PaginationDto {
    @IsOptional()
    @IsNumberString()
    page: string = '1';

    @IsOptional()
    @IsNumberString()
    @Max(100)
    limit: string = '10';

    @IsOptional()
    @IsIn(allowedSortFields)
    sortBy: string = allowedSortFields[0];

    @IsOptional()
    @IsIn(['ASC', 'DESC', 'asc', 'desc'])
    sortOrder: string = 'ASC';
  }

  return PaginationDto;
}
