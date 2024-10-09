import { buildConfig } from './config';
import { syncTasks } from './sync';
import {Logger} from "./logging";

buildConfig().then((config) => {
  Logger.info("Starting", config);
  // Start the task synchronization
  return syncTasks(config).catch((error) => {
    Logger.error("Error in task sync ", error);
  });
}).catch((error) => {
  Logger.error("Failed to build config", error);
});

