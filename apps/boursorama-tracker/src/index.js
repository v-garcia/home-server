import BoursoramaApi from "boursorama-unofficial-api";
import Utils from "./Utils.js";
import S3Store from "./S3Store.js";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import minMax from "dayjs/plugin/minMax.js";
dayjs.extend(isSameOrAfter);
dayjs.extend(minMax);

const MAX_DAY_SEEK = 30;
const pupetterParams = {
  args: [
    "--no-sandbox",
    "--disable-gpu",
    "--no-first-run",
    "--no-zygote",
    "--disable-dev-shm-usage",
    "--disable-setuid-sandbox",
  ],
};

const s3Store = new S3Store();
const boursoApi = new BoursoramaApi(process.env.WORKING_DIR || '/opt/');
const notifier = Utils.notify(process.env.GOTIFY_URL, process.env.GOTIFY_TOKEN);

async function cleanExit(signal) {
  signal && console.info(`*^!@4=> Received signal to terminate: ${signal}`);
  console.info("Bourso tracker ending");
  await boursoApi.getBrowser()?.close();
  process.exit();
}
process.on("SIGINT", cleanExit);
process.on("SIGTERM", cleanExit);

async function slurpAccount(i) {
  // Retrieve bourso account info
  const accountId = process.env[`BOURSO_ACCOUNT_${i}`];
  const user = process.env[`BOURSO_USER_${i}`];
  const pwd = process.env[`BOURSO_PWD_${i}`];

  // Get saved daily movements
  const savedMovements = await s3Store.getMovements(accountId);
  // Get the last day we need to search from
  const maxSeekDay = dayjs().subtract(MAX_DAY_SEEK, "day");
  let lastDay = savedMovements.Contents?.map(
    ({ Key }) => Key.split("/").pop().split("_")[0]
  )
    .sort()
    .reverse()[0];
  lastDay = lastDay ? dayjs.max(dayjs(lastDay), maxSeekDay) : maxSeekDay;

  // If lastday is yesterday, no need to retrieve anything
  if (lastDay.isSameOrAfter(dayjs().subtract(1, "day"), "day")) {
    console.info("Last daily movement is very recent, no retrieve needed");
    return;
  }

  console.info(`Start fetching movements from ${lastDay.format()}`);

  if (!boursoApi.getBrowser()) {
    await boursoApi.init(pupetterParams);
  }

  console.info(`User ${i} login in`);
  await boursoApi.connect(user, pwd);
  console.info(`User ${i} connected`);

  let movements = await boursoApi.getMovements(
    accountId,
    lastDay.toDate(),
    dayjs().subtract(1, "day").toDate()
  );

  console.info(`${movements.length} movements fetched`);

  movements = Utils.groupBy(movements, "dateOp");

  for (let day in movements) {
    let dayMovements = movements[day];

    console.info(`${day} - ${dayMovements.length} movements`);
    // day to js date
    day = dayjs(day).toDate();
    // movements to csv
    dayMovements = Utils.toCsv(dayMovements);
    // store day in s3
    await s3Store.putDayMovement(day, accountId, dayMovements);
  }
}

console.info("Bourso tracker starting");
let accountNb = 0;
do {
  try {
    await slurpAccount(accountNb);
  } catch (error) {
    console.error(`Exception on slurp account ${0}`, error);
    notifier("Bourso tracker error", error.toString());
    await boursoApi.getBrowser()?.close();
  }
} while (process.env[`BOURSO_ACCOUNT_${++accountNb}`]);

await cleanExit();
