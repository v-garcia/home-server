const fastify = require('fastify')({
    logger: true
});
const path = require('path');
const lmd = require('./lemonde.js');
const fs = require("fs");
const { cpuUsage } = require('process');



const notif = (process.env.GOTIFY_URL && process.env.GOTIFY_TOKEN) ?
    require('./gotify.js')(process.env.GOTIFY_URL, process.env.GOTIFY_TOKEN) :
    () => { };



fastify.register(require('fastify-static'), {
    root: path.join(__dirname, '../articles'),
    prefix: '/articles/',
});

fastify.register(require('fastify-formbody'))


fastify.post('/', async (req, reply) => {
    const { page_url } = req.body;

    try {
        if (!lmd.validateUrl(page_url)) {
            throw "Not a valid LeMonde.fr article url";
        }

        var lmdId = lmd.extractArticleIdFromUrl(page_url);
        var fileName = `lmd_${lmdId}`;
        var filePath = `${__dirname}/../articles/${fileName}.html`;
        var grabbed = false;

        if (!fs.existsSync(filePath)) {
            grabbed = true;
            const pageData = await lmd.slurpPage(page_url);
            fs.writeFileSync(filePath, pageData.content);
        }

    } catch (ex) {
        notif('Error slurping lemonde page', `An error occured while slurping url:${page_url}`);
        throw ex;
    }

    notif('Success slurping', [`Url: ${page_url}`, `Id: ${lmdId}`, `Grabbed: ${grabbed}`].join('\n'));
    reply.redirect(`/articles/${fileName}.html`);
});

fastify.get('/', function (req, reply) {
    reply.sendFile('index.html', path.join(__dirname, '../static'));
})

fastify.listen(3000, '0.0.0.0', (err, address) => {
    if (err) throw err
    fastify.log.info(`server listening on ${address}`)
});