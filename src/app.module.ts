import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { commonConfig } from './common/config';
import { WorkerManager } from './worker-manager';

/**
 * Module for main server
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [commonConfig],
    }),
  ],
  providers: [WorkerManager],
})
export class AppModule {}
