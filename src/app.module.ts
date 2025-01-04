import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { commonConfig } from './common/config/common.config';

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
})
export class AppModule {}
