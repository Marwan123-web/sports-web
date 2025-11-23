import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { CustomException } from 'src/common/exceptions/customException';
import * as jwt from 'jsonwebtoken';
import { Request } from 'express';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {}

  async register(userDto: CreateAuthDto, ipAddress: string, userAgent: string) {
    const emailFound = await this.usersService.findByEmail(userDto.email);
    if (emailFound) {
      throw new CustomException(1008);
    }

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
  async update(req: Request, userData: Partial<UpdateAuthDto>) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new CustomException(1000);

    const token = authHeader.split(' ')[1];
    if (!token) throw new CustomException(1000);

    const secret = process.env.JWT_SECRET || '';
    let decoded: { sub?: string };
    try {
      decoded = jwt.verify(token, secret) as { sub?: string };
    } catch {
      throw new CustomException(1000);
    }

    const userId = decoded.sub;
    if (!userId) throw new CustomException(1000);

    const user = await this.usersService.findOne('id', +userId);
    if (!user) throw new CustomException(1004);

    const { email: currentEmail } = user;

    if (userData.email && userData.email !== currentEmail) {
      const emailFound = await this.usersService.findByEmail(userData.email);
      if (emailFound) throw new CustomException(1008);
    }

    let newHashedPassword = '';
    if (userData.password) {
      const userFound = await this.usersService.findByEmail(user.email);
      const samePassword = await bcrypt.compare(
        userData.oldPassword || '',
        userFound!.password,
      );

      if (!samePassword) throw new CustomException(1009);

      newHashedPassword = await this.hashPassword(userData.password);
    }

    const { oldPassword, ...newData } = userData;
    await this.usersService.update(+userId, {
      ...newData,
      ...(newHashedPassword && { password: newHashedPassword }),
    });

    return this.usersService.findOne('id', +userId);
  }
}
