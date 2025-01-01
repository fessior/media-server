import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap()
  .then(() => console.log('Application is running on: http://localhost:3000'))
  .catch(error => console.error(error));
