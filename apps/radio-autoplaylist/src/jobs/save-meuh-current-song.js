import got from 'got';
import localStore from '../local-store.js';

export default async function () {
    const url = "https://www.radiomeuh.com/player/rtdata/tracks.json";

    // query parse
    const { body: [{ artist, titre: title } = {}] = [] } = await got.get(url, { responseType: 'json' });

    // saving song occurence
    await localStore.saveMeuhPlayedTrackIfDifferent(new Date(), artist.trim(), title.trim());
}