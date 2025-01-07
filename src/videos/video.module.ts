import { Module } from '@nestjs/common';

import { VideoService } from './services';

@Module({
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
