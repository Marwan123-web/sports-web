import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Tournament } from '../../tournaments/entities/tournament.entity';
import { Team } from '../../teams/entities/team.entity';

@Entity()
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 1, nullable: false })
  round: number;

  @Column({ default: 'scheduled' })
  status: string; // 'scheduled', 'completed', etc.

  @Column({ nullable: true })
  scoreTeam1: number;

  @Column({ nullable: true })
  scoreTeam2: number;

  @ManyToOne(() => Tournament, (tournament) => tournament.matches)
  @JoinColumn({ name: 'tournamentId' })
  tournament: Tournament;

  @Column('uuid')
  tournamentId: string; // ✅ Foreign key

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'team1Id' })
  team1: Team;

  @Column({ nullable: false })
  team1Id: string; // ✅ Foreign key

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'team2Id' })
  team2: Team;

  @Column({ nullable: false })
  team2Id: string; // ✅ Foreign key

  @Column({ type: 'timestamptz', nullable: true })
  scheduledAt?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
