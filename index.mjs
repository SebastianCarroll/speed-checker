import speedTest from 'speedtest-net';
import fs from 'fs';
import schedule from 'node-schedule';

const options = {
  "acceptGdpr": true,
  "acceptLicense": true
}

var stream = fs.createWriteStream("append.csv", { flags: 'a' });

const job = schedule.scheduleJob('*/30 * * * *', async () => {
//{const job = schedule.scheduleJob('* * * * *', async () => {
  let mpbs = 0;
  let lat = null;
  try {
    console.log(`starting at ${new Date().toISOString()}`);
    const { download, ping : { latency} } = await speedTest(options);
    lat = latency;
    mpbs = (download?.bandwidth / 1024 / 1024) * 8;
    console.log(`Speed was ${mpbs}, latency was ${latency}`);
  } catch (err) {
    console.log(err.message);
  }
  stream.write(`${new Date().toISOString()},${mpbs},${lat}\n`);
})

process.on('SIGINT', () => {
  console.log("Caught SIGINT - ending stream and closing");
  stream.end();
  process.exit(1);
})

