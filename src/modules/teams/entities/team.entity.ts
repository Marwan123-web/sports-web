import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { SportType, Tournament } from '../../tournaments/entities/tournament.entity';
import { Player } from '../../players/entities/player.entity';

@Entity()
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['football', 'volleyball', 'basketball'] })
  sport: SportType;

  @ManyToOne(() => Tournament, tournament => tournament.teams)
  tournament: Tournament;

  @OneToMany(() => Player, player => player.team)
  players: Player[];

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
