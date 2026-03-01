import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GraphService } from './graph.service';
import { KnowledgeGraph, Concept, ConceptConnection, GraphStats, CreateConceptInput, AddConnectionInput } from './dto/graph.types';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../domain/entities/user.entity';

@Resolver()
@UseGuards(GqlAuthGuard)
export class GraphResolver {
  constructor(private readonly graphService: GraphService) {}

  @Query(() => KnowledgeGraph)
  async knowledgeGraph(@CurrentUser() user: User): Promise<KnowledgeGraph> {
    return this.graphService.getKnowledgeGraph(user.id);
  }

  @Query(() => [Concept])
  async concepts(
    @CurrentUser() user: User,
    @Args('search', { nullable: true }) search?: string,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit?: number,
  ): Promise<Concept[]> {
    return this.graphService.getConcepts(user.id, search, limit);
  }

  @Query(() => Concept)
  async concept(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Concept> {
    const concepts = await this.graphService.getConcepts(user.id);
    return concepts.find(c => c.id === id) as Concept;
  }

  @Query(() => [Concept])
  async findPath(
    @CurrentUser() user: User,
    @Args('fromId', { type: () => ID }) fromId: string,
    @Args('toId', { type: () => ID }) toId: string,
  ): Promise<Concept[]> {
    return this.graphService.findPath(user.id, fromId, toId);
  }

  @Query(() => GraphStats)
  async graphStats(@CurrentUser() user: User): Promise<GraphStats> {
    return this.graphService.getStats(user.id);
  }

  @Mutation(() => Concept)
  async createConcept(
    @CurrentUser() user: User,
    @Args('input') input: CreateConceptInput,
  ): Promise<Concept> {
    return this.graphService.createConcept(user.id, input.name, input.definition);
  }

  @Mutation(() => ConceptConnection)
  async addConnection(
    @CurrentUser() user: User,
    @Args('input') input: AddConnectionInput,
  ): Promise<ConceptConnection> {
    return this.graphService.addConnection(user.id, input.fromId, input.toId, input.relationship);
  }

  @Mutation(() => Boolean)
  async deleteConcept(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.graphService.deleteConcept(user.id, id);
  }

  @Mutation(() => Boolean)
  async detectRelationships(@CurrentUser() user: User): Promise<boolean> {
    await this.graphService.detectRelationships(user.id);
    return true;
  }
}
