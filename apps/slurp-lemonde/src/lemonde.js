const { get: getScriptsToInject } = require('../assets/SingleFile-master/cli/back-ends/common/scripts.js');
const { getOptions } = require('./options.js');
const fs = require("fs");
const puppeteer = require('puppeteer');
const cookies = require('../cookies.json');
const { cpuUsage } = require('process');


const idRegex = /(\d+)_(\d+)\.(html)/;
function extractArticleIdFromUrl(url) {
    var regex = /(\d+)_(\d+)\.(html)/;
    const matches = url.match(idRegex);
    const id = (matches || [])[1]

    if (!id || isNaN(id)) {
        throw "Cannot parse article url";
    }

    return id;
}

const validateUrlRegex = /^(https|http):\/\/[a-z]+\.lemonde\.fr\//;
function validateUrl(url) {
    return validateUrlRegex.test(url);
}

async function slurpPage(url, optionsOverride) {
    const options = getOptions({
        url,
        ...(optionsOverride || {})
    });

    const toInject = await getScriptsToInject(options);
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            '--no-sandbox',
            "--disable-gpu",
            "--disable-dev-shm-usage",
            '--disable-setuid-sandbox',
            '--disable-web-security',
            '--window-size=1920,1080'
        ]
    });

    const page = await browser.newPage();
    await page.setCookie(...cookies);
    await page.evaluateOnNewDocument(toInject);

    await page.goto(options.url, {
        timeout: options.browserLoadMaxTime || 0,
        waitUntil: options.browserWaitUntil || "networkidle0"
    });

    const pageId = await page.evaluate(() => lmd.context.article.legacyId);

    if (!pageId) {
        throw "Article id was not found";
    }

    const pageData = await page.evaluate(async options => {
        // specific lmd instructions to remove uneeded stufs

        document.getElementsByClassName('User')[0].remove();

        // plugin call
        const pageData = await singlefile.lib.getPageData(options);
        return pageData;
    }, options);

    pageData.lmdId = pageId;

    await browser.close();

    return pageData;
};

module.exports = { slurpPage, extractArticleIdFromUrl, validateUrl };