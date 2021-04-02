const NewsProvider = require('./newsProvider');

class LeMonde extends NewsProvider {

    get name() {
        return 'lemonde';
    }

    get fullName() {
        return "Le Monde";
    }

    get shortName() {
        return 'lmd';
    }

    get url() {
        return "https://www.lemonde.fr";
    }

    isLoggedFn() {
        return window.lmd && window.lmd.isAbo;
    }

    preloadFn() {
        // Remove user name
        let userElem = document.getElementsByClassName('User')[0];
        userElem && userElem.remove();

        // Remove banneer & annoying styles
        let iubendaBanner = document.getElementById('iubenda-cs-banner');
        iubendaBanner && iubendaBanner.remove();

        // Rm no scroll style
        document.body.removeAttribute('style');
        document.documentElement.removeAttribute('style');

        // Rm gdpr stuffs
        document.body.classList.remove('popin-gdpr-no-scroll');
        document.documentElement.classList.remove('popin-gdpr-no-scroll');
        let gdprModal = document.getElementsByClassName('gdpr-lmd-standard');
        gdprModal[0] && gdprModal[0].remove();
    }

    // TODO: Be more restrictive here
    #validateUrlRegex = /^(https|http):\/\/[a-z]+\.lemonde\.fr\//;
    validateUrl(url) {
        return this.#validateUrlRegex.test(url);
    }

    #idRegex = /(\d+)_(\d+)\.(html)/;
    extractArticleIdFromUrl(url) {
        const matches = url.match(this.#idRegex);
        const id = (matches || [])[1]

        if (!id || isNaN(id)) {
            throw "Cannot parse article url for article id";
        }

        return id;
    }
}


module.exports = LeMonde;