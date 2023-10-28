import { Session } from 'linky';
import { format as dateFormat, parseISO as dateParseISO, subDays, startOfToday, max as dateMax, addDays, getDaysInMonth } from 'date-fns';
import got from 'got';
import store from './store.js';

const SEEK_DAYS = 30;   

async function getLinkySession() {
  const { accessToken } = await store.getAuthTokens();

  const session = new Session(accessToken, process.env.USAGE_POINT_ID);  
  return session;
}

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

function getGotityClient() {
  return gotifyNotification(process.env.GOTIFY_URL, process.env.GOTIFY_TOKEN);
}

function toLinkyDate(date) {
  return dateFormat(date, 'yyyy-MM-dd');
}

function centsToEuroStr(value) {
  const eurs = Math.floor(value / 100);
  const cents = value % 100;
  return `${eurs},${String(cents).padStart(2, '0')}€`;
}

function getDayPriceText({ monthlyFlatRage, kwhPrice }, { date, value }) {
  value = value / 1000; // wh to kwh
  const dayFlat = Math.round(monthlyFlatRage / getDaysInMonth(date));
  const day = Math.round(value * kwhPrice);
  const dayTotal = dayFlat + day;

  return {
    val: dayTotal,
    text: [
      `${dateFormat(date, 'EEEEEE d LLL')} | *${centsToEuroStr(dayTotal)}* ` +
      `(${centsToEuroStr(day)} + flat ${centsToEuroStr(dayFlat)})`,
      `${Number(value).toFixed(2)} kVA`
    ].join('\n')  
  };
}

async function dailyRoutine(linkySession, gotifyClient, usagePointId) {
  // Determining min days

  let minDay = subDays(startOfToday(), SEEK_DAYS);
  minDay = dateMax([minDay, (await store.getLastDay(usagePointId)) || minDay]);
  minDay = addDays(minDay, 1);

  // Retrieving prices 
  const prices = await store.getPrices();

  // Retrieving data from linky
  const dailyParams = [toLinkyDate(minDay), toLinkyDate(startOfToday())];
  console.info(`Running 'getDailyConsumption' with params: '${dailyParams}'`);

  let data = [];
  let unit = 'Wh';
  if (dailyParams[0] !== dailyParams[1]) {
    data = (await linkySession.getDailyConsumption(...dailyParams))?.interval_reading;
  }

  // Handling daily consumptions
  for (let { date, value } of data) {
    date = dateParseISO(date);

    // Store
    await store.putDailyConsumption(usagePointId, date, { unit, value, usagePointId});

    // Notify
    const dayCost = getDayPriceText(prices, { date, value });
    //console.info(dayCost);
    await gotifyClient('Last days consumption', dayCost.text);
  }
}

const routines = {
  daily: dailyRoutine
};

(async () => {

  const routine = process.argv[2];
  const toRun = routines[routine];

  // Initiate resources

  console.info(`Starting ${routine} routine`);

  try {
    var gotifyClient = getGotityClient();
    const linkySession = await getLinkySession();
    
    await toRun(linkySession, gotifyClient, process.env.USAGE_POINT_ID);
    console.info(`Ending ${routine} routine`);
  } catch (e) {
    console.error(e);
    await gotifyClient(`An error has occured in ${routine} routine: ${e.name}: ${e.message}`);
    process.exit(1);
  }
})();

