import speedTest from 'speedtest-net';
import fs from 'fs';
import schedule from 'node-schedule';

// https://my.virginmedia.com/my-cases/make-a-complaint

const options = {
  "acceptGdpr": true,
  "acceptLicense": true
}

var stream = fs.createWriteStream("append.csv", { flags: 'a' });

const every_30_mins = '*/30 * * * *';
const every_5_mins = '*/5 * * * *';
let in_fast_mode = false;

const min_guarantee = 107;

const job = schedule.scheduleJob(every_30_mins, async () => {
//{const job = schedule.scheduleJob('* * * * *', async () => {
  let mbps = 0;
  let lat = null;
  try {
    console.log(`starting at ${new Date().toISOString()}`);
    const { download, ping : { latency} } = await speedTest(options);
    lat = latency;
    mbps = (download?.bandwidth / 1024 / 1024) * 8;
    console.log(`Speed was ${mbps}, latency was ${latency}`);
  } catch (err) {
    console.log(err.message);
  }

  stream.write(`${new Date().toISOString()},${mbps},${lat}\n`);

  if(mbps < min_guarantee && !in_fast_mode) {
    console.log('Looks slow - entering fast mode');
    in_fast_mode = true;
    job.reschedule(every_5_mins);
  } else if(mbps > min_guarantee && in_fast_mode) {
    console.log('Looks to have recovered - back to slow mode');
    in_fast_mode = false;
    job.reschedule(every_30_mins);
  }
})

process.on('SIGINT', () => {
  console.log("Caught SIGINT - ending stream and closing");
  stream.end();
  process.exit(1);
})

