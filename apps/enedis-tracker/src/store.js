import { S3 } from '@aws-sdk/client-s3';
import { format as dateFormat, parseISO as dateParseISO } from 'date-fns';



const s3 = new S3({ endpoint: process.env.AWS_S3_ENDPOINT });


const BUCKET_NAME = "enedis-tracker";

async function readableToString(readable) {
  let result = '';
  for await (const chunk of readable) {
    result += chunk;
  }
  return result;
}

async function putDailyConsumption(usagePointId , date, info) {
  const id = `${usagePointId}/daily_consumption/${dateFormat(date, 'yyyyMMdd')}.json`;

  await s3.putObject({ Key: id, Bucket: BUCKET_NAME, Body: JSON.stringify({...info, day: dateFormat(date, 'yyyy-MM-dd')}, null, 2) });
}

const getS3JsonObject = key => async () => {
  const response = await s3.getObject({ Key: key, Bucket: BUCKET_NAME });
  return JSON.parse(await readableToString(response.Body))
};

const getAuthTokens = getS3JsonObject("auth_tokens.json");

const getPrices = getS3JsonObject("prices.json");


function putAuthTokens(accessToken, refreshToken) {
  return s3.putObject({ Key: "auth_tokens.json", Bucket: BUCKET_NAME, Body: JSON.stringify({ accessToken, refreshToken }, null, 2) });
}

async function getLastDay(usagePointId) {
  const { Contents: keys } = await s3.listObjectsV2({ Bucket: BUCKET_NAME, Prefix: `${usagePointId}/daily_consumption` });

  if (!keys || !keys.length) {
    return null;
  }

  const [lastKey] = keys.map(({ Key }) => Key).sort().reverse();
  const [lastDate] = lastKey.split('/').pop().match(/\d{8}/);

  return dateParseISO(lastDate);
}

export default { putDailyConsumption, getAuthTokens, getPrices, putAuthTokens, getLastDay };