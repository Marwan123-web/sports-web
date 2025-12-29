import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Tournament } from './entities/tournament.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentsRepo: Repository<Tournament>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async create(dto: CreateTournamentDto, creatorId: number) {
    // ✅ Validate creator exists
    const creator = await this.usersRepo.findOne({ where: { id: creatorId } });
    if (!creator) throw new NotFoundException('Creator not found');
  
    const startDate = new Date(dto.startDate + 'T00:00:00');
    const endDate = new Date(dto.endDate + 'T00:00:00');
    
    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }
  
    const tournament = this.tournamentsRepo.create({
      ...dto,
      creator: { id: creatorId },  // ✅ Reference only!
      status: 'registration',
      currentTeams: 0,
      isActive: true,
    });
    
    return await this.tournamentsRepo.save(tournament);  // ✅ Auto-links creator
  }

  findAll(q?: string) {
    const baseWhere: any = { isActive: true };

    if (!q) {
      return this.tournamentsRepo.find({
        where: baseWhere,
        order: { startDate: 'ASC' },
        relations: ['creator'],
      });
    }

    const like = `%${q}%`;
    const isSportMatch = ['football', 'volleyball', 'basketball'].includes(q.toLowerCase());

    return this.tournamentsRepo.find({
      where: isSportMatch 
        ? [
            // ✅ Exact sport OR name search
            { sport: q as any, isActive: true },
            { name: ILike(like), isActive: true },
          ]
        : [{ name: ILike(like), isActive: true }],
      order: { startDate: 'ASC' },
      relations: ['creator'],
    });
  }

  async findOne(id: string) {
    const tournament = await this.tournamentsRepo.findOne({
      where: { id, isActive: true },
      relations: ['creator', 'teams', 'matches'],
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    return tournament;
  }

  async update(id: string, dto: UpdateTournamentDto, userId: number) {
    const tournament = await this.findOne(id);
    
    if (tournament.creator!.id !== userId) {
      throw new ForbiddenException('Only the creator can edit this tournament');
    }

    if (dto.startDate && dto.endDate) {
      if (new Date(dto.startDate) > new Date(dto.endDate)) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    Object.assign(tournament, {
      ...dto,
      updatedAt: new Date(),
    });

    return await this.tournamentsRepo.save(tournament);
  }

  async remove(id: string, userId: number) {
    const tournament = await this.findOne(id);
    
    if (tournament.creator!.id !== userId) {
      throw new ForbiddenException('Only the creator can delete this tournament');
    }

    await this.tournamentsRepo.update(id, { 
      isActive: false 
    });
    
    return { deleted: true };
  }

  async findUpcoming() {
    const now = new Date();
    return this.tournamentsRepo.find({
      where: { 
        isActive: true,
        startDate: MoreThanOrEqual(now.toISOString().split('T')[0])
      },
      order: { startDate: 'ASC' },
      relations: ['creator'],
      take: 10,
    });
  }

  async getStats(id: string) {
    const tournament = await this.findOne(id);
    return {
      totalTeams: tournament.teams?.length || 0,
      maxTeams: tournament.maxTeams,
      registrationOpen: tournament.status === 'registration',
      matchesCount: tournament.matches?.length || 0,
    };
  }
}
