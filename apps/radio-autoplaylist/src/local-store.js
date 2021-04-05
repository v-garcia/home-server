import levelup from 'levelup';
import leveldown from 'leveldown';
import dayjs from 'dayjs';
import { NEO_PREFIX, MEUH_PREFIX } from './common.js';

const DATA_PATH = './data';

const db = levelup(leveldown(`${DATA_PATH}/db`));

function handleNotFoundError(err) {
  if (err.notFound) {
    return null;
  }
  throw err;
}

function reduceOverStream(stream, callback, acc) {
  return new Promise((resolve, reject) => {
    stream
      .on('data', (data) => {
        acc = callback(acc, data);
      })
      .on('error', reject)
      .on('end', () => resolve(acc));
  });
}

const getTracksAsStream = (prefix, dateFrom, dateTo) => {
  const keyFrom = `${prefix}_song_${dayjs(dateFrom).unix()}`;
  const keyTo = `${prefix}_song_${dayjs(dateTo).unix()}`;
  return db.createReadStream({ keys: false, gt: keyFrom, lt: keyTo });
};

const getSongsByOccurrence = (prefix, fromDate, toDate) => {
  const stream = getTracksAsStream(prefix, fromDate, toDate);
  return reduceOverStream(stream, (acc, data) => {
    data = data.toString();
    acc[data] = (acc[data] || 0) + 1;
    return acc;
  }, {});
}

const getMostPlayedSongs = (prefix) => async (fromDate, toDate, number) => {
  const songsByOccurence = await getSongsByOccurrence(prefix, fromDate, toDate);
  return Object.entries(songsByOccurence)
    .sort(([, x1], [, x2]) => x2 - x1)
    .map(([x]) => JSON.parse(x))
    .slice(0, number);
}

const savePlayedTrackIfDifferent = (prefix) => async (date, artist, title) => {
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
  saveMeuhPlayedTrackIfDifferent: savePlayedTrackIfDifferent(MEUH_PREFIX),
  saveNeoPlayedTrackIfDifferent: savePlayedTrackIfDifferent(NEO_PREFIX),
  getNeoMostPlayedSongs: getMostPlayedSongs(NEO_PREFIX),
  getMeuhMostPlayedSongs: getMostPlayedSongs(MEUH_PREFIX),
  getSpotifyTrackId,
  saveSpotifyTrackId,
};
