const data = "a_voyage-jirai-en-vacancesd-dans-un-champ-de-colza-australien";
var crypto = require('crypto');
const farmhash = require('farmhash');

function b64Escape(str) {
    return str.replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '')
}


let hash1 = crypto.createHash('MD5').update(data).digest("base64");
console.info(b64Escape(hash1));



const hash2 = farmhash.hash64(data);
const niel = BigInt.asUintN(64, hash2);
console.info(niel);
console.info(hash2);
console.log(typeof niel);
console.log(typeof hash2);


var base32 = require('hi-base32');
// base32.encode()
//console.log(b64Escape(hash));

const buf = Buffer.allocUnsafe(8);
buf.writeBigUInt64BE(niel);
console.log(buf);
const arr = new Uint8Array(buf);
console.info(arr);


console.info(b64Escape(base32.encode(buf)).toLowerCase());

const base32Encode = require('base32-encode')
console.info(base32Encode(buf, 'Crockford', { padding: false }));


console.info(b64Escape(buf.toString('base64')));
// const buf = Buffer.alloc(64);
// buf.readBigInt64BE(niel);