import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { User } from '../../../domain/entities/user.entity';

export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

registerEnumType(TeamRole, { name: 'TeamRole' });

@ObjectType()
@Entity('teams')
export class Team {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description: string;

  @Field()
  @Column()
  ownerId: string;

  @Field(() => [TeamMember])
  @OneToMany(() => TeamMember, member => member.team)
  members: TeamMember[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;
}

@ObjectType()
@Entity('team_members')
export class TeamMember {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  teamId: string;

  @Field()
  @Column()
  userId: string;

  @Field(() => TeamRole)
  @Column({ type: 'enum', enum: TeamRole, default: TeamRole.MEMBER })
  role: TeamRole;

  @Field({ nullable: true })
  @Column({ type: 'jsonb', default: [] })
  expertise: string[];

  @Field(() => Team)
  @ManyToOne(() => Team, team => team.members, { onDelete: 'CASCADE' })
  team: Team;

  @Field(() => User)
  @ManyToOne(() => User)
  user: User;
}
