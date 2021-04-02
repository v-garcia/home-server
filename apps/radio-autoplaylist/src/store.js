import { S3 } from '@aws-sdk/client-s3';
import dayjs from 'dayjs';

const BUCKET_NAME = "radio-autoplaylist";
const AUTH_INFO_S3_KEY = "credentials.json";
const s3 = new S3({ endpoint: process.env.AWS_S3_ENDPOINT });

async function readableToString(readable) {
    let result = '';
    for await (const chunk of readable) {
        result += chunk;
    }
    return result;
}

const getS3JsonObject = key => async () => {
    const response = await s3.getObject({ Key: key, Bucket: BUCKET_NAME });
    return JSON.parse(await readableToString(response?.Body))
};

const putS3JsonObject = key => async object => {
    return s3.putObject({ Key: key, Bucket: BUCKET_NAME, Body: JSON.stringify(object, null, 2) });
}

const getSpotifyCredentials = getS3JsonObject(AUTH_INFO_S3_KEY);
const putSpotifyCredentials = putS3JsonObject(AUTH_INFO_S3_KEY);

function saveSpotifyNotFoundTracks(tracks) {
    const key = `spotify-not-found/exported/${dayjs().unix()}_tracks.json`;
    return putS3JsonObject(key)(tracks);
}

async function getSpotifyTracksInfoKeys() {

    const { Contents: objects = [] } = await s3.listObjectsV2({ Bucket: BUCKET_NAME, Prefix: "spotify-not-found/to-import/" });
    return objects
        .filter(x => x.Size > 0 && x.Key.endsWith('json'))
        .map(x => x.Key);
}

async function* getSpotifyTracksToImport() {
    let keys = await getSpotifyTracksInfoKeys();
    for (let k of keys) {
        let tracks = await getS3JsonObject(k)();
        for (let t of tracks) {
            yield t;
        }
    }
}

async function moveAllSpotifyTracksToImported() {
    let keys = await getSpotifyTracksInfoKeys();
    for (let k of keys) {
        await s3.copyObject({ Bucket: BUCKET_NAME, Key: k.replace(/\/to-import\//, '/imported/'), CopySource: `${BUCKET_NAME}/${k}` });
        await s3.deleteObject({ Bucket: BUCKET_NAME, Key: k });
    }
}

export { getSpotifyCredentials, putSpotifyCredentials, saveSpotifyNotFoundTracks, getSpotifyTracksToImport, moveAllSpotifyTracksToImported };