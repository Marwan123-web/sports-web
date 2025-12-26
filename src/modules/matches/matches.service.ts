import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from './entities/match.entity';
import { CreateMatchDto } from './dto/create-match.dto';
import { Tournament } from '../tournaments/entities/tournament.entity';
import { Team } from '../teams/entities/team.entity';
import { UpdateMatchResultDto } from './dto/update-match.dto';

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private readonly matchesRepo: Repository<Match>,
    @InjectRepository(Tournament)
    private readonly tournamentsRepo: Repository<Tournament>,
    @InjectRepository(Team)
    private readonly teamsRepo: Repository<Team>,
  ) {}

  async create(dto: CreateMatchDto, userId: number) {
    // ✅ Check tournament exists + registration closed
    const tournament = await this.tournamentsRepo.findOne({
      where: { 
        id: dto.tournamentId, 
        isActive: true 
      },
    });

    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }

    if (tournament.status === 'registration') {
      throw new BadRequestException('Cannot schedule matches during registration');
    }

    // ✅ Check both teams exist + belong to tournament
    const team1 = await this.teamsRepo.findOne({
      where: { id: dto.team1Id, tournament: { id: dto.tournamentId } }
    });
    const team2 = await this.teamsRepo.findOne({
      where: { id: dto.team2Id, tournament: { id: dto.tournamentId } }
    });

    if (!team1 || !team2) {
      throw new NotFoundException('Team not found or not in this tournament');
    }

    if (team1.id === team2.id) {
      throw new BadRequestException('Cannot match team against itself');
    }

    // ✅ Check match doesn't already exist
    const existingMatch = await this.matchesRepo.findOne({
      where: [
        { team1: { id: dto.team1Id }, team2: { id: dto.team2Id } },
        { team1: { id: dto.team2Id }, team2: { id: dto.team1Id } },
      ]
    });

    if (existingMatch) {
      throw new BadRequestException('Match already scheduled');
    }

    const match = new Match();
    match.tournament = tournament;
    match.team1 = team1;
    match.team2 = team2;
    match.status = 'scheduled';

    return await this.matchesRepo.save(match);
  }

  async updateResult(id: string, dto: UpdateMatchResultDto, userId: number) {
    const match = await this.matchesRepo.findOne({
      where: { id },
      relations: ['tournament', 'tournament.creator'],
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    // ✅ Only tournament creator can update results
    if (match.tournament.creator!.id !== userId) {
      throw new ForbiddenException('Only tournament creator can update results');
    }

    if (dto.scoreTeam1 !== undefined || dto.scoreTeam2 !== undefined) {
      match.scoreTeam1 = dto.scoreTeam1 ?? match.scoreTeam1;
      match.scoreTeam2 = dto.scoreTeam2 ?? match.scoreTeam2;
      match.status = 'finished';
    }

    return await this.matchesRepo.save(match);
  }

  async findByTournament(tournamentId: string) {
    return await this.matchesRepo.find({
      where: { 
        tournament: { id: tournamentId },
      },
      order: { createdAt: 'ASC' },
      relations: ['tournament', 'team1', 'team2'],
    });
  }

  async findOne(id: string) {
    const match = await this.matchesRepo.findOne({
      where: { id },
      relations: ['tournament', 'team1', 'team2'],
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    return match;
  }
}
