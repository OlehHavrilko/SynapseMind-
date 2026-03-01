import { InputType, Field, ID, Int } from '@nestjs/graphql';
import { IsEnum, IsOptional, Min, Max } from 'class-validator';
import { ReviewQuality } from '../entities/review-card.entity';

@InputType()
export class CompleteReviewInput {
  @Field(() => ID)
  cardId: string;

  @Field(() => ReviewQuality)
  @IsEnum(ReviewQuality)
  quality: ReviewQuality;
}

@InputType()
export class SnoozeCardInput {
  @Field(() => ID)
  cardId: string;

  @Field()
  @Min(1)
  @Max(30)
  days: number;
}

@InputType()
export class GenerateCardsInput {
  @Field(() => ID)
  conceptId: string;

  @Field()
  conceptName: string;

  @Field({ nullable: true })
  @IsOptional()
  definition?: string;

  @Field(() => Int)
  @Min(1)
  @Max(10)
  count: number;
}
