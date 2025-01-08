import { readFileSync, unlinkSync } from 'fs';
import { basename } from 'path';
import { Writable, WritableOptions } from 'stream';

import { VideoSegmentFile } from '../types';

/**
 * Handles upload of video segments to storage provider
 */
export class VideoSegmentUploadStream extends Writable {
  constructor(
    private folderName: string,
    private upload: (fileName: string, buffer: Buffer) => Promise<void>,
    writableOptions: WritableOptions,
  ) {
    super({ ...writableOptions, objectMode: true });
  }

  override async _write(
    chunk: VideoSegmentFile,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): Promise<void> {
    try {
      const { fileName } = chunk;
      const file = readFileSync(fileName);
      const uploadName = `${this.folderName}/${basename(fileName)}`;
      await this.upload(uploadName, file);

      /* Remove the file to save space */
      unlinkSync(fileName);
      callback();
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      callback(error);
    }
  }
}
