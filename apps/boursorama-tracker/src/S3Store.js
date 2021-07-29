
import { S3 } from "@aws-sdk/client-s3";
import dayjs from "dayjs";
const { format: dateFormat, parseISO: dateParseISO } = require('date-fns')



class S3Store {
    #bucketName = "boursorama-tracker";
    #s3;

    constructor() {
        this.#s3 = new S3({ endpoint: process.env.AWS_S3_ENDPOINT });


    }

    async putDayMovement(day, accountId, movementsCsv) {
        const id = `movements/${accountId}/${dayjs(day).format("YYYYMMDD")}_movements.json`;
      
        await s3.putObject({ Key: id, 
                             Bucket: this.#bucketName, 
                             Body: movementsCsv });
      
      }

    //   async function getLastDay() {
    //     const { Contents: keys } = await s3.listObjectsV2({ Bucket: BUCKET_NAME, Prefix: 'daily_consumption/' });
      
    //     if (!keys || !keys.length) {
    //       return null;
    //     }
      
    //     const [lastKey] = keys.map(({ Key }) => Key).sort().reverse();
    //     const [lastDate] = lastKey.match(/\d{8}/);
      
    //     return dateParseISO(lastDate);
    //   }

}

export default S3Store;