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
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('api/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(SystemRoles.ADMIN, SystemRoles.USER)
  async findAll(@Query() paginationDto: PaginationDto) {
    const pageNumber = parseInt(paginationDto.page ?? '1', 10);
    const pageSize = Math.min(parseInt(paginationDto.limit ?? '10', 10), 100);
  
    const sortBy = paginationDto.sortBy || 'createdAt';
    const sortOrder = (paginationDto.sortOrder || 'DESC').toUpperCase() as 'ASC' | 'DESC';
  
    return this.usersService.findAllPaginated(pageNumber, pageSize, sortBy, sortOrder);
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

  @Put('/update/:id')
  @UsePipes(ValidationPipe)
  updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  removeUser(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }
}
