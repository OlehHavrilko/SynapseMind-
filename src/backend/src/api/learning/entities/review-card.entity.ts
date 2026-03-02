import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '../../../domain/entities/user.entity';

export enum Difficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

export enum ReviewQuality {
  AGAIN = 0,
  HARD = 3,
  GOOD = 4,
  EASY = 5,
}

registerEnumType(Difficulty, { name: 'Difficulty' });
registerEnumType(ReviewQuality, { name: 'ReviewQuality' });

@ObjectType()
@Entity('review_cards')
export class ReviewCard {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column()
  question: string;

  @Field()
  @Column({ type: 'text' })
  answer: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  hint: string;

  @Field(() => Difficulty)
  @Column({ type: 'enum', enum: Difficulty, default: Difficulty.MEDIUM })
  difficulty: Difficulty;

  @Field({ nullable: true })
  @Column({ nullable: true })
  conceptId: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  conceptName: string;

  @Field()
  @Column({ default: 1 })
  interval: number;

  @Field()
  @Column({ default: 2.5 })
  easeFactor: number;

  @Field()
  @Column({ default: 0 })
  reviewCount: number;

  @Field()
  @Column({ default: 0 })
  lapses: number;

  @Field()
  @Column({ default: false })
  isMastered: boolean;

  @Field()
  @Column()
  nextReview: Date;

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
