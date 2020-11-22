//





const NewsProvider = require('./newsProvider');
const { cleanUrl, hashStr } = require('./../utils');

class Asi extends NewsProvider {

    get name() {
        return 'arret_sur_image';
    }

    get fullName() {
        return 'Arrêt sur images';
    }

    get shortName() {
        return 'asi';
    }

    get url() {
        return "https://www.arretsurimages.net";
    }

    isLoggedFn() {
        return Boolean(document.querySelector('.user-avatar-component'));
    }

    preloadFn() {
        // Rm initial
        let avatarElem = document.querySelector('.user-avatar-component');
        if (avatarElem) {
            avatarElem.innerText = '😜';
        }
    }

    #validateUrlRegex = /^(https|http):\/\/(www\.)?arretsurimages\.net\/(|emissions|chroniques|articles|dossiers)\/([a-z0-9-]+\/)?(?<id>[a-z0-9\-]+)/;
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


module.exports = Asi;