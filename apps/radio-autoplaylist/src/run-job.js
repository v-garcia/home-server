import camelCase from 'camelcase';
import { BroadcastChannel } from "broadcast-channel";
import { TRIGGER_JOB_CHANNEL } from './common.js';

let [, , jobName] = process.argv;

jobName = jobName.split('/').pop();
jobName = jobName.replace(/.js$/, '');
jobName = camelCase(jobName);

console.info(`Trying to execute job: "${jobName}"`);
await new BroadcastChannel(TRIGGER_JOB_CHANNEL).postMessage(JSON.stringify({ jobName }));
process.exit(0);