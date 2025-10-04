import { Inject, Injectable, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ffprobe, FfprobeData } from 'fluent-ffmpeg';
import * as ffmpeg from 'fluent-ffmpeg';
import { readdir, readFile } from 'fs/promises';
import { resolve as resolvePath } from 'path';

import { HLS_RESOLUTIONS } from '../constants';
import { VideoProcessingJob } from '../types';
import { videoConfig, VideoConfigType } from '@/common/config';
import { MinioService } from '@/storage/services';

@Injectable()
export class VideoProcessingService {
  private readonly logger: Logger = new Logger(VideoProcessingService.name);

  constructor(
    private minioService: MinioService,
    @Inject(videoConfig.KEY) private appVideoConfig: VideoConfigType,
  ) {}

  public async embedAndUploadWatermarkedVideo(
    job: Job<VideoProcessingJob>,
    workspace: string,
  ): Promise<void> {
    const { originalVideo, outputVideo } = job.data;
    const objectExists = await this.minioService.objectExists(
      originalVideo.bucket,
      originalVideo.key,
    );
    if (!objectExists) {
      throw new Error(
        `Original video ${originalVideo.bucket}/${originalVideo.key} does not exist`,
      );
    }

    /**
     * Check if output bucket exists
     */
    const outputBucketExists = await this.minioService.bucketExists(
      outputVideo.bucket,
    );
    if (!outputBucketExists) {
      throw new Error(`Output bucket ${outputVideo.bucket} does not exist`);
    }

    /**
     * Extract video metadata
     */
    const metadata = await this.getVideoMetadata(
      originalVideo.bucket,
      originalVideo.key,
    );

    /**
     * Get download video URL
     */
    const videoUrl = await this.minioService.getPresignedDownloadUrl(
      originalVideo.bucket,
      originalVideo.key,
    );

    const ffmpegProc = this.buildFfmpegEmbedVideoStream(
      videoUrl,
      metadata,
      workspace,
      originalVideo.key,
    );

    this.logger.debug(
      // eslint-disable-next-line no-underscore-dangle
      `Running ffmpeg with command: ${ffmpegProc._getArguments().join(' ')}`,
    );

    /**
     * Return a promise that resolves when ffmpeg processing is done
     */
    return new Promise((resolve, reject) => {
      /* Chain error handling in case ffmpeg exits */
      ffmpegProc.on('error', (error: Error, stdout: string, stderr: string) => {
        this.logger.debug('ffmpeg failed. Process log is show below');
        this.logger.error(stderr);
        reject(error);
      });

      ffmpegProc.on('end', async () => {
        try {
          const files = await readdir(workspace);

          /* Upload all segments to storage */
          for (const file of files) {
            const buffer = await readFile(resolvePath(workspace, file));
            this.logger.log(
              `Uploading ${file} to ${outputVideo.bucket}/${outputVideo.prefix}`,
            );

            await this.minioService.uploadObject(
              outputVideo.bucket,
              `${outputVideo.prefix}/${file}`,
              buffer,
            );
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  async encodeAndUploadHlsStream(
    job: Job<VideoProcessingJob>,
    workspace: string,
  ): Promise<void> {
    /**
     * We only support HLS and MinIO for now
     */
    const { originalVideo, outputVideo } = job.data;
    const objectExists = await this.minioService.objectExists(
      originalVideo.bucket,
      originalVideo.key,
    );
    if (!objectExists) {
      throw new Error(
        `Original video ${originalVideo.bucket}/${originalVideo.key} does not exist`,
      );
    }

    /**
     * Check if output bucket exists
     */
    const outputBucketExists = await this.minioService.bucketExists(
      outputVideo.bucket,
    );
    if (!outputBucketExists) {
      throw new Error(`Output bucket ${outputVideo.bucket} does not exist`);
    }

    const metadata = await this.getVideoMetadata(
      originalVideo.bucket,
      originalVideo.key,
    );
    const videoUrl = await this.minioService.getPresignedDownloadUrl(
      originalVideo.bucket,
      originalVideo.key,
    );
    const ffmpegProc = this.buildFfmpegStream(videoUrl, metadata, workspace);

    this.logger.debug(
      // eslint-disable-next-line no-underscore-dangle
      `Running ffmpeg with command: ${ffmpegProc._getArguments().join(' ')}`,
    );

    /**
     * Encapsulate original video stream and ffmpeg into one controlled stream
     */
    return new Promise((resolve, reject) => {
      /* Chain error handling in case ffmpeg exits */
      ffmpegProc.on('error', (error: Error, stdout: string, stderr: string) => {
        this.logger.debug('ffmpeg failed. Process log is show below');
        this.logger.error(stderr);
        reject(error);
      });

      ffmpegProc.on('end', async () => {
        try {
          const files = await readdir(workspace);

          /* Upload all segments to storage */
          for (const file of files) {
            const buffer = await readFile(resolvePath(workspace, file));
            this.logger.log(
              `Uploading ${file} to ${outputVideo.bucket}/${outputVideo.prefix}`,
            );

            await this.minioService.uploadObject(
              outputVideo.bucket,
              `${outputVideo.prefix}/${file}`,
              buffer,
            );
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  private async getVideoMetadata(
    bucket: string,
    key: string,
  ): Promise<FfprobeData> {
    const readStream = await this.minioService.getObjectReadStream(bucket, key);
    return new Promise((resolve, reject) => {
      /**
       * ffprobe's source code does seem to support streams, but typing does not
       * show it.
       *
       * Ref: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/365
       */
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      ffprobe(<any>readStream, (err, metadata) => {
        if (err) {
          reject(err);
        } else {
          resolve(metadata);
        }
      });
    });
  }

  private buildFfmpegEmbedVideoStream(
    videoUrl: string,
    metadata: FfprobeData,
    workspace: string,
    outputKey: string,
  ): ffmpeg.FfmpegCommand {
    const { width, height } = metadata.streams[0];
    const ffmpegStream = ffmpeg(videoUrl);

    const watermarkStyle = (): string => {
      // Default option for a tiktok video is vertical
      if (!width || !height) {
        return 'vertical';
      }
      if (width > height) {
        return 'horizontal';
      }
      if (height > width) {
        return 'vertical';
      }
      return 'square';
    };

    /* Video and audio encoding */
    ffmpegStream.addOptions([
      '-c:v libx264',
      '-crf 26',
      '-c:a aac',
      '-ar 48000',
      '-preset veryfast',
      '-movflags +faststart',
    ]);

    /* Generate thumbnail */
    ffmpegStream.addOptions([
      '-ss 1',
      `-vf scale=${width}:${height}`,
      '-frames:v 1',
      '-f image2',
    ]);

    /* Save thumbnail */
    ffmpegStream.save(`${workspace}/${outputKey}_thumbnail.png`);

    /* Generate watermarked video */
    const watermarkPath = resolvePath(
      'public/watermark',
      `${watermarkStyle()}.png`,
    );
    ffmpegStream.addOptions([
      `-i ${watermarkPath}`,
      '-loop 1',
      `-filter_complex`,
      `[0:v][1:v] overlay=W-w-10:H-h-10`,
      `-map 0:a?`,
      `-map 0:v`,
      `-s ${width}x${height}`,
      '-b:v 1500k',
      '-b:a 128k',
      '-f mp4',
    ]);

    /* Save watermarked video */
    return ffmpegStream.save(`${workspace}/${outputKey}.mp4`);
  }

  private buildFfmpegStream(
    videoUrl: string,
    metadata: FfprobeData,
    workspace: string,
  ): ffmpeg.FfmpegCommand {
    const { height } = metadata.streams[0];

    const variants = HLS_RESOLUTIONS.filter(
      ({ height: variantHeight }) => variantHeight <= height!,
    );

    const ffmpegStream = ffmpeg(videoUrl);

    /* Map video and audio streams */
    variants.forEach(() =>
      ffmpegStream.addOptions(['-map 0:v:0', '-map 0:a:0']),
    );

    /* Video and audio encoding */
    ffmpegStream.addOptions([
      '-c:v libx264',
      '-crf 26',
      '-c:a aac',
      '-ar 48000',
    ]);

    /* Filter for each variant */
    variants.forEach(
      ({ height: variantHeight, audioBitrate, maxRate, bufSize }, index) => {
        ffmpegStream.addOptions([
          `-filter:v:${index} scale=w=ceil(oh*a/2)*2:h=${variantHeight}`,
          `-maxrate:v:${index} ${maxRate}`,
          `-bufsize:v:${index} ${bufSize}`,
          `-b:a:${index} ${audioBitrate}`,
        ]);
      },
    );

    /* Give name to each variant */
    const varStreamMap = variants
      .map(
        ({ height: variantHeight }, index) =>
          `v:${index},a:${index},name:${variantHeight}p`,
      )
      .join(' ');
    ffmpegStream.addOption('-var_stream_map', varStreamMap);

    /* HLS options */
    ffmpegStream.addOptions([
      '-preset fast',
      '-hls_list_size 0',
      '-threads 0',
      '-f hls',
      '-g 50',
      '-keyint_min 50',
      '-sc_threshold 40',
      '-hls_playlist_type event',
      '-hls_time 10',
      '-hls_flags independent_segments',
      '-master_pl_name master-playlist.m3u8',
    ]);

    return ffmpegStream.save(`${workspace}/%v.m3u8`);
  }
}
