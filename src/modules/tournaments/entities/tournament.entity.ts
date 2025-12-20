import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
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
    name: string;
  
    @Column({ type: 'varchar' })
    sport: SportType;
  
    @Column()
    maxTeams: number;
  
    @Column({ type: 'date' })
    startDate: string;
  
    @ManyToOne(() => User, (user) => user.tournaments, { eager: true })
    creator: User;
  
    @OneToMany(() => Team, (team) => team.tournament)
    teams: Team[];
  
    @OneToMany(() => Match, (match) => match.tournament)
    matches: Match[];
  }
  