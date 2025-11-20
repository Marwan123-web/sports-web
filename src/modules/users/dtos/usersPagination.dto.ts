import { createPaginationDto } from 'src/common/dtos/pagination.dto';

export const UsersPaginationDto = createPaginationDto([
  'id',
  'email',
  'name',
  'role',
  'createdAt',
]);
