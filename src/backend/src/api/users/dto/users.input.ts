import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { IsEmail, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { Profession, LearningStyle, Theme } from '../../../domain/entities/user.entity';

@InputType()
export class CreateUserInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  passwordHash: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  avatar?: string;

  @Field(() => Profession, { nullable: true })
  @IsOptional()
  @IsEnum(Profession)
  profession?: Profession;
}

@InputType()
export class UpdateProfileInput extends PartialType(CreateUserInput) {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  id?: string;
}

@InputType()
export class UpdatePreferencesInput {
  @Field(() => LearningStyle, { nullable: true })
  @IsOptional()
  @IsEnum(LearningStyle)
  learningStyle?: LearningStyle;

  @Field(() => Theme, { nullable: true })
  @IsOptional()
  @IsEnum(Theme)
  theme?: Theme;

  @Field({ nullable: true })
  @IsOptional()
  @Min(5)
  @Max(480)
  dailyTimeBudget?: number;

  @Field({ nullable: true })
  @IsOptional()
  language?: string;
}

@InputType()
export class CreateGoalInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  targetDate?: Date;
}

@InputType()
export class CreateProjectInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  icon?: string;

  @Field({ nullable: true })
  @IsOptional()
  color?: string;
}
