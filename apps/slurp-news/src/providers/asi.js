const NewsProvider = require('./newsProvider');
const { cleanUrl, hashStr } = require('./../utils');
const storage = require('../storage');
const got = require('got');

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

    // As ASI token expires too fast, we always query for a new one
    async getCookies() {
        const [username, password] = (await storage.retrieveCredentials())[this.name];

        const { body: { access_token } } = await got.post(`https://api.arretsurimages.net/oauth/v2/token`, {
            responseType: 'json',
            json: {
                username,
                password,
                client_id: "1_1e3dazertyukilygfos7ldzertyuof7pfd",
                client_secret: "2r8yd4a8un0fn45d93acfr3efrgthzdheifhrehihidg4dk5kds7ds23",
                grant_type: "password"
            }
        });

        return [
            {
                "name": "auth_access_token",
                "value": access_token,
                "domain": "www.arretsurimages.net"
            }
        ];
    }
}


module.exports = Asi;