import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Tournament } from '../../tournaments/entities/tournament.entity';
import { Team } from '../../teams/entities/team.entity';

@Entity()
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Tournament, tournament => tournament.matches)
  tournament: Tournament;

  @ManyToOne(() => Team)
  team1: Team;

  @ManyToOne(() => Team)
  team2: Team;

  @Column({ type: 'int', nullable: true })
  scoreTeam1: number | null;

  @Column({ type: 'int', nullable: true })
  scoreTeam2: number | null;

  @Column({ 
    default: 'scheduled',
    enum: ['scheduled', 'live', 'finished']
  })
  status: 'scheduled' | 'live' | 'finished';

  @CreateDateColumn()
  createdAt: Date;
}
