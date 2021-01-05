
const { S3 } = require('@aws-sdk/client-s3');
const { format: dateFormat, parseISO: dateParseISO } = require('date-fns')


const s3 = new S3({ endpoint: process.env.AWS_S3_ENDPOINT });


const BUCKET_NAME = "enedis-tracker";

async function readableToString(readable) {
  let result = '';
  for await (const chunk of readable) {
    result += chunk;
  }
  return result;
}

async function putDailyConsumption(date, consumption) {
  const id = `daily_consumption/${dateFormat(date, 'yyyyMMdd')}_daily.json`;

  await s3.putObject({ Key: id, Bucket: BUCKET_NAME, Body: JSON.stringify(consumption, null, 2) });

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

async function getLastDay() {
  const { Contents: keys } = await s3.listObjectsV2({ Bucket: BUCKET_NAME, Prefix: 'daily_consumption/' });

  if (!keys || !keys.length) {
    return null;
  }

  const [lastKey] = keys.map(({ Key }) => Key).sort().reverse();
  const [lastDate] = lastKey.match(/\d{8}/);

  return dateParseISO(lastDate);
}

module.exports = { putDailyConsumption, getAuthTokens, getPrices, putAuthTokens, getLastDay };