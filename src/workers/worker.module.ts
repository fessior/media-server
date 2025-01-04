import { Module } from '@nestjs/common';

/**
 * Module for worker threads, which are used for background processing of media.
 * It's convenient to let them have their own IoC container (e.g to read configs).
 * However, tasks like handling HTTP requests, updating databases, etc. should
 * be done in the main server.
 */
@Module({})
export class WorkerModule {}
