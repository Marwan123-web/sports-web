import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Team } from '../../teams/entities/team.entity';
import { SportPosition } from 'src/common/enums/enums';

@Entity()
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: SportPosition,
    default: SportPosition.DEFAULT
  })
  position: SportPosition;

  @Column({ nullable: true })
  jerseyNumber: number; 

  @Column({ default: false })
  isCaptain: boolean; 

  @ManyToOne(() => Team, (team) => team.players)
  team: Team | null;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
