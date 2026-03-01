import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { SynapseResponse, AskSynapseInput, ExplainConceptInput, GeneratePracticeInput, PracticeTask } from './dto/ai.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../domain/entities/user.entity';

@Resolver()
@UseGuards(GqlAuthGuard)
export class AiResolver {
  constructor(private readonly aiService: AiService) {}

  @Mutation(() => SynapseResponse)
  async askSynapse(
    @CurrentUser() user: User,
    @Args('input') input: AskSynapseInput,
  ): Promise<SynapseResponse> {
    return this.aiService.askSynapse(user.id, input);
  }

  @Mutation(() => SynapseResponse)
  async explainConcept(
    @CurrentUser() user: User,
    @Args('input') input: ExplainConceptInput,
  ): Promise<SynapseResponse> {
    return this.aiService.explainConcept(user.id, input);
  }

  @Mutation(() => PracticeTask)
  async generatePracticeTask(
    @CurrentUser() user: User,
    @Args('input') input: GeneratePracticeInput,
  ): Promise<PracticeTask> {
    return this.aiService.generatePracticeTask(user.id, input);
  }
}
