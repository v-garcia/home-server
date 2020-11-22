

const NewsProvider = require('./newsProvider');
const { cleanUrl, hashStr } = require('./../utils');

class MediaPart extends NewsProvider {

    get name() {
        return 'mediapart';
    }

    get fullName() {
        return "Mediapart";
    }

    get shortName() {
        return 'mpt';
    }

    get url() {
        return "https://www.mediapart.fr";
    }

    isLoggedFn() {
        return Boolean(window.mediapart && window.mediapart.user && window.mediapart.user.uid);
    }

    preloadFn() {
        // Remove comments
        let accountInfo = document.querySelector('li.account');
        accountInfo && accountInfo.remove();

        // Remove menu pannel
        let menuPanel = document.getElementById('menuPanelEl');
        menuPanel && menuPanel.remove();
    }

    prepareUrlForSlurp(url) {
        url = super.prepareUrlForSlurp(url);
        url = cleanUrl(url);
        return `${url}?onglet=full`;
    }

    #validateUrlRegex = /^(https|http):\/\/(www\.)?mediapart\.fr\/journal\/[a-z]+\/(?<id>\d+)\/.+/;
    validateUrl(url) {
        return this.#validateUrlRegex.test(url);
    }

    extractArticleIdFromUrl(url) {
        const { groups: { id } } = url.match(this.#validateUrlRegex);

        if (!id || isNaN(id)) {
            throw "Cannot parse article url for article id";
        }

        return id;
    }
}


module.exports = MediaPart;