

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

        // Cookie consent
        let cookieConsent = document.querySelector('.cc-cookie-consent-banner-modal');
        cookieConsent && cookieConsent.remove()
        let jsModal = document.getElementById('js-cc-modal');
        jsModal && jsModal.remove();

        document.documentElement.classList.remove('no-scroll');
    }

    prepareUrlForSlurp(url) {
        url = super.prepareUrlForSlurp(url);
        url = cleanUrl(url);
        return `${url}?onglet=full`;
    }

    #validateUrlRegex = /^(https|http):\/\/(www\.)?mediapart\.fr\/journal\/(?<cat>[a-z]+)\/(?<day>\d+)\/(?<title>[^/]+)/
    validateUrl(url) {
        return this.#validateUrlRegex.test(url);
    }

    extractArticleIdFromUrl(url) {
        const { groups: { day, title } } = url.match(this.#validateUrlRegex);

        if (!day || isNaN(day) || !title) {
            throw "Cannot parse article url";
        }

        return hashStr(`${day}-${title}`);
    }
}


module.exports = MediaPart;