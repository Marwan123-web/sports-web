import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { Team } from '../teams/entities/team.entity';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playersRepo: Repository<Player>,
    @InjectRepository(Team)
    private readonly teamsRepo: Repository<Team>,
  ) {}

  async create(teamId: string, userId: number, dto: CreatePlayerDto) {
    const team = await this.teamsRepo.findOne({
      where: { id: teamId },
      relations: ['tournament', 'tournament.creator'],
    });
    if (!team) throw new NotFoundException('Team not found');

    if (team.tournament.creator.id !== userId) {
      throw new ForbiddenException('Only the tournament creator can add players');
    }

    const player = this.playersRepo.create({
      ...dto,
      team,
    });
    return this.playersRepo.save(player);
  }

  async findAllByTeam(teamId: string) {
    return this.playersRepo.find({
      where: { team: { id: teamId } },
    });
  }

  async update(
    teamId: string,
    playerId: string,
    userId: number,
    dto: UpdatePlayerDto,
  ) {
    const player = await this.playersRepo.findOne({
      where: { id: playerId },
      relations: ['team', 'team.tournament', 'team.tournament.creator'],
    });
    if (!player || player.team.id !== teamId) {
      throw new NotFoundException('Player not found');
    }

    if (player.team.tournament.creator.id !== userId) {
      throw new ForbiddenException('Only the tournament creator can edit players');
    }

    Object.assign(player, dto);
    return this.playersRepo.save(player);
  }

  async remove(teamId: string, playerId: string, userId: number) {
    const player = await this.playersRepo.findOne({
      where: { id: playerId },
      relations: ['team', 'team.tournament', 'team.tournament.creator'],
    });
    if (!player || player.team.id !== teamId) {
      throw new NotFoundException('Player not found');
    }

    if (player.team.tournament.creator.id !== userId) {
      throw new ForbiddenException('Only the tournament creator can delete players');
    }

    await this.playersRepo.remove(player);
    return { deleted: true };
  }
}
