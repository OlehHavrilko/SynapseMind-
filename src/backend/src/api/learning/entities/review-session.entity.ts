import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../../domain/entities/user.entity';

@ObjectType()
@Entity('review_sessions')
export class ReviewSession {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @CreateDateColumn()
  startedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  endedAt: Date;

  @Field()
  @Column({ default: 0 })
  cardsCompleted: number;

  @Field()
  @Column({ default: 0 })
  correctAnswers: number;

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
