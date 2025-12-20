import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Tournament } from '../../tournaments/entities/tournament.entity';
import { Team } from '../../teams/entities/team.entity';

export type MatchStatus = 'upcoming' | 'played';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tournament, (t) => t.matches, { onDelete: 'CASCADE' })
  tournament: Tournament;

  @ManyToOne(() => Team, { eager: true })
  homeTeam: Team;

  @ManyToOne(() => Team, { eager: true })
  awayTeam: Team;

  @Column({ type: 'timestamp', nullable: true })
  date: Date | null;

  @Column({ type: 'uuid', nullable: true }) // or 'int' if Field.id is number
  fieldId: string | null;

  @Column({ type: 'varchar', default: 'upcoming' })
  status: MatchStatus;

  @Column({ type: 'int', nullable: true })
  homeScore: number | null;

  @Column({ type: 'int', nullable: true })
  awayScore: number | null;
}
