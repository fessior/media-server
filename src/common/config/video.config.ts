import { ConfigType, registerAs } from '@nestjs/config';
import { z } from 'zod';

type VideoConfig = {
  /**
   * Maximum jobs in the video processing queue that we can do concurrently
   */
  videoProcessingConcurrency: number;
};

export const videoConfig = registerAs('video', () => {
  const config: VideoConfig = {
    videoProcessingConcurrency:
      Number(process.env.VIDEO_PROCESSING_CONCURRENCY) || 50,
  };

  const schema = z.object({
    videoProcessingConcurrency: z.number().min(1),
  });

  schema.parse(config);
  return config;
});

export type VideoConfigType = ConfigType<typeof videoConfig>;
