import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { Match } from '../../matches/entities/match.entity';
import { User } from 'src/modules/users/entities/user.entity';
import { Sport } from 'src/common/enums/enums';

// export type SportType = 'football' | 'volleyball' | 'basketball';

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  name: string;

  @Column({
    type: 'enum',
    enum: Sport,
    default: Sport.FOOTBALL,
  })
  sport: Sport | string;

  @Column({ default: 16 })
  maxTeams: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ default: 'registration' })
  status: 'registration' | 'ongoing' | 'finished' | 'cancelled';

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'creatorId' })
  creator?: User;

  @Column({ default: 0 })
  currentTeams: number;

  @OneToMany(() => Team, (team) => team.tournament, { cascade: true })
  teams: Team[];

  @OneToMany(() => Match, (match) => match.tournament, { cascade: true })
  matches: Match[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}
