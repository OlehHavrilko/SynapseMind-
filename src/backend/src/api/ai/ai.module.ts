import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiResolver } from './ai.resolver';
import { GraphModule } from '../graph/graph.module';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [GraphModule, DocumentsModule],
  providers: [AiService, AiResolver],
  exports: [AiService],
})
export class AiModule {}
