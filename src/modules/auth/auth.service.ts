import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { CustomException } from 'src/common/exceptions/customException';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {}

  async register(userDto: CreateAuthDto, ipAddress: string, userAgent: string) {
    const hashedPassword = await this.hashPassword(userDto.password);
    
    const user = await this.usersService.create({
      ...userDto,
      password: hashedPassword,
    });
    const { password, ...userWithoutPassword } = user;

    // Log successful registration as a login success
    await this.authRepository.save({
      userId: user.id,
      ipAddress,
      userAgent,
      success: true,
    });

    const payload = { username: user.email, sub: user.id, role: user.role };
    return {
      message: 'User registered',
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async hashPassword(plainPassword: string): Promise<string> {
    const saltRounds: number = Number(process.env.SALT_ROUNDS);
    return bcrypt.hash(plainPassword, saltRounds);
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(
    email: string,
    password: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const user = await this.validateUser(email, password);
    let success = false;

    if (!user) {
      // Log failed login attempt without user
      await this.authRepository.save({
        ipAddress,
        userAgent,
        success,
      });
      throw new CustomException(1006);
    }

    success = true;

    await this.authRepository.save({
      userId: user.id,
      ipAddress,
      userAgent,
      success,
    });

    const payload = { username: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}
