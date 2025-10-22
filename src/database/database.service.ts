// - Added fallback default values for host, port, and credentials for local testing.
// - Implemented getPool() to safely access the connection pool in other modules.
// - Added console logs for better visibility when starting or shutting down the app.

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool?: mysql.Pool;

  async onModuleInit() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || 'mysql-f6102af-gbox-24d0.g.aivencloud.com',
      port: +(process.env.DB_PORT || 12766),
      user: process.env.DB_USER || 'avnadmin',
      password: process.env.DB_PASSWORD || 'AVNS_J33gCQ5REFGOau3nE4d',
      database: process.env.DB_NAME || 'MORADA',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    const conn = await this.pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ MySQL pool created');
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      console.log('🧹 MySQL pool closed');
    }
  }

  getPool(): mysql.Pool {
    if (!this.pool) {
      throw new Error('Database pool not initialized yet');
    }
    return this.pool;
  }

  // ✅ Properly typed query method
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const pool = this.getPool();
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  }
}
