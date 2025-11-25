import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { Roles } from 'src/common/decorators/roles/roles.decorator';
import { SystemRoles } from 'src/common/guards/roles/roles.enum';
import { UsersPaginationDto } from './dtos/usersPagination.dto';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Roles(SystemRoles.ADMIN)
  @Get()
  async findAll(
    @Query() paginationDto: InstanceType<typeof UsersPaginationDto>,
  ) {
    const pageNumber = parseInt(paginationDto.page ?? '1', 10);
    const pageSize = Math.min(parseInt(paginationDto.limit ?? '10', 10), 100);

    const sortBy = paginationDto.sortBy || 'createdAt';
    const sortOrder = (paginationDto.sortOrder || 'DESC').toUpperCase() as
      | 'ASC'
      | 'DESC';

    return this.usersService.findAllPaginated(
      pageNumber,
      pageSize,
      sortBy,
      sortOrder,
    );
  }

  @Get(':id')
  getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne('id', id);
  }

  // @Post('/add')
  // @UsePipes(ValidationPipe)
  // addUser(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  @Roles(SystemRoles.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Put('/update/:id')
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Roles(SystemRoles.ADMIN)
  @Delete(':id')
  removeUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
