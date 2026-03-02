import { ObjectType, Field, ID, InputType, registerEnumType } from '@nestjs/graphql';
import { Concept } from '../../graph/dto/graph.types';

export enum ActionType {
  SHOW_GRAPH = 'SHOW_GRAPH',
  START_REVIEW = 'START_REVIEW',
  IMPORT_CONTENT = 'IMPORT_CONTENT',
  CREATE_NOTE = 'CREATE_NOTE',
}

registerEnumType(ActionType, { name: 'ActionType' });

@ObjectType()
export class AIAction {
  @Field(() => ActionType)
  type: ActionType;

  @Field()
  payload: string;
}

@ObjectType()
export class SynapseResponse {
  @Field()
  message: string;

  @Field(() => [String])
  suggestions: string[];

  @Field(() => [Concept])
  concepts: Concept[];

  @Field(() => [AIAction])
  actions: AIAction[];
}

@InputType()
export class AskSynapseInput {
  @Field()
  message: string;
}

@InputType()
export class ExplainConceptInput {
  @Field(() => ID)
  conceptId: string;

  @Field({ nullable: true })
  context?: string;
}

@InputType()
export class GeneratePracticeInput {
  @Field(() => ID)
  conceptId: string;
}

@ObjectType()
export class PracticeTask {
  @Field(() => Concept)
  concept: Concept;

  @Field()
  taskType: string;

  @Field()
  question: string;

  @Field()
  answer: string;
}
