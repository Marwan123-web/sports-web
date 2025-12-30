import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { Team } from '../teams/entities/team.entity';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playersRepo: Repository<Player>,
    @InjectRepository(Team)
    private readonly teamsRepo: Repository<Team>,
  ) {}

  async create(dto: CreatePlayerDto, userId: number) {
    // ✅ Check team exists + tournament registration open
    const team = await this.teamsRepo.findOne({
      where: {
        id: dto.teamId,
        isActive: true,
      },
      relations: ['tournament'],
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    if (team.tournament.status !== 'registration') {
      throw new BadRequestException('Cannot add players - registration closed');
    }

    // ✅ Max 11 players per team (football/volleyball/basketball)
    const currentPlayers = await this.playersRepo.count({
      where: { team: { id: dto.teamId } },
    });

    if (currentPlayers >= 11) {
      throw new BadRequestException('Team is full (max 11 players)');
    }

    const player = new Player();
    player.name = dto.name;
    player.position = dto.position;
    player.team = team;

    return await this.playersRepo.save(player);
  }

  async findByTeam(teamId: string) {
    return await this.playersRepo.find({
      where: {
        team: { id: teamId },
        isActive: true,
      },
      order: { createdAt: 'ASC' },
      relations: ['team'],
    });
  }

  async findOne(id: string) {
    const player = await this.playersRepo.findOne({
      where: { id, isActive: true },
      relations: ['team', 'team.tournament'],
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    return player;
  }

  async delete(playerId: string) {
    // 1. Find active player with FULL team relation
    const player = await this.playersRepo.findOne({
      where: { id: playerId, isActive: true },
      relations: ['team'],
    });

    if (!player) {
      throw new NotFoundException('Player not found');
    }

    const teamId = player.team?.id;

    // 2. Remove player reference from BOTH SIDES
    player.team = null; // ✅ Player.team = null
    player.isActive = false; // ✅ Soft delete

    // 3. Update team.players array (remove player reference)
    const team = await this.teamsRepo.findOne({
      where: { id: teamId },
      relations: ['players'],
    });

    if (team) {
      team.players = team.players.filter((p) => p.id !== playerId);
      await this.teamsRepo.save(team);
    }

    // 4. Save player
    await this.playersRepo.save(player);

    return {
      message: 'Player removed from team successfully',
      playerId,
    };
  }
}
