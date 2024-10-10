import {FileStorage} from "@flystorage/file-storage";
import {LocalStorageAdapter} from '@flystorage/local-fs';
import {assertEnv} from "../config";
import {resolve} from "node:url";
import { Logger } from "../logging";

/**
 * Builds local storage file storage.
 *
 */
export function buildLocalStorage(): Promise<FileStorage> {
  return assertEnv("SP_TASK_SYNC_SAVE_TO").then((saveTo) => {
    const rootDirectory = resolve(`${process.cwd()}/`, saveTo);
    Logger.info(`Using local storage at ${rootDirectory}`);
    const adapter = new LocalStorageAdapter(rootDirectory);
    return new FileStorage(adapter);
  })
}
