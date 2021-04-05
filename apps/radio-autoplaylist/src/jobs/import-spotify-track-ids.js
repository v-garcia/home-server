
import { getSpotifyTracksToImport, moveAllSpotifyTracksToImported } from '../store.js';
import localStore from '../local-store.js';

export default async function () {
    let tracksToImportGenerator = getSpotifyTracksToImport();

    for await (let { artist, title, spotifyId } of tracksToImportGenerator) {
        spotifyId = spotifyId.split(':').pop();
        await localStore.saveSpotifyTrackId(artist, title, spotifyId);
        console.info('Found and imported spotify track id from s3', { artist, title, spotifyId });
    }

    await moveAllSpotifyTracksToImported();
}