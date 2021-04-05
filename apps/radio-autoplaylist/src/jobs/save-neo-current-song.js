import got from 'got';
import localStore from '../local-store.js';

export default async function () {
    const nowDate = new Date();
    const url = `http://www.radioneo.org/liveJSON.json?_=${nowDate.valueOf()}`;

    // query parse
    const { body: { artisteNom: artist, titreNom: title } = {} } = await got.get(url, { responseType: 'json' });

    // saving song occurence
    await localStore.saveNeoPlayedTrackIfDifferent(nowDate, artist, title);

}