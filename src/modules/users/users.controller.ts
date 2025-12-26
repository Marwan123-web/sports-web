import { 
  Controller, 
  Get, 
  Query,
  UsePipes, 
  ValidationPipe 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery 
} from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()  // ✅ Admin protection
@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with their tournaments (Admin)' })
  @ApiQuery({ 
    name: 'q', 
    required: false, 
    description: 'Search by username, name or surname',
    example: 'john'
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
          tournaments: [
            { id: 'uuid', name: 'World Cup 2026' }
          ]
        }
      ]
    }
  })
  @UsePipes(new ValidationPipe({ transform: true }))
  getUsers(@Query('q') q?: string) {
    return this.usersService.findAllWithTournaments(q);
  }
}
