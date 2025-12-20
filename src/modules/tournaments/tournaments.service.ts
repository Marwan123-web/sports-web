import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Tournament } from './entities/tournament.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentsRepo: Repository<Tournament>,
  ) {}

  create(dto: CreateTournamentDto, creatorId: number) {
    const tournament = this.tournamentsRepo.create({
      ...dto,
      creator: { id: creatorId } as any,
    });
    return this.tournamentsRepo.save(tournament);
  }

  findAll(q?: string) {
    if (!q) return this.tournamentsRepo.find();

    const like = `%${q}%`;
    return this.tournamentsRepo.find({
      where: [{ name: ILike(like) }, { sport: ILike(like) as any }],
    });
  }

  async findOne(id: string) {
    const tournament = await this.tournamentsRepo.findOne({
      where: { id },
      relations: ['teams', 'matches'],
    });
    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament;
  }

  async update(id: string, dto: UpdateTournamentDto, userId: number) {
    const tournament = await this.findOne(id);
    if (tournament.creator.id !== userId) {
      throw new ForbiddenException('Only the creator can edit this tournament');
    }
    Object.assign(tournament, dto);
    return this.tournamentsRepo.save(tournament);
  }

  async remove(id: string, userId: number) {
    const tournament = await this.findOne(id);
    if (tournament.creator.id !== userId) {
      throw new ForbiddenException('Only the creator can delete this tournament');
    }
    await this.tournamentsRepo.remove(tournament);
    return { deleted: true };
  }
}
