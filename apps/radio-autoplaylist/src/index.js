import Bree from 'bree';
import path from 'path';
import Graceful from '@ladjs/graceful';
import { gotifyNotification } from './utils.js';

const bree = new Bree({
  root: path.join(path.resolve(), 'src', 'jobs'),
  jobs: [
    {
      name: 'save-neo-current-song',
      interval: '1m',
      timeout: '30 seconds',
    },
    {
      name: 'update-neo-most-played-playlist-on-spotify',
      interval: 'every 2 days',
    },
    {
      name: 'import-spotify-track-ids',
      interval: 'every 6 hours'
    }
  ],
  errorHandler: async (error, workerMetadata) => {
    const msg = `Error on worker ${workerMetadata.name} : ${error.name}, ${error.message}`;
    console.error(msg, error);
    await gotifyNotification(`Error on ${workerMetadata.name}`, msg);
  },
});

const graceful = new Graceful({ brees: [bree] });
graceful.listen();

bree.start();
