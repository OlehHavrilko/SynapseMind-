import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { User } from './user.entity';

@ObjectType()
@Entity('user_goals')
export class UserGoal {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field({ nullable: true })
  @Column({ nullable: true, type: 'text' })
  description: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  targetDate: Date;

  @Field()
  @Column({ default: 0 })
  progress: number;

  @Field()
  @ManyToOne(() => User, user => user.goals, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  userId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}
