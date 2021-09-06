

const NewsProvider = require('./newsProvider');
const { cleanUrl, hashStr } = require('./../utils');

class MediaCites extends NewsProvider {

    get name() {
        return 'mediacites';
    }

    get fullName() {
        return "Mediacités";
    }

    get shortName() {
        return 'mct';
    }

    get url() {
        return "https://www.mediacites.fr";
    }

    isLoggedFn() {
        return window.favorites_data && window.favorites_data.logged_in === "1";
    }

    preloadFn() {
        // Remove comments
        let comments = document.getElementById('comments');
        comments && comments.remove();
    }

    #validateUrlRegex = /^(https|http):\/\/(www\.)?mediacites\.fr\/((?!mon-compte)([a-z0-9]|\-)+)\/[a-z0-9]+\/\d{4}\/\d{2}\/\d{2}\/(?<id>[a-z0-9\-]+)/;
    validateUrl(url) {
        return this.#validateUrlRegex.test(url);
    }

    extractArticleIdFromUrl(url) {
        const { groups: { id } } = url.match(this.#validateUrlRegex);

        if (!id) {
            throw "Cannot parse article url for article id";
        }

        return id;
    }
}


module.exports = MediaCites;