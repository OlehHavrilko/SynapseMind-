import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../../domain/entities/user.entity';

@ObjectType()
@Entity('learning_stats')
export class LearningStats {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column({ default: 0 })
  totalCards: number;

  @Field()
  @Column({ default: 0 })
  masteredCards: number;

  @Field()
  @Column({ default: 0 })
  totalReviews: number;

  @Field()
  @Column({ default: 0 })
  streak: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  lastReviewDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  lastStudiedAt: Date;

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
