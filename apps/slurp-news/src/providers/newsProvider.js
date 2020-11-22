const cookies = require('../../cookies.json');
const singleFileParams = require('../singleFileParams');
const { get: getSingleFileScripts } = require('../../assets/SingleFile-master/cli/back-ends/common/scripts.js');
const puppeteer = require('puppeteer');

const pupetterAgs = [
    '--no-sandbox',
    '--disable-gpu',
    "--disable-dev-shm-usage",
    '--disable-setuid-sandbox',
    '--disable-web-security',
    '--disable-dev-shm-usage',
    '--single-process',
    '--no-zygote',
    '--no-first-run',
    '--window-size=1920,1080'
];

class NewsProvider {
    constructor() { }

    get name() {
        throw new Error('name not implemented');
    }

    get fullName() {
        throw new Error('fullName not implemented');
    }

    get shortName() {
        throw new Error('shortName not implemented');
    }

    get url() {
        throw new Error('Url not implemented');
    }

    getArticleFileName(url) {
        const id = this.extractArticleIdFromUrl(url);
        return `${this.shortName}_${id}.html`;
    }

    validateUrl(url) {
        throw new Error(`validateUrl not implemented for '${this.name}'`);
    }

    extractArticleIdFromUrl(url) {
        throw new Error(`extractArticleIdFromUrl not implemented for '${this.name}'`);
    }

    isLoggedFn() {
        throw new Error(`isLogged not implemented for '${this.name}'`);
    }


    getCookies() {
        return cookies[this.name] || [];
    }

    preloadFn() { }

    prepareUrlForSlurp(url) { return url };

    async isLogged() {

        const browser = await puppeteer.launch({
            headless: true,
            args: pupetterAgs
        });

        const page = await browser.newPage();

        // Inject credentials cookies
        await page.setCookie(...this.getCookies());
        await page.goto(this.url);

        const res = await page.evaluate(this.isLoggedFn);

        await browser.close();

        return res;
    }

    async slurpPage(url) {

        const options = { ...singleFileParams, url: this.prepareUrlForSlurp(url) };
        const toInject = await getSingleFileScripts(singleFileParams);
        const browser = await puppeteer.launch({
            headless: true,
            args: pupetterAgs
        });

        const page = await browser.newPage();

        // Inject credentials cookies
        await page.setCookie(...this.getCookies());

        // Inject SingleFile extension
        await page.evaluateOnNewDocument(toInject);

        // Load page
        await page.goto(options.url, {
            timeout: options.browserLoadMaxTime || 0,
            waitUntil: options.browserWaitUntil || "networkidle0"
        });

        // Check if we are logged in
        if (!await page.evaluate(this.isLoggedFn)) {
            throw new Error('Not logged to page');
        }

        // Pre-load script
        // console.log('preloaad')
        // console.log(this.preloadFn.toString());
        await page.evaluate(this.preloadFn);

        const pageData = await page.evaluate(async options => {
            const pageData = await singlefile.lib.getPageData(options);
            return pageData;
        }, options);

        await browser.close();

        return pageData;
    };

}

module.exports = NewsProvider;