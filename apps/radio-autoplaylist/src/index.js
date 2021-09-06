
import path from 'path';
import schedule from 'node-schedule';
import { gotifyNotification } from './gotify.js';
import { BroadcastChannel } from "broadcast-channel";
import { TRIGGER_JOB_CHANNEL } from './common.js';

import saveNeoCurrentSong from './jobs/save-neo-current-song.js';
import saveMeuhCurrentSong from './jobs/save-meuh-current-song.js';
import importSpotifyTrackIds from './jobs/import-spotify-track-ids.js';
import updateNeoMostPlayedPlaylistOnSpotify from './jobs/update-neo-most-played-playlist-on-spotify.js';
import updateMeuhMostPlayedPlaylistOnSpotify from './jobs/update-meuh-most-played-playlist-on-spotify.js';

let jobs = {};

function scheduleJob({ name, rule, fn }) {
  const job = schedule.scheduleJob(name, rule, fn);
  jobs = { ...jobs, [name]: job };

  job.on('run', () => console.log(`Running ${name}`));

  job.on('error', async e => {
    console.error(`Error on ${name}`, e);
    await gotifyNotification(`Error on ${name}: ${e.name}, ${e.message}`);
  });

  return job;
}

scheduleJob({ name: 'saveNeoCurrentSong', rule: '10 * * * * *', fn: saveNeoCurrentSong });
scheduleJob({ name: 'saveMeuhCurrentSong', rule: '20 * * * * *', fn: saveMeuhCurrentSong });
scheduleJob({ name: 'importSpotifyTrackIds', rule: '0 4 * * *', fn: importSpotifyTrackIds });
scheduleJob({ name: 'updateNeoMostPlayedPlaylistOnSpotify', rule: '20 4 * * *', fn: updateNeoMostPlayedPlaylistOnSpotify });
scheduleJob({ name: 'updateMeuhMostPlayedPlaylistOnSpotify', rule: '25 4 * * *', fn: updateMeuhMostPlayedPlaylistOnSpotify });

// Manually trigger job
const manualJobEventChannel = new BroadcastChannel(TRIGGER_JOB_CHANNEL);
manualJobEventChannel.onmessage = async (message) => {
  try {
    message = JSON.parse(message);
    const { jobName } = message;
    console.info(`Received manual job trigger msg for: ${jobName}`);
    const j = jobs[jobName];
    if (!j) throw new Error(`Job ${jobName} not found`);
    await j.job();
  } catch (e) {
    console.error(e);
  }
}


async function closeGracefully(signal) {
  console.log(`Received signal to terminate: ${signal}`)
  for (const jobName of Object.keys(jobs)) {
    console.info(`Cancel job ${jobName}`);
    jobs[jobName].cancel();
  }
  manualJobEventChannel && await manualJobEventChannel.close();
  process.exit();
}

process.on('SIGINT', closeGracefully)
process.on('SIGTERM', closeGracefully)