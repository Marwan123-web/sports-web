import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
// import { DatabaseService } from 'src/common/database/database.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    // private databaseService: DatabaseService
  ) {}

  findAll() {
    return this.usersRepository.find({
      select: ['id', 'email', 'name', 'role', 'createdAt', 'updatedAt']
    });
  }

  async findAllPaginated(
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC',
  ) {
    const [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      select: ['id', 'email', 'name', 'role', 'createdAt'], // exclude password
      order: { [sortBy]: sortOrder },
    });

    return {
      data: users,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  findOne(key:string = 'id', value: number | string) {
    return this.usersRepository.findOne({
      where: { [key]: value },
      select: ['id', 'email', 'name', 'role', 'createdAt', 'updatedAt']
    });
  }

  async create(userData: Partial<User>) {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async update(id: number, userData: Partial<User>) {
    await this.usersRepository.update(id, userData);
    return this.findOne('id', id);
  }

  async remove(id: number) {
   const DeleteResult: any =  await this.usersRepository.delete(id);   
    return { deleted: DeleteResult.affected > 0 ?true:false } ;
  }

  findByEmail(email: string) {
    return this.findOne('email', email);
  }
}
