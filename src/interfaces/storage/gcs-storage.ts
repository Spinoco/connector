import {FileStorage} from "@flystorage/file-storage";
import {assertEnv} from "../config";
import {GoogleCloudStorageAdapter} from '@flystorage/google-cloud-storage';
import {Storage} from '@google-cloud/storage';


export function buildGCSStorage() : Promise<FileStorage> {
 return assertEnv("SP_TASK_SYNC_GCS_BUCKET").then((bucketName) => {
  return assertEnv("SP_TASK_SYNC_GCS_PROJECT").then((projectName) => {
   const client = new Storage();
   const bucketOptions = {
    userProject: projectName
   }
   const bucket = client.bucket(bucketName, bucketOptions);
   const adapterOptions = {
    prefix: process.env.SP_TASK_SYNC_SAVE_TO
   }
   const adapter = new GoogleCloudStorageAdapter(bucket, adapterOptions);
   return Promise.resolve(new FileStorage(adapter));
  });
 });
}