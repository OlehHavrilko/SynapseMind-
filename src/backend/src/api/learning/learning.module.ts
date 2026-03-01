import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningService } from './learning.service';
import { LearningResolver } from './learning.resolver';
import { ReviewCard } from './entities/review-card.entity';
import { ReviewSession } from './entities/review-session.entity';
import { LearningStats } from './entities/learning-stats.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ReviewCard, ReviewSession, LearningStats])],
  providers: [LearningService, LearningResolver],
  exports: [LearningService],
})
export class LearningModule {}
