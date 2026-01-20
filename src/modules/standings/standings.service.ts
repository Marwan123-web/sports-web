import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Tournament } from '../tournaments/entities/tournament.entity';
import { Team } from '../teams/entities/team.entity';
import { Match } from '../matches/entities/match.entity';
import { getPointsConfig, Sport } from 'src/common/enums/enums';

export interface TeamStanding {
  position: number;
  team: {
    id: string;
    name: string;
  };
  matchesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

@Injectable()
export class StandingsService {
  constructor(
    @InjectRepository(Team)
    private readonly teamsRepo: Repository<Team>,
    @InjectRepository(Match)
    private readonly matchesRepo: Repository<Match>,
    @InjectRepository(Tournament)
    private readonly tournamentsRepo: Repository<Tournament>,
  ) {}

  async getTournamentStandings(tournamentId: string): Promise<TeamStanding[]> {
    // ✅ Get all teams in tournament + sport info
    const teams = await this.teamsRepo.find({
      where: { tournament: { id: tournamentId } },
      relations: ['tournament'],
    });

    if (teams.length === 0) {
      return [];
    }

    // Assume all teams share same tournament sport; get from first
    const sport: Sport = teams[0].tournament.sport as Sport; // Adjust relation/path as needed

    const pointsConfig = getPointsConfig(sport);
    const teamIds = teams.map((team) => team.id);

    // ✅ Get all matches for these teams
    const matches = await this.matchesRepo.find({
      where: [{ team1: { id: In(teamIds) } }, { team2: { id: In(teamIds) } }],
      relations: ['team1', 'team2'],
    });

    // ✅ Calculate standings
    const standingsMap = new Map<string, TeamStanding>();

    teams.forEach((team) => {
      standingsMap.set(team.id, {
        position: 0,
        team: { id: team.id, name: team.name },
        matchesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
      });
    });

    matches.forEach((match) => {
      if (
        match.status === 'finished' &&
        match.scoreTeam1 !== null &&
        match.scoreTeam2 !== null
      ) {
        const team1Id = match.team1.id;
        const team2Id = match.team2.id;
        const score1 = match.scoreTeam1!;
        const score2 = match.scoreTeam2!;

        // Update goals
        const team1Stats = standingsMap.get(team1Id)!;
        team1Stats.goalsFor += score1;
        team1Stats.goalsAgainst += score2;

        const team2Stats = standingsMap.get(team2Id)!;
        team2Stats.goalsFor += score2;
        team2Stats.goalsAgainst += score1;

        // Increment matches played
        team1Stats.matchesPlayed++;
        team2Stats.matchesPlayed++;

        // Determine result and award points
        if (score1 > score2) {
          team1Stats.wins++;
          team1Stats.points += pointsConfig.win;
          team2Stats.losses++;
        } else if (score1 < score2) {
          team2Stats.wins++;
          team2Stats.points += pointsConfig.win;
          team1Stats.losses++;
        } else {
          team1Stats.draws++;
          team1Stats.points += pointsConfig.draw;
          team2Stats.draws++;
          team2Stats.points += pointsConfig.draw;
        }
      }
    });

    // ✅ Calculate goal difference
    const standingsArray: TeamStanding[] = Array.from(standingsMap.values());
    standingsArray.forEach((standing) => {
      standing.goalDifference = standing.goalsFor - standing.goalsAgainst;
    });

    // ✅ Sort: Points DESC → GoalDiff DESC → Name ASC
    standingsArray.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference)
        return b.goalDifference - a.goalDifference;
      return a.team.name.localeCompare(b.team.name);
    });

    // ✅ Assign positions
    standingsArray.forEach((standing, index) => {
      standing.position = index + 1;
    });

    return standingsArray;
  }
}
