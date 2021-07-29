import fs from "fs";
import { join } from "path";

class Store {
  static writeObject(filePath, data) {
    let dataJson = JSON.stringify(data, null, "\t");

    console.log("process path (store) : " + process.cwd());

    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, dataJson, (err) => {
        if (err) {
          console.log("Error write " + filePath);
          console.log(err);
          reject(err);
        } else {
          console.log("Successfully write " + filePath);
          resolve(data);
        }
      });
    });
  }

  static readObject(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, (err, data) => {
        if (err) {
          console.log("Error read " + filePath);
          reject(err);
        } else {
          let dataObj = JSON.parse(data);
          console.log("Successfully read " + filePath);
          resolve(dataObj);
        }
      });
    });
  }
}

export default Store;
