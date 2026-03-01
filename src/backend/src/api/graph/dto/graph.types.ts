import { ObjectType, Field, ID, Float, InputType, registerEnumType } from '@nestjs/graphql';

export enum RelationshipType {
  RELATED_TO = 'RELATED_TO',
  IS_A = 'IS_A',
  PART_OF = 'PART_OF',
  DEPENDS_ON = 'DEPENDS_ON',
  CONTRADICTS = 'CONTRADICTS',
  SUPPORTS = 'SUPPORTS',
  EXAMPLE_OF = 'EXAMPLE_OF',
  SIMILAR = 'SIMILAR',
}

registerEnumType(RelationshipType, { name: 'RelationshipType' });

@ObjectType()
export class Concept {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  definition?: string;

  @Field(() => Float)
  importance: number;

  @Field({ nullable: true })
  notes?: string;

  @Field({ nullable: true })
  createdAt?: Date;
}

@ObjectType()
export class ConceptConnection {
  @Field(() => ID)
  id: string;

  @Field()
  source: string;

  @Field()
  target: string;

  @Field(() => RelationshipType)
  relationship: RelationshipType;

  @Field(() => Float)
  strength: number;
}

@ObjectType()
export class ConceptGap {
  @Field()
  missingConcept: string;

  @Field()
  relevance: number;
}

@ObjectType()
export class GraphStats {
  @Field()
  totalNodes: number;

  @Field()
  totalEdges: number;

  @Field(() => Float)
  density: number;

  @Field(() => [Concept])
  topConcepts: Concept[];

  @Field(() => [ConceptGap])
  gaps: ConceptGap[];
}

@ObjectType()
export class KnowledgeGraph {
  @Field(() => [Concept])
  nodes: Concept[];

  @Field(() => [ConceptConnection])
  edges: ConceptConnection[];

  @Field(() => GraphStats)
  stats: GraphStats;
}

@InputType()
export class CreateConceptInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  definition?: string;
}

@InputType()
export class AddConnectionInput {
  @Field(() => ID)
  fromId: string;

  @Field(() => ID)
  toId: string;

  @Field(() => RelationshipType)
  relationship: RelationshipType;
}
