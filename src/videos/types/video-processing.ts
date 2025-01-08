import { z } from 'zod';

export type VideoProcessingJob = {
  originalVideo: {
    storage: 'minio';
    bucket: string;
    key: string;
  };
  outputVideo: {
    storage: 'minio';
    bucket: string;
    prefix: string;
  };
  /**
   * We'll add options later
   */
  // options: {};
};

export const videoProcessingJobSchema = z.object({
  originalVideo: z.object({
    storage: z.literal('minio'),
    bucket: z.string(),
    key: z.string(),
  }),
  outputVideo: z.object({
    storage: z.literal('minio'),
    bucket: z.string(),
    prefix: z.string(),
  }),
});
