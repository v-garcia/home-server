const fastify = require('fastify')({
    logger: true
});
const path = require('path');
const providers = require('./providers');
const fs = require("fs");
const fastifyStatic = require('fastify-static');

const notif = (process.env.GOTIFY_URL && process.env.GOTIFY_TOKEN) ?
    require('./gotify.js')(process.env.GOTIFY_URL, process.env.GOTIFY_TOKEN) :
    () => { };


// Client assets
fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../static'),
});

// Articles
fastify.register(fastifyStatic, {
    root: path.join(__dirname, '../articles'),
    prefix: '/articles/',
    decorateReply: false,
});

fastify.register(require('fastify-formbody'))

fastify.get('/slurp', async (req, reply) => {
    const { page_url: pageUrl } = req.query;

    try {

        const provider = providers.getProviderForUrl(pageUrl);
        if (!provider) {
            throw new Error(`Not provider found for url ${pageUrl}`);
        }

        var fileName = provider.getArticleFileName(pageUrl);
        const filePath = `${__dirname}/../articles/${fileName}`;

        var grabbed = false;
        if (!fs.existsSync(filePath)) {
            grabbed = true;
            const pageData = await provider.slurpPage(pageUrl);
            fs.writeFileSync(filePath, pageData.content);
        }

    } catch (ex) {
        notif('Error slurping page', `An error occured while slurping url: ${pageUrl}`);
        throw ex;
    }

    notif('Success slurping', [`Url: ${pageUrl} `, `FileName: ${fileName} `, `Grabbed: ${grabbed} `].join('\n'));
    reply.redirect(`/articles/${fileName}`);
});

fastify.get('/health', async (req, reply) => {
    reply.send("OK");
})

fastify.post('/api/checkUrl', async ({ body }, reply) => {
    const url = body && body.url;

    if (!url) {
        reply.code(400).send("No url param");
    }

    const provider = providers.getProviderForUrl(url);

    reply.send({
        found: Boolean(provider),
        ...(provider ? { provider: provider.name } : {}),
        url
    });
})

fastify.get('/api/providers', async (req, reply) => {

    const res = providers.all.map(async p => {
        const { name, url, fullName } = p;

        const getStatus = async () => {
            try {
                return { isLogged: await p.isLogged() };
            } catch (e) {
                return { isLogged: false, error: e.toString() };
            }
        };

        return {
            name, url, fullName,
            ...(req.query.withStatus ? (await getStatus()) : {})
        };

    });

    reply.send(await Promise.all(res));
})


fastify.listen(3000, '0.0.0.0', (err, address) => {
    if (err) throw err
    fastify.log.info(`server listening on ${address} `)
});