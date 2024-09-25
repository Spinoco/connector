import { buildConfig } from './config';
import { syncTasks } from './sync';

buildConfig().then((config) => {
  // Start the task synchronization
  return syncTasks(config).catch((error) => {
    console.error("Error in task sync ", error);
  });
}).catch((error) => {
  console.error("Failed to build config", error);
});

