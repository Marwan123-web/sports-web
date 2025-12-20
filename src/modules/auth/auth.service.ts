import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { AuthLog } from './entities/auth.entity';
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
    @InjectRepository(AuthLog)
    private authRepository: Repository<AuthLog>,
  ) {}

  // SIGNUP
  async register(
    userDto: CreateAuthDto,
    ipAddress: string,
    userAgent: string,
  ) {
    const existing = await this.usersService.findByUsername(userDto.username);
    if (existing) {
      throw new CustomException(1008); // username already used
    }

    const hashedPassword = await this.hashPassword(userDto.password);

    const user = await this.usersService.create({
      username: userDto.username,
      name: userDto.name,
      surname: userDto.surname,
      password: hashedPassword,
    });

    const { password, ...userWithoutPassword } = user;

    await this.authRepository.save({
      userId: user.id,
      ipAddress,
      userAgent,
      success: true,
    });

    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      message: 'User registered',
      access_token: this.jwtService.sign(payload),
      user: userWithoutPassword,
    };
  }

  async hashPassword(plainPassword: string): Promise<string> {
    const saltRounds: number = Number(process.env.SALT_ROUNDS || 10);
    return bcrypt.hash(plainPassword, saltRounds);
  }

  // validate by username
  async validateUser(username: string, password: string) {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // SIGNIN
  async login(
    username: string,
    password: string,
    ipAddress: string,
    userAgent: string,
  ) {
    const user = await this.validateUser(username, password);
    let success = false;

    if (!user) {
      await this.authRepository.save({
        ipAddress,
        userAgent,
        success,
      });
      throw new CustomException(1006); // invalid credentials
    }

    success = true;

    await this.authRepository.save({
      userId: user.id,
      ipAddress,
      userAgent,
      success,
    });

    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  // UPDATE PROFILE (username / name / surname / password)
  async update(req: Request, userData: Partial<UpdateAuthDto>) {
    const authHeader = req.headers['authorization'];
    if (!authHeader) throw new CustomException(1000);

    const token = authHeader.split(' ')[1];
    if (!token) throw new CustomException(1000);

    const secret = process.env.JWT_SECRET || '';
    let decoded: { sub?: number };
    try {
      decoded = jwt.verify(token, secret) as { sub?: number };
    } catch {
      throw new CustomException(1000);
    }

    const userId = decoded.sub;
    if (!userId) throw new CustomException(1000);

    const user = await this.usersService.findById(userId);
    if (!user) throw new CustomException(1004);

    // check username uniqueness if changed
    if (
      userData.username &&
      userData.username !== user.username
    ) {
      const existing = await this.usersService.findByUsername(
        userData.username,
      );
      if (existing) throw new CustomException(1008);
    }

    let newHashedPassword = '';
    if (userData.password) {
      const userFound = await this.usersService.findById(userId);
      const samePassword = await bcrypt.compare(
        userData.oldPassword || '',
        userFound!.password,
      );

      if (!samePassword) throw new CustomException(1009);

      newHashedPassword = await this.hashPassword(userData.password);
    }

    const { oldPassword, ...newData } = userData;
    await this.usersService.update(userId, {
      ...newData,
      ...(newHashedPassword && { password: newHashedPassword }),
    });

    return this.usersService.findById(userId);
  }
}
