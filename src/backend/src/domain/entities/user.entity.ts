import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { UserGoal } from './user-goal.entity';
import { UserProject } from './user-project.entity';
import { Document } from '../../documents/entities/document.entity';
import { ReviewCard } from '../../learning/entities/review-card.entity';

export enum SubscriptionPlan {
  STARTER = 'starter',
  PRO = 'pro',
  TEAM = 'team',
  ENTERPRISE = 'enterprise',
}

export enum Profession {
  DEVELOPER = 'developer',
  DESIGNER = 'designer',
  PM = 'pm',
  RESEARCHER = 'researcher',
  STUDENT = 'student',
  OTHER = 'other',
}

export enum LearningStyle {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  MIXED = 'mixed',
}

export enum Theme {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system',
}

registerEnumType(SubscriptionPlan, { name: 'SubscriptionPlan' });
registerEnumType(Profession, { name: 'Profession' });
registerEnumType(LearningStyle, { name: 'LearningStyle' });
registerEnumType(Theme, { name: 'Theme' });

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  avatar: string;

  @Field(() => Profession, { nullable: true })
  @Column({ type: 'enum', enum: Profession, nullable: true })
  profession: Profession;

  @Field(() => SubscriptionPlan)
  @Column({ type: 'enum', enum: SubscriptionPlan, default: SubscriptionPlan.STARTER })
  subscriptionPlan: SubscriptionPlan;

  @Field({ nullable: true })
  @Column({ nullable: true })
  subscriptionExpiresAt: Date;

  @Field(() => [UserGoal])
  @OneToMany(() => UserGoal, goal => goal.user)
  goals: UserGoal[];

  @Field(() => [UserProject])
  @OneToMany(() => UserProject, project => project.user)
  projects: UserProject[];

  @Field(() => [Document])
  @OneToMany(() => Document, document => document.user)
  documents: Document[];

  @Field(() => [ReviewCard])
  @OneToMany(() => ReviewCard, card => card.user)
  reviewCards: ReviewCard[];

  @Field()
  @Column({ default: 'en' })
  language: string;

  @Field(() => LearningStyle)
  @Column({ type: 'enum', enum: LearningStyle, default: LearningStyle.MIXED })
  learningStyle: LearningStyle;

  @Field(() => Theme)
  @Column({ type: 'enum', enum: Theme, default: Theme.DARK })
  theme: Theme;

  @Field()
  @Column({ default: 30 })
  dailyTimeBudget: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
