import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { SystemRoles } from 'src/common/guards/roles/roles.enum';

@ApiTags('Users')
@ApiBearerAuth() // ✅ Admin protection
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with their tournaments (Admin)' })
  @ApiQuery({
    name: 'q',
    required: false,
    description: 'Search by username, name or surname',
    example: 'john',
  })
  @ApiResponse({
    status: 200,
    description: 'Users list with tournaments',
    schema: {
      example: [
        {
          id: 1,
          username: 'john_doe',
          name: 'John',
          surname: 'Doe',
          tournaments: [{ id: 'uuid', name: 'World Cup 2026' }],
        },
      ],
    },
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  @Roles(SystemRoles.ADMIN)
  getUsers(@Query('q') q?: string) {
    return this.usersService.findAllWithTournaments(q);
  }

  @Put(':id')
  @Roles(SystemRoles.ADMIN)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  updateUser(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
