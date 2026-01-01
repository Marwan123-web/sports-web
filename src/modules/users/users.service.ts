import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  findByUsername(username: string) {
    return this.usersRepo.findOne({ where: { username } });
  }

  findById(id: number) {
    return this.usersRepo.findOne({ where: { id } });
  }

  // ✅ FIXED: Use new User() instead of create()
  async create(data: Partial<User>) {
    const user = new User();
    Object.assign(user, data);
    return this.usersRepo.save(user);
  }

  async update(id: number, data: Partial<User>) {
    await this.usersRepo.update(id, data);
    return this.findById(id);
  }

  findAllWithTournaments(q?: string) {
    const where = q
      ? [
          { username: ILike(`%${q}%`) },
          { name: ILike(`%${q}%`) },
          { surname: ILike(`%${q}%`) },
          { email: ILike(`%${q}%`) },
        ]
      : {};
    return this.usersRepo.find({
      where,
      relations: ['tournaments'],  // ✅ Fixed relation name
    });
  }
}
