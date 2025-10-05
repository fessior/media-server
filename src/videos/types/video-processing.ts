import { z } from 'zod';

export type VideoProcessingJob = {
  messageId: string;
  responseQueue: string;
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
   * We'll add more options here as needed
   */
  options?: {
    watermark: string;
  };
};

export const videoProcessingJobSchema = z.object({
  messageId: z.string().nonempty(),
  responseQueue: z.string().nonempty(),
  originalVideo: z.object({
    storage: z.literal('minio'),
    bucket: z.string().nonempty(),
    key: z.string().nonempty(),
  }),
  outputVideo: z.object({
    storage: z.literal('minio'),
    bucket: z.string().nonempty(),
    prefix: z.string().nonempty(),
  }),
  options: z
    .object({
      watermark: z.enum(['vertical', 'horizontal', 'square']),
    })
    .optional(),
});

export type VideoProcessingResponse = {
  correlationId: string;
  status: 'successful' | 'failed';
  failedReason?: string;
};
