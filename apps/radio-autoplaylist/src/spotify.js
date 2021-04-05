import dayjs from 'dayjs';
import SpotifyWebApi from 'spotify-web-api-node';
import localStore from './local-store.js';
import { getSpotifyCredentials as getCredentials, putSpotifyCredentials as putCredentials } from './store.js';

const REDIRECT_URL = 'https://example.com/callback';

function toSpotifyUri(id) {
  return `spotify:track:${id}`;
}

let _token = null;
let _tokenGenerationDate = null;
async function getSpotifyApi() {
  const client = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    redirectUri: REDIRECT_URL,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  if (_token && dayjs(_tokenGenerationDate).add(5, 'minutes').isAfter(dayjs())) {
    client.setAccessToken(_token);
  } else {
    console.info('Fetch credentials from s3');
    const setAccessToken = (token) => {
      client.setAccessToken(token);
      _token = token;
      _tokenGenerationDate = dayjs().valueOf();
    };

    const creds = await getCredentials();

    if (creds.codeGrant) {
      console.info('Get token from code grant');
      await putCredentials({ ...creds, codeGrant: null });
      const { body: { access_token, refresh_token } = {} } = await client.authorizationCodeGrant(
        creds.codeGrant
      );
      await putCredentials({ refreshToken: refresh_token, codeGrant: null });
      setAccessToken(access_token);
    } else if (creds.refreshToken) {
      console.info('Refresh token');
      client.setRefreshToken(creds.refreshToken);
      const { body: { access_token } = {} } = await client.refreshAccessToken();
      setAccessToken(access_token);
    } else {
      throw new Error('There is no enough info to authentificate');
    }
  }

  return client;
}


function addApi(fn) {
  return async (...params) => {
    const api = await getSpotifyApi();
    return fn(api, ...params);
  };
}

async function getTrackId(api, artist, trackName) {
  const resp = await api.searchTracks(`track: ${trackName} artist: ${artist}`);
  return resp?.body?.tracks?.items?.shift()?.id;
}

async function getPlaylistTrackIds(api, playlistId) {
  const { body: { items = [] } = {} } = await api.getPlaylistTracks(playlistId);
  return items.map((x) => x.track.id);
}

async function addTracksToPlaylist(api, playlistId, trackIds) {
  return api.addTracksToPlaylist(playlistId, trackIds.map(toSpotifyUri), { position: 0 });
}

async function removeTracksFromPlaylist(api, playlistId, trackIds) {
  return api.removeTracksFromPlaylist(
    playlistId,
    trackIds.map((x) => ({
      uri: toSpotifyUri(x),
    }))
  );
}

async function getSpotifyIdsForTracksUsingCache(api, tracks) {
  const promises = tracks.map(async (track) => {
    const { artist, title } = track;
    let id = await localStore.getSpotifyTrackId(artist, title);

    if (id) {
      return [track, id];
    }

    id = await getTrackId(api, artist, title);

    id && (await localStore.saveSpotifyTrackId(artist, title, id));
    return [track, id];
  });
  const responses = await Promise.all(promises);

  // [Found ids, Not found tracks]
  return [responses.map(([, x]) => x).filter((x) => x), responses.filter(([, x]) => !x).map(([x]) => x)];
}

async function updateSpotifyPLaylistTracks(api, playlistId, tracksToSet) {
  const playlistTracks = await getPlaylistTrackIds(api, playlistId);
  const toAdd = tracksToSet.filter((x) => !playlistTracks.includes(x));
  const toRemove = playlistTracks.filter((x) => !tracksToSet.includes(x));

  console.info(`Update playlist ${playlistId} (+${toAdd.length} -${toRemove.length})`);

  return Promise.all([
    toAdd.length && addTracksToPlaylist(api, playlistId, toAdd),
    toRemove.length && removeTracksFromPlaylist(api, playlistId, toRemove),
  ]);
}

export default {
  getSpotifyIdsForTracksUsingCache: addApi(getSpotifyIdsForTracksUsingCache),
  updateSpotifyPLaylistTracks: addApi(updateSpotifyPLaylistTracks),
};
