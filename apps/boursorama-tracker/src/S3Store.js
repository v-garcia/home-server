import { S3 } from '@aws-sdk/client-s3';
import dayjs from 'dayjs';

class S3Store {
  #bucketName = 'boursorama-tracker';
  #s3;

  constructor() {
    this.#s3 = new S3({ endpoint: process.env.AWS_S3_ENDPOINT });
  }

  async putDayMovement(day, accountId, movementsCsv) {
    const id = `movements/${accountId}/${dayjs(day).format('YYYYMMDD')}_movements.csv`;

    await this.#s3.putObject({
      ContentType: 'text/csv',
      Key: id,
      Bucket: this.#bucketName,
      Body: movementsCsv,
    });
  }

  async getMovements(accountId) {
    return await this.#s3.listObjectsV2({
      Bucket: this.#bucketName,
      Prefix: `movements/${accountId}`,
    });
  }
}

export default S3Store;
