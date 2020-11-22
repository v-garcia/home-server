const farmhash = require('farmhash');
const base32Encode = require('base32-encode')

function hashStr(str) {
    const buf = Buffer.allocUnsafe(8);
    let hash = farmhash.hash64(str);
    hash = BigInt.asUintN(64, hash);
    buf.writeBigUInt64BE(hash);
    return base32Encode(buf, 'Crockford', { padding: false }).toLowerCase();
}

function removeLastSlash(url) {
    return url.replace(/\/$/, '')
}

function removeUrlParams(url) {
    const i = url.indexOf('?');

    return i === -1 ? url : url.substring(0, i);
}

function cleanUrl(url) {
    url = removeUrlParams(url);
    url = removeLastSlash(url);
    return url;
}

module.exports = { cleanUrl, removeLastSlash, removeUrlParams, hashStr };