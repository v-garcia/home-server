import { S3 } from '@aws-sdk/client-s3';
import dayjs from 'dayjs';

class S3Store {
  #bucketName = 'boursorama-tracker';
  #s3;

  constructor() {
    this.#s3 = new S3({ endpoint: process.env.AWS_S3_ENDPOINT });
  }

  #accountToPrefix(accountId) {
    return `movements/${accountId}`;
  }

  #dateToKey(day) {
    return `${dayjs(day).format('YYYYMMDD')}.csv`;
  }

  async putDayMovement(day, accountId, movementsCsv) {
    const id = `${this.#accountToPrefix(accountId)}/${this.#dateToKey(day)}`;

    await this.#s3.putObject({
      ContentType: 'text/csv',
      Key: id,
      Bucket: this.#bucketName,
      Body: movementsCsv,
    });
  }

  async getMovements(accountId, fromDay) {
    return await this.#s3.listObjectsV2({
      Bucket: this.#bucketName,
      Prefix: this.#accountToPrefix(accountId),
      StartAfter: `${this.#accountToPrefix(accountId)}/${this.#dateToKey(fromDay)}`
    });
  }
}

export default S3Store;
