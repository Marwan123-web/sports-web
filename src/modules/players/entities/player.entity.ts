import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import { Team } from '../../teams/entities/team.entity';
  
  @Entity('players')
  export class Player {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: string;
  
    @Column()
    surname: string;
  
    @Column({ nullable: true })
    jerseyNumber?: number;
  
    @ManyToOne(() => Team, (team) => team.players, { onDelete: 'CASCADE' })
    team: Team;
  }
  