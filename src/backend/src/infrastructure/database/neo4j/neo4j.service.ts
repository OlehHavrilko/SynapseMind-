import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import neo4j, { Driver, Session, QueryResult } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private driver: Driver;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const uri = this.configService.get('neo4j.uri');
    const username = this.configService.get('neo4j.username');
    const password = this.configService.get('neo4j.password');

    this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
    
    await this.verifyConnection();
  }

  async onModuleDestroy() {
    await this.driver.close();
  }

  private async verifyConnection() {
    try {
      await this.driver.verifyConnectivity();
      console.log('✅ Connected to Neo4j');
    } catch (error) {
      console.error('❌ Neo4j connection error:', error);
    }
  }

  getSession(): Session {
    return this.driver.session();
  }

  async runQuery<T extends Record<string, any>>(query: string, parameters?: Record<string, any>): Promise<QueryResult<T>> {
    const session = this.driver.session();
    try {
      const result = await session.run(query, parameters);
      return result;
    } finally {
      await session.close();
    }
  }

  async executeWrite(query: string, parameters?: Record<string, any>): Promise<QueryResult> {
    const session = this.driver.session();
    try {
      const result = await session.writeTransaction(tx => tx.run(query, parameters));
      return result;
    } finally {
      await session.close();
    }
  }
}
