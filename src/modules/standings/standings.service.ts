import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from '../tournaments/entities/tournament.entity';
import { Match } from '../matches/entities/match.entity';
import { Team } from '../teams/entities/team.entity';

@Injectable()
export class StandingsService {
  constructor(
    @InjectRepository(Tournament)
    private readonly tournamentsRepo: Repository<Tournament>,
    @InjectRepository(Match)
    private readonly matchesRepo: Repository<Match>,
    @InjectRepository(Team)
    private readonly teamsRepo: Repository<Team>,
  ) {}

  async getStandings(tournamentId: string) {
    const tournament = await this.tournamentsRepo.findOne({
      where: { id: tournamentId },
    });
    if (!tournament) throw new NotFoundException('Tournament not found');

    const teams = await this.teamsRepo.find({
      where: { tournament: { id: tournamentId } },
    });

    const matches = await this.matchesRepo.find({
      where: { tournament: { id: tournamentId }, status: 'played' },
      relations: ['homeTeam', 'awayTeam'],
    });

    const table = new Map<
      string,
      {
        teamId: string;
        teamName: string;
        played: number;
        points: number;
        scored: number;
        conceded: number;
        diff: number;
      }
    >();

    for (const team of teams) {
      table.set(team.id, {
        teamId: team.id,
        teamName: team.name,
        played: 0,
        points: 0,
        scored: 0,
        conceded: 0,
        diff: 0,
      });
    }

    const isFootball = tournament.sport === 'football';

    for (const match of matches) {
      const home = table.get(match.homeTeam.id);
      const away = table.get(match.awayTeam.id);
      if (!home || !away) continue;

      home.played++;
      away.played++;

      home.scored += match.homeScore ?? 0;
      home.conceded += match.awayScore ?? 0;
      away.scored += match.awayScore ?? 0;
      away.conceded += match.homeScore ?? 0;

      home.diff = home.scored - home.conceded;
      away.diff = away.scored - away.conceded;

      const hs = match.homeScore ?? 0;
      const as = match.awayScore ?? 0;

      if (hs === as) {
        if (isFootball) {
          home.points += 1;
          away.points += 1;
        }
      } else {
        const winner = hs > as ? home : away;
        if (isFootball) {
          winner.points += 3;
        } else {
          winner.points += 2;
        }
      }
    }

    const standings = Array.from(table.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.diff !== a.diff) return b.diff - a.diff;
      return b.scored - a.scored;
    });

    return { tournamentId, sport: tournament.sport, standings };
  }
}
