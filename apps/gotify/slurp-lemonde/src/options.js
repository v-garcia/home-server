const options = {
    "backEnd": "puppeteer",
    "browserHeadless": true,
    "browserExecutablePath": "",
    "browserWidth": 1920,
    "browserHeight": 1080,
    "browserLoadMaxTime": 60000,
    "browserWaitUntil": "networkidle2",
    "browserWaitUntilFallback": true,
    "browserDebug": false,
    "browserExtensions": [],
    "browserScripts": [],
    "compressCss": false,
    "compressHtml": true,
    "filenameTemplate": "{page-title} ({date-iso} {time-locale}).html",
    "filenameReplacementCharacter": "_",
    "groupDuplicateImages": true,
    "loadDeferredImages": true,
    "loadDeferredImagesMaxIdleTime": 1500,
    "maxParallelWorkers": 8,
    "maxResourceSizeEnabled": false,
    "maxResourceSize": 10,
    "removeHiddenElements": false,
    "removeUnusedStyles": true,
    "removeUnusedFonts": true,
    "removeFrames": false,
    "removeImports": true,
    "removeScripts": true,
    "removeAudioSrc": true,
    "removeVideoSrc": true,
    "removeAlternativeFonts": true,
    "removeAlternativeMedias": true,
    "removeAlternativeImages": true,
    "saveRawPage": false,
    "webDriverExecutablePath": "",
    "userScriptEnabled": true,
    "includeBom": false,
    "crawlLinks": false,
    "crawlInnerLinksOnly": true,
    "crawlRemoveUrlFragment": true,
    "crawlMaxDepth": 1,
    "crawlExternalLinksMaxDepth": 1,
    "crawlReplaceUrls": false,
    "crawlRewriteRules": []
};

function getOptions(override) {
    return { ...options, ...override };
};

exports.getOptions = getOptions;