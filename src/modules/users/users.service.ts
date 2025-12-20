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

  async create(data: Partial<User>) {
    const user = this.usersRepo.create(data);
    return this.usersRepo.save(user);
  }

  // add this
  async update(id: number, data: Partial<User>) {
    await this.usersRepo.update(id, data);
    return this.findById(id);
  }

  // optional: user list with tournaments they created
  findAllWithTournaments(q?: string) {
    const where = q
      ? [
          { username: ILike(`%${q}%`) },
          { name: ILike(`%${q}%`) },
          { surname: ILike(`%${q}%`) },
        ]
      : {};
    return this.usersRepo.find({
      where,
      relations: ['tournaments'],
    });
  }
}
