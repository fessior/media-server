import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

export async function bootstrapMainServer(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);

  return app;
}
