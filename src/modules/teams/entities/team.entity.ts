import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Tournament } from '../../tournaments/entities/tournament.entity';
import { Player } from '../../players/entities/player.entity';
import { Sport } from 'src/common/enums/enums';

@Entity()
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('uuid')
  tournamentId: string; // ✅

  @ManyToOne(() => Tournament, (tournament) => tournament.teams) // Fixed: teams not matches
  @JoinColumn({ name: 'tournamentId' })
  tournament: Tournament;

  @OneToMany(() => Player, (player) => player.team)
  players: Player[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
