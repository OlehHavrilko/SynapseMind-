import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { CreateDocumentInput, UpdateDocumentInput, DocumentFilter } from './dto/documents.input';
import { GqlAuthGuard } from '../auth/guards/gql-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../../domain/entities/user.entity';

@Resolver(() => Document)
@UseGuards(GqlAuthGuard)
export class DocumentsResolver {
  constructor(private readonly documentsService: DocumentsService) {}

  @Query(() => [Document])
  async documents(
    @CurrentUser() user: User,
    @Args('filter', { nullable: true }) filter?: DocumentFilter,
    @Args('limit', { type: () => Int, defaultValue: 20 }) limit?: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset?: number,
  ): Promise<Document[]> {
    return this.documentsService.findAll(user.id, filter, limit, offset);
  }

  @Query(() => Document)
  async document(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Document> {
    return this.documentsService.findById(id, user.id);
  }

  @Query(() => Document, { nullable: true })
  async documentByUrl(
    @CurrentUser() user: User,
    @Args('url') url: string,
  ): Promise<Document | null> {
    return this.documentsService.findByUrl(url, user.id);
  }

  @Mutation(() => Document)
  async importDocument(
    @CurrentUser() user: User,
    @Args('input') input: CreateDocumentInput,
  ): Promise<Document> {
    return this.documentsService.create(user.id, input);
  }

  @Mutation(() => Document)
  async updateDocument(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateDocumentInput,
  ): Promise<Document> {
    return this.documentsService.update(id, user.id, input);
  }

  @Mutation(() => Boolean)
  async deleteDocument(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.documentsService.delete(id, user.id);
  }

  @Mutation(() => Document)
  async processDocument(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Document> {
    return this.documentsService.processDocument(id, user.id);
  }
}
