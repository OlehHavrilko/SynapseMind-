import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentSource, DocumentType } from './entities/document.entity';
import { CreateDocumentInput, UpdateDocumentInput, DocumentFilter } from './dto/documents.input';
import { GraphService } from '../graph/graph.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @Inject(forwardRef(() => GraphService))
    private readonly graphService: GraphService,
  ) {}

  async create(userId: string, input: CreateDocumentInput): Promise<Document> {
    const document = this.documentRepository.create({
      ...input,
      userId,
    });
    return this.documentRepository.save(document);
  }

  async findAll(userId: string, filter?: DocumentFilter, limit = 20, offset = 0): Promise<Document[]> {
    const query = this.documentRepository.createQueryBuilder('document')
      .where('document.userId = :userId', { userId })
      .orderBy('document.createdAt', 'DESC')
      .skip(offset)
      .take(limit);

    if (filter?.source) {
      query.andWhere('document.source = :source', { source: filter.source });
    }
    if (filter?.type) {
      query.andWhere('document.type = :type', { type: filter.type });
    }
    if (filter?.isProcessed !== undefined) {
      query.andWhere('document.isProcessed = :isProcessed', { isProcessed: filter.isProcessed });
    }
    if (filter?.search) {
      query.andWhere('(document.title ILIKE :search OR document.content ILIKE :search)', 
        { search: `%${filter.search}%` });
    }

    return query.getMany();
  }

  async findById(id: string, userId: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id, userId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  async findByUrl(url: string, userId: string): Promise<Document | null> {
    return this.documentRepository.findOne({
      where: { sourceUrl: url, userId },
    });
  }

  async update(id: string, userId: string, input: UpdateDocumentInput): Promise<Document> {
    const document = await this.findById(id, userId);
    Object.assign(document, input);
    return this.documentRepository.save(document);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await this.documentRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new NotFoundException('Document not found');
    }
    return true;
  }

  async processDocument(id: string, userId: string): Promise<Document> {
    const document = await this.findById(id, userId);
    
    const concepts = await this.graphService.extractConceptsFromText(document.content || '');
    
    await this.graphService.createConceptsForDocument(document.id, concepts, userId);
    
    document.isProcessed = true;
    document.wordCount = document.content?.split(/\s+/).length || 0;
    document.readingTime = Math.ceil((document.wordCount || 0) / 200);
    
    return this.documentRepository.save(document);
  }
}
