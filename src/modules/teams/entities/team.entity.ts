import {
    Column,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import { Tournament } from '../../tournaments/entities/tournament.entity';
  import { Player } from '../../players/entities/player.entity';
  
  @Entity('teams')
  export class Team {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: string;
  
    @ManyToOne(() => Tournament, (tournament) => tournament.teams, {
      onDelete: 'CASCADE',
    })
    tournament: Tournament;
  
    @OneToMany(() => Player, (player) => player.team)
    players: Player[];
  }
  