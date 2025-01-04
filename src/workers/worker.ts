import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { parentPort, threadId } from 'worker_threads';

import { WorkerModule } from './worker.module';

const logger = new Logger('Bootstrap');

async function bootstrapMediaWorker(): Promise<void> {
  const app = await NestFactory.createApplicationContext(WorkerModule);
  parentPort?.on('message', message => {
    logger.log(`Received message from parent: ${message}`);
  });
}

bootstrapMediaWorker()
  .then(() => {
    logger.log(`Started worker with thread ID ${threadId}`);
  })
  .catch(error => {
    logger.error('Failed to start worker', error);
  });
