import * as fs from 'node:fs/promises';

/**
  * Create a directory for a file if it does not exist
  * @param file - file path
  * @returns a promise that resolves when the directory is created
  */
export function mkdirForFile(file: string): Promise<void> {
  const dir = file.substring(0, file.lastIndexOf('/'));

  return fs.access(dir).catch(() => {
    fs.mkdir(dir, { recursive: true });
  })
}
