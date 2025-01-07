import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as Minio from 'minio';
import { UploadedObjectInfo } from 'minio/dist/main/internal/type';
import { Readable } from 'node:stream';

@Injectable()
export class MinioService {
  constructor(
    @Inject(Minio.Client) private readonly minioClient: Minio.Client | null,
  ) {}

  public get isClientInitialized(): boolean {
    return !!this.minioClient;
  }

  public async getObjectReadStream(
    bucketName: string,
    objectName: string,
  ): Promise<Readable> {
    if (!this.minioClient) {
      throw new InternalServerErrorException('Minio client not initialized');
    }
    return this.minioClient.getObject(bucketName, objectName);
  }

  public async uploadObject(
    bucketName: string,
    objectName: string,
    file: Buffer,
  ): Promise<UploadedObjectInfo> {
    if (!this.minioClient) {
      throw new InternalServerErrorException('Minio client not initialized');
    }
    return this.minioClient.putObject(bucketName, objectName, file);
  }
}
