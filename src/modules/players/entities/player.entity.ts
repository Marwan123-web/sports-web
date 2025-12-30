import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity';

@Entity()
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  position: string; // "forward", "defender", "goalkeeper", etc.

  @ManyToOne(() => Team, (team) => team.players)
  team: Team | null;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
