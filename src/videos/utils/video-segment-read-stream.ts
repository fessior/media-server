import chokidar, { FSWatcher } from 'chokidar';
import { FfmpegCommand } from 'fluent-ffmpeg';
import { Readable, ReadableOptions } from 'stream';

import { VideoSegmentFile } from '../types';

/**
 * Represents a stream of data from an FFmpeg process. Upon buffer full or
 * backpressure from consumer, the underlying FFmpeg process will pause until
 * drained.
 *
 * Each item emitted by this stream corresponds to a *file segment* produced by
 * FFmpeg. This is due to the fact that streaming protocols like HLS and DASH
 * require the video to be split into smaller segments. For other formats,
 * using regular streams is preferred.
 */
export class VideoSegmentReadStream extends Readable {
  /**
   * When a new file is added to workdir, it takes time for FFmpeg to write its
   * content. However, the last file pushed should already by ready for upload,
   * so we keep track of it here.
   */
  private lastFile?: VideoSegmentFile;

  private watcher: FSWatcher;

  constructor(
    private readonly ffmpegProcess: FfmpegCommand,
    private readonly workDir: string,
    readableOptions: ReadableOptions,
  ) {
    super({ ...readableOptions, objectMode: true });

    /* Watch workdir for any file created */
    this.watcher = chokidar.watch(this.workDir).on('add', filePath => {
      /* Try to push last file into buffer */
      if (this.lastFile) {
        if (!this.push(this.lastFile)) {
          this.ffmpegProcess.kill('SIGSTOP');
        }
      }
      this.lastFile = {
        fileName: filePath,
      };
    });

    ffmpegProcess.on('end', () => {
      if (this.lastFile) {
        this.push(this.lastFile);
      }
      this.push(null);
    });
  }

  override _read(): void {
    this.ffmpegProcess.kill('SIGCONT');
  }

  override _destroy(
    error: Error | null,
    callback: (error?: Error | null) => void,
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (this.ffmpegProcess) {
      this.ffmpegProcess.kill('SIGKILL');
    }
    this.watcher
      .close()
      .then(() => {
        callback(error);
      })
      .catch(callback);
  }
}
