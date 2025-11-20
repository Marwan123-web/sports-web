import { createPaginationDto } from 'src/common/dtos/pagination.dto';

export const ProductsPaginationDto = createPaginationDto([
  'id',
  'title',
  'category',
  'brand',
  'price',
  'rating',
  'createdAt',
]);
