import levelup from 'levelup';
import leveldown from 'leveldown';
import dayjs from 'dayjs';

const DATA_PATH = './data';
const NEO_PREFIX = 'neo';

const db = levelup(leveldown(`${DATA_PATH}/db`));

function handleNotFoundError(err) {
  if (err.notFound) {
    return null;
  }
  throw err;
}

const savePlayedTrack = (prefix) => async (date, artist, title) => {
  if (!title || !artist) throw new Error('Artist & track title must be set');
  const epochS = dayjs(date).unix();

  const key = `${prefix}_song_${epochS}`;
  const latest_key = `${prefix}_song_latest`;
  const value = JSON.stringify({ title, artist });
  const latestValue = await db.get(latest_key).catch(handleNotFoundError);

  if (latestValue?.toString() != value) {
    console.info({ title, artist, key });
    return Promise.all([db.put(key, value), db.put(latest_key, value)]);
  }
};

const getTracksAsStream = (prefix) => (dateFrom, dateTo) => {
  const keyFrom = `${prefix}_song_${dayjs(dateFrom).unix()}`;
  const keyTo = `${prefix}_song_${dayjs(dateTo).unix()}`;
  return db.createReadStream({ keys: false, gt: keyFrom, lt: keyTo });
};

function getSpotifyTrackKey(artist, trackName) {
  return `spotify_track_${artist}_${trackName}`;
}

async function saveSpotifyTrackId(artist, title, spotifyId) {
  return db.put(getSpotifyTrackKey(artist, title), spotifyId);
}

async function getSpotifyTrackId(artist, title) {
  return db
    .get(getSpotifyTrackKey(artist, title))
    .then((x) => x.toString())
    .catch(handleNotFoundError);
}

export default {
  saveNeoPlayedTrack: savePlayedTrack(NEO_PREFIX),
  getNeoTracksAsStream: getTracksAsStream(NEO_PREFIX),
  getSpotifyTrackId,
  saveSpotifyTrackId,
};
