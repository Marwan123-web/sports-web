import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  getUsers(@Query('q') q?: string) {
    return this.usersService.findAllWithTournaments(q);
  }
}
