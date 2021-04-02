import dayjs from 'dayjs';
import SpotifyWebApi from 'spotify-web-api-node';
import localStore from './local-store.js';
import { getSpotifyCredentials as getCredentials, putSpotifyCredentials as putCredentials } from './store.js';

const REDIRECT_URL = 'https://example.com/callback';

function toSpotifyUri(id) {
  return `spotify:track:${id}`;
}

let _authInfo = null;
let _dateRetrieved = null;
async function getSpotifyApi() {
  const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    redirectUri: REDIRECT_URL,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });
  let authInfo;

  const saveAuthInfo = async (accessToken, refreshToken, expiresIn = 3600) => {
    const toSave = {
      accessToken,
      refreshToken,
      validUntil: dayjs().add(expiresIn, 'second').unix(),
      codeGrant: null,
    };
    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);

    await putCredentials(toSave);
    _authInfo = null;
  };

  // Use local authinfo cache if not too old
  if (_authInfo && dayjs(_dateRetrieved).add(5, 'minutes').isAfter(dayjs())) {
    authInfo = _authInfo;
  } else {
    console.info('Fetching credentials from s3');
    authInfo = await getCredentials();
    _dateRetrieved = dayjs().valueOf();
    _authInfo = authInfo;
  }

  // Throw error if it's not possible to auth
  if (!authInfo.codeGrant && !authInfo.refreshToken) {
    throw new Error('There is no enough info to authentificate');
  }

  // If codeGrant is set, delete it and refresh all tokens
  if (authInfo.codeGrant) {
    console.info('Get token from code grant');
    await saveAuthInfo(authInfo.accessToken, authInfo.refreshToken);
    const { body: { access_token, refresh_token, expires_in } = {} } = await spotifyApi.authorizationCodeGrant(
      authInfo.codeGrant
    );
    await saveAuthInfo(access_token, refresh_token, expires_in);
  }

  // Access token not set or expired
  if (!authInfo.accessToken || !authInfo.validUntil || dayjs().isAfter(dayjs.unix(authInfo.validUntil))) {
    console.info('Refreshing token');
    spotifyApi.setRefreshToken(authInfo.refreshToken);
    const { body: { access_token, expires_in } = {} } = await spotifyApi.refreshAccessToken();
    await saveAuthInfo(access_token, authInfo.refreshToken, expires_in);
  } else {
    spotifyApi.setAccessToken(authInfo.accessToken);
  }

  return spotifyApi;
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
