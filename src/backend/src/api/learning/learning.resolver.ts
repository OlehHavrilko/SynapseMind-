import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { LearningService } from './learning.service';
import { ReviewCard } from './entities/review-card.entity';
import { ReviewSession } from './entities/review-session.entity';
import { LearningStats } from './entities/learning-stats.entity';
import { CompleteReviewInput, GenerateCardsInput, SnoozeCardInput } from './dto/learning.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../domain/entities/user.entity';

@Resolver()
@UseGuards(GqlAuthGuard)
export class LearningResolver {
  constructor(private readonly learningService: LearningService) {}

  @Query(() => [ReviewCard])
  async reviewCards(
    @CurrentUser() user: User,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit: number,
  ): Promise<ReviewCard[]> {
    return this.learningService.getDueCards(user.id, limit);
  }

  @Query(() => ReviewSession)
  async reviewSession(@CurrentUser() user: User): Promise<ReviewSession> {
    const { session } = await this.learningService.getReviewSession(user.id);
    return session;
  }

  @Query(() => LearningStats)
  async learningStats(@CurrentUser() user: User): Promise<LearningStats> {
    return this.learningService.getStats(user.id);
  }

  @Mutation(() => ReviewCard)
  async completeReview(
    @CurrentUser() user: User,
    @Args('input') input: CompleteReviewInput,
  ): Promise<ReviewCard> {
    return this.learningService.completeReview(user.id, input);
  }

  @Mutation(() => ReviewCard)
  async snoozeReview(
    @CurrentUser() user: User,
    @Args('input') input: SnoozeCardInput,
  ): Promise<ReviewCard> {
    return this.learningService.snoozeCard(user.id, input.cardId, input.days);
  }

  @Mutation(() => [ReviewCard])
  async generateMoreCards(
    @CurrentUser() user: User,
    @Args('input') input: GenerateCardsInput,
  ): Promise<ReviewCard[]> {
    return this.learningService.generateCards(user.id, input);
  }
}
, input);
 