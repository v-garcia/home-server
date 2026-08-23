const LeMonde = require('./lemonde');
const Courrier = require('./courrier');
const MediaCites = require('./mediacites');
const MediaPart = require('./mediapart');
const Asi = require('./asi');

class Providers {

    #providers;
    constructor() {
        this.#providers = [];
        this.#providers.push(new LeMonde());
        this.#providers.push(new Courrier());
        this.#providers.push(new MediaCites());
        this.#providers.push(new MediaPart());
        this.#providers.push(new Asi());
    }

    get all() {
        return this.#providers;
    }

    getProviderForUrl(url) {
        return this.#providers.find(p => p.validateUrl(url));
    }

}

const providers = new Providers();
module.exports = providers;