import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PositionsModule } from './positions/positions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'mysql-f6102af-gbox-24d0.g.aivencloud.com',
      port: parseInt(process.env.DB_PORT ?? '12766', 10),
      username: process.env.DB_USER ?? 'avnadmin',
      password: process.env.DB_PASSWORD ?? 'AVNS_J33gCQ5REFGOau3nE4d',
      database: process.env.DB_NAME ?? 'MORADA',
      autoLoadEntities: true,
      synchronize: true,
      retryAttempts: 3,
      retryDelay: 3000,
      // ssl: { rejectUnauthorized: false },
    }),
    UsersModule,
    AuthModule,
    PositionsModule,
  ],
})
export class AppModule {}
