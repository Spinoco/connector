import {FileStorage} from "@flystorage/file-storage";
import {assertEnv} from "../config";
import {AzureStorageBlobStorageAdapter} from '@flystorage/azure-storage-blob';
import {BlobServiceClient} from "@azure/storage-blob";

/**
 * Builds storage client for the Azure blob storage
 */
export function buildAzureStorage(): Promise<FileStorage> {
  return assertEnv("SP_TASK_SYNC_AZURE_DSN").then((azureDSN) => {
    return assertEnv("SP_TASK_SYNC_AZURE_CLIENT_NAME").then((clientName) => {
      const blobService = BlobServiceClient.fromConnectionString(azureDSN);
      const container = blobService.getContainerClient(clientName);
      const options = {
        prefix: process.env.SP_TASK_SYNC_SAVE_TO
      }
      const adapter = new AzureStorageBlobStorageAdapter(container, options);

      return Promise.resolve(new FileStorage(adapter));
    });
  });
}
