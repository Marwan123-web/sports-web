import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private dataSource: DataSource;

  constructor() {    
    this.dataSource = new DataSource({
      type: 'postgres',
      host: process.env.HOST,
      port: Number(process.env.PORT) || 5432,
      username: process.env.USER_NAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      entities: [__dirname + '/../../modules/**/entities/*.entity{.ts,.js}'], // Adjust path as needed
      synchronize: process.env.NODE_ENV == 'development' ? true : false, // Use only during development
    });
  }

  async query(queryText: string, params?: any[]) {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
    }
    return this.dataSource.query(queryText, params);
  }

  async onModuleInit() {
    if (!this.dataSource.isInitialized) {
      await this.dataSource.initialize();
      console.log('Database connection initialized');
    }
  }

  async onModuleDestroy() {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
      console.log('Database connection closed');
    }
  }
}
