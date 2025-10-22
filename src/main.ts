import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useLogger(['log', 'error', 'warn', 'debug', 'verbose']);

  // Enable validation for all requests
  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0'); // ✅ only one listen

  console.log(`🚀 Server listening on http://localhost:${port}`);
}

bootstrap();

