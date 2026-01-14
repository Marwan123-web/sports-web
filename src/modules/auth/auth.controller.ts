import {
  Controller,
  Post,
  Body,
  Req,
  Headers,
  UsePipes,
  ValidationPipe,
  Put,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Request } from 'express';
import { CustomException } from 'src/common/exceptions/customException';
import { Protected, Roles } from 'src/common/decorators';
@ApiTags('Authentication')
@ApiBearerAuth() // ✅ Global Bearer token docs
@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('whoami')
  @Protected()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        name: 'John Doe',
      },
    },
  })
  async whoAmI(@Req() req: any) {
    return this.authService.whoAmI(req.user.id);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Put('update')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiBearerAuth()
  async updateUser(@Req() req: Request, @Body() updateUserDto: UpdateAuthDto) {
    return this.authService.update(req, updateUserDto);
  }

  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    schema: {
      example: {
        access_token: 'jwt-token-here',
        user: { id: 'uuid', email: 'user@example.com' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Email already exists' })
  @ApiBody({ type: CreateAuthDto })
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
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'jwt-token-here',
        user: { id: 'uuid', email: 'user@example.com' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
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
