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
import { getMaxRosterSize, Sport } from 'src/common/enums/enums';

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
    const maxPlayers = getMaxRosterSize(team.tournament.sport as Sport);
    const currentPlayers = await this.playersRepo.count({
      where: { 
        team: { id: dto.teamId },
        isActive: true
      },
    });

    if (currentPlayers >= maxPlayers) {
      throw new BadRequestException(
        `Team is full (${currentPlayers}/${maxPlayers} players). Max ${maxPlayers} for ${team.tournament.sport}`
      );
    }

    if (dto.isCaptain) {
      const existingCaptain = await this.playersRepo.findOne({
        where: { team: { id: dto.teamId }, isCaptain: true }
      });
      if (existingCaptain) throw new BadRequestException('Team already has captain');
    }
  
    if (dto.jerseyNumber) {
      const existingJersey = await this.playersRepo.findOne({
        where: { team: { id: dto.teamId }, jerseyNumber: dto.jerseyNumber }
      });
      if (existingJersey) throw new BadRequestException('Jersey number taken');
    }

    const player = new Player();
    player.name = dto.name;
    player.position = dto.position;
    player.team = team;
    player.isCaptain = dto.isCaptain ?? false;
    player.jerseyNumber = dto.jerseyNumber;

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
