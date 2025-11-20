import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  img: string;

  @Column()
  category: string;

  @Column()
  brand: string;

  @Column()
  price: string; // Consider using number or decimal for calculations

  @Column()
  rating: string; // Consider splitting to rating, maxRating columns or using a float
}
