import dayjs from 'dayjs';
import store from '../local-store.js';
import { saveSpotifyNotFoundTracks } from '../store.js';
import spotifyApi from '../spotify.js';

const NB_SONGS = 90;
const SPOTIFY_PLAYLIST_ID = '2OioDzmnxunaDleMmsUZZG';


export default async function () {
  const topSongs = await store.getMeuhMostPlayedSongs(dayjs().subtract(1, 'month').toDate(), new Date(), NB_SONGS);

  const [wantedTracks, notFound] = await spotifyApi.getSpotifyIdsForTracksUsingCache(topSongs);

  if (notFound.length) {
    console.warn(`${notFound.length} track(s) not found on meuh playlist:`, notFound);
    await saveSpotifyNotFoundTracks(notFound.map(x => ({ ...x, spotifyId: null })));
  }

  const bannedSongs = ['65EHIh75TK9eT0Iz8XeFPf', '47ahdgvNAbWnLUXc1ll0bh', '1wPrRerwqkikcJk4GW0Lat',
    '1HgVxZN7ZboxbPwE0noLG4', '44qs3i4Wj1WVmeKcxnwLVA', '3vSn1frPgFcRXrjWOfhMLl', '6qn6KkhjbNI9ZSR83qG6so'];

  await spotifyApi.updateSpotifyPLaylistTracks(SPOTIFY_PLAYLIST_ID, wantedTracks.filter(t => bannedSongs.indexOf(t) == -1));
}