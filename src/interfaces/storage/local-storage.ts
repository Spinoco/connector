import {FileStorage} from "@flystorage/file-storage";
import {LocalStorageAdapter} from '@flystorage/local-fs';
import {assertEnv} from "../config";
import {resolve} from "node:url";

/**
 * Builds local storage file storage.
 *
 */
export function buildLocalStorage(): Promise<FileStorage> {
  return assertEnv("SP_TASK_SYNC_SAVE_TO").then((saveTo) => {
    const rootDirectory = resolve(process.cwd(), saveTo); //todo: correct?
    const adapter = new LocalStorageAdapter(rootDirectory);
    return new FileStorage(adapter);
  })
}
