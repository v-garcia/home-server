const path = require('path');
const fastify = require('fastify')({
  logger: true,
});
const got = require('got');

const googlePlaceUrl = 'https://maps.googleapis.com/maps/api/place';

function parseAddressComponents(components) {
  const findC = (c) => components.find((x) => x.types.includes(c)).short_name || '';

  return {
    address: `${findC('street_number')} ${findC('route')}`,
    city: findC('locality').toUpperCase(),
    zipcode: Number(findC('postal_code')),
  };
}

async function getNearbyPharmacy({ long, lat }) {
  const nearbyUrl = `${googlePlaceUrl}/nearbysearch/json?location=${lat},${long}&radius=750&types=pharmacy&key=${process.env.GOOGLE_API_KEY}`;
  const { results } = await got(nearbyUrl, { responseType: 'json', resolveBodyOnly: true });
  const { place_id } = results.pop();
  const placeDetailUrl = `${googlePlaceUrl}/details/json?place_id=${place_id}&fields=address_components&key=${process.env.GOOGLE_API_KEY}`;
  const farthestLoc = await got(placeDetailUrl, { responseType: 'json', resolveBodyOnly: true });
  return parseAddressComponents(farthestLoc.result.address_components || []);
}

fastify.register(require('fastify-static'), {
  root: path.join(__dirname, '../web/dist'),
  prefix: '/',
});

fastify.get('/api/fake-address', async function (req, reply) {
  const params = req.query;
  if (!params.long || !params.lat) {
    reply.code(400).send({ error: true, reason: 'Please send coordinate' });
  }

  const result = await getNearbyPharmacy(params);

  reply.code(200).send(result);
});

fastify.listen(3000, '0.0.0.0', (err, address) => {
  if (err) throw err;
  fastify.log.info(`server listening on ${address}`);
});
