import { Controller, Post, Body, Req, Headers, UsePipes, ValidationPipe, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Request } from 'express';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Put('update')
  async updateUser(
    @Req() req: Request,
    @Body() updateUserDto: UpdateAuthDto,
  ) {    
      return this.authService.update(req, updateUserDto);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Post('register')
  async register(
    @Body() createAuthDto: CreateAuthDto,
    @Req() req: Request,
    @Headers('user-agent') userAgent: string,
  ) {
    const ipAddress =
      req.headers['x-forwarded-for']?.toString() ||
      req.socket.remoteAddress ||
      '';
    return this.authService.register(createAuthDto, ipAddress, userAgent);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Post('login')
  async login(
    @Body() body: { email: string; password: string },
    @Req() req: Request,
    @Headers('user-agent') userAgent: string,
  ) {
    const ipAddress =
      req.headers['x-forwarded-for']?.toString() ||
      req.socket.remoteAddress ||
      '';

    return this.authService.login(
      body.email,
      body.password,
      ipAddress,
      userAgent,
    );
  }
}
