const linky = require('@bokub/linky');
const getDaysInMonth = require('date-fns/getDaysInMonth');
const startOfYesterday = require('date-fns/startOfYesterday');
const format = require('date-fns/format');
const got = require('got');
const Slouch = require('couch-slouch');

// All price in euro cents
const MONTLY_FLAT_RATE = 998;
const KW_PRICE = 13.79;
const COLLECTION_NAME = 'enedis_consumption';

const gotifyNotification = (url, token) => (title, message, priority) => {
  console.info(message);
  return got.post(`${url}/message`, {
    headers: { 'X-Gotify-Key': token },
    json: {
      title: title,
      message: message,
      priority: priority || 1
    },
    retry: 3
  });
};

function centsToEuro(value) {
  const eurs = Math.floor(value / 100);
  const cents = value % 100;
  return `${eurs},${String(cents).padStart(2, '0')}€`;
}

function getDayPriceText({ date, value }) {
  const dateObj = new Date(date);
  const dayFlat = Math.round(MONTLY_FLAT_RATE / getDaysInMonth(dateObj));
  const day = Math.round(value * KW_PRICE);
  const dayTotal = dayFlat + day;

  return {
    val: dayTotal,
    text: [
      `${format(dateObj, 'EEEEEE d LLL')} | *${centsToEuro(dayTotal)}* ` +
      `(${centsToEuro(day)} + flat ${centsToEuro(dayFlat)})`,
      `${Number(value).toFixed(2)} kVA`
    ].join('\n')
  };
}

function genDailyNotification(gotifyClient, dayInfo) {
  return gotifyClient('Last day consumption', dayInfo.text);
}

function dailyId(dateObj) {
  return `${format(dateObj, 'yyyyMMdd')}_daily`;
}

async function saveDayDataToDb(slouch, dInfo) {
  const dateObj = new Date(dInfo.date);

  const toSave = {
    ...dInfo,
    type: 'enedis-daily',
    _id: dailyId(dateObj)
  };

  return slouch.doc.upsert(COLLECTION_NAME, toSave);
}

async function lastDayAlreadyExists(slouch) {
  const id = dailyId(startOfYesterday());
  const yesterday = await slouch.doc.getIgnoreMissing(COLLECTION_NAME, id);
  const alreadyExists = Boolean(yesterday && yesterday.value);

  if (alreadyExists) {
    console.info(`Daily with '${id}' already exists`);
  }

  return alreadyExists;
}

async function dailyRoutine(linkySession, gotifyClient, slouch) {
  if (await lastDayAlreadyExists(slouch)) return;
  const daily = await linkySession.getDailyData();
  const lastDay = daily[daily.length - 1];
  if (!lastDay.value) {
    throw Error(`Fetched value of '${lastDay.date}' is ${lastDay.value} `);
  }

  const dayInfo = getDayPriceText(lastDay);
  await saveDayDataToDb(slouch, lastDay);
  await genDailyNotification(gotifyClient, dayInfo);
}

const routines = {
  daily: dailyRoutine
};

function getAppParams() {
  const routine = process.argv[2];
  const enedisEmail = process.env.ENEDIS_EMAIL;
  const enedisPassword = process.env.ENEDIS_PASSWORD;
  const gotifyUrl = process.env.GOTIFY_URL;
  const gotifyToken = process.env.GOTIFY_TOKEN;
  const couchDbUrl = process.env.COUCHDB_URL;

  if (!couchDbUrl) {
    throw Error('couch db url must be set');
  }

  if (!enedisEmail || !enedisPassword) {
    throw Error('Enedis credentials must be set');
  }

  if (!gotifyUrl || !gotifyToken) {
    throw Error('Gotify token must be set');
  }

  if (!routine || !routine in routines) {
    throw Error(`Valid routine must be specified as first arg(${action} provided)`);
  }

  return { routine, enedisEmail, enedisPassword, gotifyUrl, gotifyToken, couchDbUrl };
}

function initDb(slouch) {
  return slouch.db.create(COLLECTION_NAME).catch(e => {
    console.error(e);
  });
}

async function main() {
  const appParams = getAppParams();
  const session = await linky.login(appParams.enedisEmail, appParams.enedisPassword);
  const gotifyClient = gotifyNotification(appParams.gotifyUrl, appParams.gotifyToken);
  const slouch = new Slouch(appParams.couchDbUrl);
  initDb(slouch);
  const toRun = routines[appParams.routine];

  try {
    await toRun(session, gotifyClient, slouch);
  } catch (e) {
    await gotifyClient('An error has occured in routine:' + appParams.routine, e.name + ': ' + e.message);
    throw e;
  }
}

(async () => {
  try {
    await main();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
