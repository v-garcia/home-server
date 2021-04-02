import dayjs from 'dayjs';
import store from '../local-store.js';
import { saveSpotifyNotFoundTracks } from '../store.js';
import { reduceOverStream } from '../utils.js';
import spotifyApi from '../spotify.js';

const NB_SONGS = 80;
const SPOTIFY_PLAYLIST_ID = '4S1G62EWPPG51ijZc4uEvs';

const songsByOccurence = await reduceOverStream(
  store.getNeoTracksAsStream(dayjs().subtract(1, 'month').toDate(), new Date()),
  (acc, data) => {
    data = data.toString();
    acc[data] = (acc[data] || 0) + 1;
    return acc;
  },
  {}
);

const topSongs = Object.entries(songsByOccurence)
  .sort(([, x1], [, x2]) => x2 - x1)
  .map(([x]) => JSON.parse(x))
  .slice(0, NB_SONGS);

const [wantedTracks, notFound] = await spotifyApi.getSpotifyIdsForTracksUsingCache(topSongs);

if (notFound.length) {
  console.warn(`${notFound.length} track(s) not found:`, notFound);
  await saveSpotifyNotFoundTracks(notFound.map(x => ({ ...x, spotifyId: null })));
}


await spotifyApi.updateSpotifyPLaylistTracks(SPOTIFY_PLAYLIST_ID, wantedTracks);

process.exit(0);
