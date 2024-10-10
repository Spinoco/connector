import {FileStorage} from "@flystorage/file-storage";
import {assertEnv} from "../config";
import {AwsS3StorageAdapter} from '@flystorage/aws-s3';
import {S3Client} from '@aws-sdk/client-s3';

/**
 * Builds a storage backed by AWS S3 bucket
 */
export function buildAWSS3Storage(): Promise<FileStorage> {
  return assertEnv("SP_TASK_SYNC_S3_REGION").then((awsRegion) =>
    assertEnv("SP_TASK_SYNC_S3_BUCKET").then((bucketName) => {
      const client = new S3Client({
        region: awsRegion
      });

      const options = {
        bucket: bucketName,
        prefix: process.env.SP_TASK_SYNC_SAVE_TO,
        region: awsRegion
      }
      const adapter = new AwsS3StorageAdapter(client, options);

      return new FileStorage(adapter);
    })
  );
}
