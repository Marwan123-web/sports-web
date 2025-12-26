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

export type SportType = 'football' | 'volleyball' | 'basketball';

@Entity('tournaments')
export class Tournament {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()  // ✅ Fast search
  name: string;

  @Column({
    type: 'enum',
    enum: ['football', 'volleyball', 'basketball'],  // ✅ DB enum
  })
  sport: SportType ;

  @Column({ default: 16 })  // ✅ Default value
  maxTeams: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;  // ✅ Added - missing!

  @Column({ default: 'registration' })  // ✅ Tournament phases
  status: 'registration' | 'ongoing' | 'finished' | 'cancelled';


  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'creatorId' })
  creator?: User;

  @Column({ default: 0 })
  currentTeams: number;  // ✅ Track registration count

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
