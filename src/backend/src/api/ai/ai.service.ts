import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GraphService } from '../graph/graph.service';
import { DocumentsService } from '../documents/documents.service';
import { SynapseResponse, AskSynapseInput, ExplainConceptInput, GeneratePracticeInput } from './dto/ai.input';

@Injectable()
export class AiService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => GraphService))
    private readonly graphService: GraphService,
    @Inject(forwardRef(() => DocumentsService))
    private readonly documentsService: DocumentsService,
  ) {}

  async askSynapse(userId: string, input: AskSynapseInput): Promise<SynapseResponse> {
    const relevantConcepts = await this.graphService.getConcepts(userId, input.message, 5);
    
    const response = await this.generateAIResponse(input.message, relevantConcepts.map(c => c.name));
    
    return {
      message: response.message,
      suggestions: response.suggestions,
      concepts: relevantConcepts,
      actions: response.actions,
    };
  }

  async explainConcept(userId: string, input: ExplainConceptInput): Promise<SynapseResponse> {
    const concepts = await this.graphService.getConcepts(userId);
    const concept = concepts.find(c => c.id === input.conceptId);
    
    if (!concept) {
      return {
        message: 'Concept not found',
        suggestions: [],
        concepts: [],
        actions: [],
      };
    }

    const explanation = await this.generateConceptExplanation(concept.name, concept.definition, input.context);
    
    return {
      message: explanation.message,
      suggestions: explanation.suggestions,
      concepts: [concept],
      actions: [
        { type: 'START_REVIEW', payload: { conceptId: concept.id } },
      ],
    };
  }

  async generatePracticeTask(userId: string, input: GeneratePracticeInput): Promise<any> {
    const concepts = await this.graphService.getConcepts(userId);
    const concept = concepts.find(c => c.id === input.conceptId);
    
    if (!concept) {
      throw new Error('Concept not found');
    }

    const tasks = [
      { type: 'quiz', question: `What is ${concept.name}?`, answer: concept.definition },
      { type: 'fill-blank', question: `${concept.name} is ___`, answer: concept.definition?.split(' ')[0] || 'important' },
      { type: 'application', question: `How would you apply ${concept.name} in a real scenario?`, answer: '' },
    ];

    return {
      concept,
      task: tasks[Math.floor(Math.random() * tasks.length)],
    };
  }

  private async generateAIResponse(message: string, contextConcepts: string[]): Promise<any> {
    const responses: Record<string, any> = {
      'default': {
        message: `Based on your knowledge graph, I can see you're interested in ${contextConcepts.slice(0, 3).join(', ')}. What would you like to explore?`,
        suggestions: [
          'Explain a concept',
          'Start a review session',
          'Import new content',
        ],
        actions: [],
      },
    };

    const lowerMessage = message.toLowerCase();
    let key = 'default';
    
    if (lowerMessage.includes('explain') || lowerMessage.includes('what is')) {
      key = 'explain';
    } else if (lowerMessage.includes('review') || lowerMessage.includes('practice')) {
      key = 'review';
    }

    return responses[key] || responses['default'];
  }

  private async generateConceptExplanation(conceptName: string, definition?: string, context?: string): Promise<any> {
    return {
      message: definition 
        ? `${conceptName}: ${definition}`
        : `${conceptName} is an important concept in your knowledge graph.`,
      suggestions: [
        'Learn more about related concepts',
        'Practice with flashcards',
        'Find applications',
      ],
    };
  }

  async synthesizeKnowledge(userId: string, documentIds: string[]): Promise<any> {
    const documents = await Promise.all(
      documentIds.map(id => this.documentsService.findById(id, userId))
    );

    return {
      insights: [
        'Key themes identified across documents',
        'Potential connections between concepts',
      ],
      synthesis: 'AI-generated synthesis will appear here',
    };
  }
}
