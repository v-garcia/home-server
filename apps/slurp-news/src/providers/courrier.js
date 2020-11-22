const NewsProvider = require('./newsProvider');
const { cleanUrl, hashStr } = require('./../utils');

class Courrier extends NewsProvider {

    get name() {
        return 'courrier_international';
    }

    get fullName() {
        return 'Courrier international';
    }

    get shortName() {
        return 'cin';
    }

    get url() {
        return "https://www.courrierinternational.com";
    }

    isLoggedFn() {
        return /logged\=1;/.test(document.cookie);
    }

    #validateUrlRegex = /^(https|http):\/\/(www\.)?courrierinternational\.com\/(revue-de-presse|article|depeche|fiche-pratique|avis-experts|long-format|une|diaporama|dessin|video)\/(?<id>[a-z0-9\-]+)/;
    validateUrl(url) {
        return this.#validateUrlRegex.test(url);
    }

    extractArticleIdFromUrl(url) {
        const { groups: { id } } = url.match(this.#validateUrlRegex);

        if (!id) {
            throw "Cannot parse article url for article id";
        }

        return hashStr(id);
    }
}


module.exports = Courrier;