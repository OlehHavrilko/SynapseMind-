import { InputType, Field, ID, Int, PartialType, registerEnumType } from '@nestjs/graphql';
import { IsOptional, IsEnum, IsUrl } from 'class-validator';
import { DocumentSource, DocumentType } from '../entities/document.entity';

export { DocumentSource, DocumentType };

@InputType()
export class CreateDocumentInput {
  @Field()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  content?: string;

  @Field(() => DocumentSource)
  @IsEnum(DocumentSource)
  source: DocumentSource;

  @Field({ nullable: true })
  @IsOptional()
  @IsUrl()
  sourceUrl?: string;

  @Field(() => DocumentType, { nullable: true })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @Field({ nullable: true })
  @IsOptional()
  thumbnail?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  tags?: string[];
}

@InputType()
export class UpdateDocumentInput extends PartialType(CreateDocumentInput) {
  @Field(() => ID)
  id: string;
}

@InputType()
export class DocumentFilter {
  @Field(() => DocumentSource, { nullable: true })
  @IsOptional()
  @IsEnum(DocumentSource)
  source?: DocumentSource;

  @Field(() => DocumentType, { nullable: true })
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @Field({ nullable: true })
  @IsOptional()
  isProcessed?: boolean;

  @Field({ nullable: true })
  @IsOptional()
  search?: string;
}
