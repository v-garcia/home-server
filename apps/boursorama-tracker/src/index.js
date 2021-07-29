import BoursoramaApi from 'boursorama-unofficial-api';
import Utils from './Utils.js';
import path from "path";
import { fileURLToPath } from "url";
import Store from './Store.js';


let currentPath = fileURLToPath(import.meta.url);
currentPath = path.dirname(currentPath);



// const downloadPath = path.join(currentPath, "..", "/downloads");

// const api = new BoursoramaApi('69446284', '09483852', downloadPath);
// await api.init();
// await api.connect();


// let movements = await api.getMovements('c3395ffeab9f7c24773fcb0d1c8fa523', '02/07/2021', '24/07/2021');
// await api.getBrowser().close();
let movements = await Store.readObject("test.json");



movements = Utils.groupBy(movements, "dateOp");

console.info(movements);

