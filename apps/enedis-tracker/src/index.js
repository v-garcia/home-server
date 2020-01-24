const linky = require('@bokub/linky');
const getDaysInMonth = require('date-fns/getDaysInMonth');
const format = require('date-fns/format');
const got = require('got');

// All price in euro cents
const MONTLY_FLAT_RATE = 998;
const KW_PRICE = 13.79;

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
    text: `${format(dateObj, 'EEEEEE d LLL')} | **${centsToEuro(dayTotal)}** (flat ${centsToEuro(
      dayFlat
    )} + ${centsToEuro(day)})`
  };
}

function GenDailyNotification(gotifyClient, dayInfo) {
  return gotifyClient('Last day consumption', dayInfo.text);
}

async function dailyRoutine(linkySession, gotifyClient) {
  const daily = await linkySession.getDailyData();
  const lastDay = daily[daily.length - 1];
  const dayInfo = getDayPriceText(lastDay);
  await GenDailyNotification(gotifyClient, dayInfo);
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

  if (!enedisEmail || !enedisPassword) {
    throw Error('Enedis credentials must be set');
  }

  if (!gotifyUrl || !gotifyToken) {
    throw Error('Gotify token must be set');
  }

  if (!routine || !routine in routines) {
    throw Error(`Valid routine must be specified as first arg (${action} provided)`);
  }

  return { routine, enedisEmail, enedisPassword, gotifyUrl, gotifyToken };
}

async function main() {
  const appParams = getAppParams();
  const session = await linky.login(appParams.enedisEmail, appParams.enedisPassword);
  const gotifyClient = gotifyNotification(appParams.gotifyUrl, appParams.gotifyToken);

  const toRun = routines[appParams.routine];

  await toRun(session, gotifyClient);
}

(async () => {
  try {
    await main();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
