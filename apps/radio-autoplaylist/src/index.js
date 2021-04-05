
import path from 'path';
import schedule from 'node-schedule';
import { gotifyNotification } from './gotify.js';

import saveNeoCurrentSong from './jobs/save-neo-current-song.js';
import saveMeuhCurrentSong from './jobs/save-meuh-current-song.js';
import importSpotifyTracksIds from './jobs/import-spotify-track-ids.js';
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
}

scheduleJob({ name: 'saveNeoCurrentSong', rule: '10 * * * * *', fn: saveNeoCurrentSong });
scheduleJob({ name: 'saveMeuhCurrentSong', rule: '20 * * * * *', fn: saveMeuhCurrentSong });
scheduleJob({ name: 'importSpotifyTracksIds', rule: '0 4 * * *', fn: importSpotifyTracksIds });
scheduleJob({ name: 'updateNeoMostPlayedPlaylistOnSpotify', rule: '20 4 * * *', fn: updateNeoMostPlayedPlaylistOnSpotify });
scheduleJob({ name: 'updateMeuhMostPlayedPlaylistOnSpotify', rule: '25 4 * * *', fn: updateMeuhMostPlayedPlaylistOnSpotify });

async function closeGracefully(signal) {
  console.log(`Received signal to terminate: ${signal}`)
  for (const jobName of Object.keys(jobs)) {
    console.info(`Cancel job ${jobName}`);
    jobs[jobName].cancel();
  }
  process.exit();
}

process.on('SIGINT', closeGracefully)
process.on('SIGTERM', closeGracefully)