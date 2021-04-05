import dayjs from 'dayjs';
import store from '../local-store.js';
import { saveSpotifyNotFoundTracks } from '../store.js';
import spotifyApi from '../spotify.js';

const NB_SONGS = 80;
const SPOTIFY_PLAYLIST_ID = '2OioDzmnxunaDleMmsUZZG';


export default async function () {
  const topSongs = await store.getMeuhMostPlayedSongs(dayjs().subtract(1, 'month').toDate(), new Date(), NB_SONGS);

  const [wantedTracks, notFound] = await spotifyApi.getSpotifyIdsForTracksUsingCache(topSongs);

  if (notFound.length) {
    console.warn(`${notFound.length} track(s) not found on meuh playlist:`, notFound);
    await saveSpotifyNotFoundTracks(notFound.map(x => ({ ...x, spotifyId: null })));
  }

  await spotifyApi.updateSpotifyPLaylistTracks(SPOTIFY_PLAYLIST_ID, wantedTracks);
}