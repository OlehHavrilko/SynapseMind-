import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../../infrastructure/database/neo4j/neo4j.service';
import { KnowledgeGraph, Concept, ConceptConnection, GraphStats } from './dto/graph.types';

@Injectable()
export class GraphService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getKnowledgeGraph(userId: string): Promise<KnowledgeGraph> {
    const nodes = await this.getConcepts(userId);
    const edges = await this.getConnections(userId);
    const stats = await this.getStats(userId);

    return { nodes, edges, stats };
  }

  async getConcepts(userId: string, search?: string, limit = 50): Promise<Concept[]> {
    const query = search
      ? `
        MATCH (c:Concept)<-[:LEARNED_FROM]-(u:User {id: $userId})
        WHERE c.name CONTAINS $search
        RETURN c
        ORDER BY c.importance DESC
        LIMIT $limit
      `
      : `
        MATCH (c:Concept)<-[:LEARNED_FROM]-(u:User {id: $userId})
        RETURN c
        ORDER BY c.importance DESC
        LIMIT $limit
      `;

    const result = await this.neo4jService.runQuery(query, { userId, search, limit });
    
    return result.records.map(record => ({
      id: record.get('c').properties.id,
      name: record.get('c').properties.name,
      definition: record.get('c').properties.definition,
      importance: record.get('c').properties.importance,
      notes: record.get('c').properties.notes,
    }));
  }

  async getConnections(userId: string): Promise<ConceptConnection[]> {
    const query = `
      MATCH (c1:Concept)<-[:LEARNED_FROM]-(u:User {id: $userId})
      MATCH (c1)-[r:RELATES_TO]-(c2:Concept)<-[:LEARNED_FROM]-(u)
      RETURN c1, r, c2
    `;

    const result = await this.neo4jService.runQuery(query, { userId });
    
    return result.records.map(record => ({
      id: record.get('r').identity,
      source: record.get('c1').properties.id,
      target: record.get('c2').properties.id,
      relationship: record.get('r').type,
      strength: record.get('r').properties.strength || 1,
    }));
  }

  async getStats(userId: string): Promise<GraphStats> {
    const nodesQuery = `
      MATCH (c:Concept)<-[:LEARNED_FROM]-(u:User {id: $userId})
      RETURN count(c) as totalNodes
    `;
    
    const edgesQuery = `
      MATCH (c1:Concept)<-[:LEARNED_FROM]-(u:User {id: $userId})
      MATCH (c1)-[r:RELATES_TO]-(c2:Concept)<-[:LEARNED_FROM]-(u)
      RETURN count(r) as totalEdges
    `;

    const [nodesResult, edgesResult] = await Promise.all([
      this.neo4jService.runQuery(nodesQuery, { userId }),
      this.neo4jService.runQuery(edgesQuery, { userId }),
    ]);

    const totalNodes = nodesResult.records[0]?.get('totalNodes')?.low || 0;
    const totalEdges = edgesResult.records[0]?.get('totalEdges')?.low || 0;
    const density = totalNodes > 1 ? totalEdges / (totalNodes * (totalNodes - 1)) : 0;

    return {
      totalNodes,
      totalEdges,
      density,
      topConcepts: [],
      gaps: [],
    };
  }

  async createConcept(userId: string, name: string, definition?: string): Promise<Concept> {
    const id = crypto.randomUUID();
    
    const query = `
      MATCH (u:User {id: $userId})
      MERGE (c:Concept {id: $id})
      SET c.name = $name,
          c.definition = $definition,
          c.importance = 1.0,
          c.createdAt = datetime()
      MERGE (u)-[:LEARNED_FROM {date: datetime()}]->(c)
      RETURN c
    `;

    const result = await this.neo4jService.runQuery(query, { userId, id, name, definition });
    const concept = result.records[0].get('c');

    return {
      id: concept.properties.id,
      name: concept.properties.name,
      definition: concept.properties.definition,
      importance: concept.properties.importance,
    };
  }

  async addConnection(userId: string, fromId: string, toId: string, relationship: string): Promise<ConceptConnection> {
    const query = `
      MATCH (c1:Concept {id: $fromId})<-[:LEARNED_FROM]-(u:User {id: $userId})
      MATCH (c2:Concept {id: $toId})<-[:LEARNED_FROM]-(u)
      MERGE (c1)-[r:RELATES_TO {type: $relationship, strength: 1.0}]->(c2)
      RETURN c1, r, c2
    `;

    const result = await this.neo4jService.runQuery(query, { userId, fromId, toId, relationship });
    
    return {
      id: result.records[0].get('r').identity,
      source: fromId,
      target: toId,
      relationship,
      strength: 1.0,
    };
  }

  async deleteConcept(userId: string, conceptId: string): Promise<boolean> {
    const query = `
      MATCH (c:Concept {id: $conceptId})<-[:LEARNED_FROM]-(u:User {id: $userId})
      DETACH DELETE c
    `;

    await this.neo4jService.runQuery(query, { userId, conceptId });
    return true;
  }

  async findPath(userId: string, fromId: string, toId: string): Promise<Concept[]> {
    const query = `
      MATCH path = shortestPath(
        (c1:Concept {id: $fromId})<-[:LEARNED_FROM]-(u:User {id: $userId})-[*..5]-(c2:Concept {id: $toId})<-[:LEARNED_FROM]-(u)
      )
      RETURN nodes(path) as concepts
    `;

    const result = await this.neo4jService.runQuery(query, { userId, fromId, toId });
    
    if (!result.records[0]) return [];
    
    return result.records[0].get('concepts').map((c: any) => ({
      id: c.properties.id,
      name: c.properties.name,
      definition: c.properties.definition,
      importance: c.properties.importance,
    }));
  }

  async extractConceptsFromText(text: string): Promise<string[]> {
    const words = text.toLowerCase().split(/\s+/);
    const concepts = [...new Set(words.filter(w => w.length > 4))].slice(0, 20);
    return concepts;
  }

  async createConceptsForDocument(documentId: string, conceptNames: string[], userId: string): Promise<void> {
    for (const name of conceptNames) {
      await this.createConcept(userId, name);
    }
  }

  async detectRelationships(userId: string): Promise<void> {
    const query = `
      MATCH (c1:Concept)<-[:LEARNED_FROM]-(u:User {id: $userId})
      MATCH (c2:Concept)<-[:LEARNED_FROM]-(u)
      WHERE c1 <> c2
      WITH c1, c2, 
           apoc.text.sorensenDiceSimilarity(c1.name, c2.name) as similarity
      WHERE similarity > 0.6
      MERGE (c1)-[r:RELATES_TO {type: 'SIMILAR', strength: similarity}]->(c2)
    `;

    await this.neo4jService.runQuery(query, { userId });
  }
}
