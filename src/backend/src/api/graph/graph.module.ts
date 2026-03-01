import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { GraphService } from './graph.service';
import { GraphResolver } from './graph.resolver';
import { Neo4jModule } from '../../infrastructure/database/neo4j/neo4j.module';

@Module({
  imports: [Neo4jModule],
  providers: [GraphService, GraphResolver],
  exports: [GraphService],
})
export class GraphModule {}
