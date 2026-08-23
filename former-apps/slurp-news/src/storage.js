const { S3 } = require('@aws-sdk/client-s3');

const s3 = new S3({ endpoint: process.env.AWS_S3_ENDPOINT });

async function readableToString(readable) {
  let result = '';
  for await (const chunk of readable) {
    result += chunk;
  }
  return result;
}

async function retrieveCookies() {
  let res = await s3.getObject({ Key: "cookies.json", Bucket: process.env.APP_BUCKET });
  res = JSON.parse(await readableToString(res.Body));
  return res;
}

async function retrieveCredentials() {
  let res = await s3.getObject({ Key: "credentials.json", Bucket: process.env.APP_BUCKET });
  res = JSON.parse(await readableToString(res.Body));
  return res;
}

module.exports = { retrieveCookies, retrieveCredentials };