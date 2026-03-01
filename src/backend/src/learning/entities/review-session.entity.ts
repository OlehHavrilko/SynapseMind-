import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from '../../domain/entities/user.entity';

@ObjectType()
@Entity('review_sessions')
export class ReviewSession {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ default: 0 })
  cardsCompleted: number;

  @Field()
  @Column({ default: 0 })
  correctAnswers: number;

  @Field()
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @Field()
  @CreateDateColumn()
  startedAt: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  endedAt: Date;
}
