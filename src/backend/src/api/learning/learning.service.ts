import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { ReviewCard, ReviewQuality, Difficulty } from './entities/review-card.entity';
import { ReviewSession } from './entities/review-session.entity';
import { LearningStats } from './entities/learning-stats.entity';
import { CompleteReviewInput, GenerateCardsInput } from './dto/learning.input';

@Injectable()
export class LearningService {
  constructor(
    @InjectRepository(ReviewCard)
    private readonly cardRepository: Repository<ReviewCard>,
    @InjectRepository(ReviewSession)
    private readonly sessionRepository: Repository<ReviewSession>,
    @InjectRepository(LearningStats)
    private readonly statsRepository: Repository<LearningStats>,
  ) {}

  async getDueCards(userId: string, limit = 20): Promise<ReviewCard[]> {
    return this.cardRepository.find({
      where: {
        userId,
        nextReview: LessThanOrEqual(new Date()),
        isMastered: false,
      },
      order: { nextReview: 'ASC' },
      take: limit,
    });
  }

  async getReviewSession(userId: string): Promise<{ cards: ReviewCard[]; session: ReviewSession }> {
    const dueCards = await this.getDueCards(userId);
    
    const session = this.sessionRepository.create({
      userId,
      cardsCompleted: 0,
      correctAnswers: 0,
    });
    await this.sessionRepository.save(session);

    return { cards: dueCards, session };
  }

  async completeReview(userId: string, input: CompleteReviewInput): Promise<ReviewCard> {
    const card = await this.cardRepository.findOne({
      where: { id: input.cardId, userId },
    });

    if (!card) {
      throw new NotFoundException('Review card not found');
    }

    const { nextInterval, nextEaseFactor, nextReviewDate } = this.calculateNextReview(
      card.interval,
      card.easeFactor,
      input.quality,
    );

    card.interval = nextInterval;
    card.easeFactor = nextEaseFactor;
    card.nextReview = nextReviewDate;
    card.reviewCount += 1;
    card.lapses += input.quality === ReviewQuality.AGAIN ? 1 : 0;
    card.isMastered = nextInterval >= 21;

    await this.cardRepository.save(card);
    await this.updateStats(userId, input.quality);

    return card;
  }

  private calculateNextReview(
    currentInterval: number,
    currentEaseFactor: number,
    quality: ReviewQuality,
  ): { nextInterval: number; nextEaseFactor: number; nextReviewDate: Date } {
    let nextInterval: number;
    let nextEaseFactor: number;

    if (quality === ReviewQuality.AGAIN) {
      nextInterval = 1;
      nextEaseFactor = Math.max(1.3, currentEaseFactor - 0.2);
    } else if (quality === ReviewQuality.HARD) {
      nextInterval = Math.max(1, Math.round(currentInterval * 1.2));
      nextEaseFactor = Math.max(1.3, currentEaseFactor - 0.15);
    } else if (quality === ReviewQuality.GOOD) {
      nextInterval = Math.round(currentInterval * currentEaseFactor);
      nextEaseFactor = currentEaseFactor;
    } else {
      nextInterval = Math.round(currentInterval * currentEaseFactor * 1.3);
      nextEaseFactor = Math.min(2.5, currentEaseFactor + 0.15);
    }

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

    return { nextInterval, nextEaseFactor, nextReviewDate };
  }

  async generateCards(userId: string, input: GenerateCardsInput): Promise<ReviewCard[]> {
    const cards: ReviewCard[] = [];
    
    const baseQuestions = [
      { question: `What is ${input.conceptName}?`, answer: input.definition || 'Definition pending' },
      { question: `Explain ${input.conceptName} in simple terms.`, answer: input.definition || 'Explanation pending' },
      { question: `What are the key features of ${input.conceptName}?`, answer: 'Key features...' },
      { question: `How does ${input.conceptName} relate to other concepts?`, answer: 'Relationships...' },
      { question: `What are practical applications of ${input.conceptName}?`, answer: 'Applications...' },
    ];

    for (const q of baseQuestions.slice(0, input.count)) {
      const card = this.cardRepository.create({
        userId,
        question: q.question,
        answer: q.answer,
        conceptId: input.conceptId,
        conceptName: input.conceptName,
        difficulty: Difficulty.MEDIUM,
        interval: 1,
        easeFactor: 2.5,
        nextReview: new Date(),
      });
      cards.push(card);
    }

    return this.cardRepository.save(cards);
  }

  async getStats(userId: string): Promise<LearningStats> {
    let stats = await this.statsRepository.findOne({ where: { userId } });
    
    if (!stats) {
      stats = this.statsRepository.create({ userId });
      await this.statsRepository.save(stats);
    }

    const totalCards = await this.cardRepository.count({ where: { userId } });
    const masteredCards = await this.cardRepository.count({ 
      where: { userId, isMastered: true } 
    });
    
    stats.totalCards = totalCards;
    stats.masteredCards = masteredCards;

    return this.statsRepository.save(stats);
  }

  private async updateStats(userId: string, quality: ReviewQuality): Promise<void> {
    let stats = await this.statsRepository.findOne({ where: { userId } });
    
    if (!stats) {
      stats = this.statsRepository.create({ userId });
    }

    stats.totalReviews += 1;
    stats.lastReviewDate = new Date();

    if (quality >= ReviewQuality.GOOD) {
      const lastReview = stats.lastReviewDate;
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        stats.streak += 1;
      } else if (diffDays > 1) {
        stats.streak = 1;
      }
    }

    await this.statsRepository.save(stats);
  }

  async snoozeCard(userId: string, cardId: string, days: number): Promise<ReviewCard> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId, userId },
    });

    if (!card) {
      throw new NotFoundException('Review card not found');
    }

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + days);
    card.nextReview = nextReview;

    return this.cardRepository.save(card);
  }
}
