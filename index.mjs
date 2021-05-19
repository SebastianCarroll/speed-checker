import speedTest from 'speedtest-net';
import fs from 'fs';
import schedule from 'node-schedule';

const options = {
  "acceptGdpr": true,
  "acceptLicense": true
}

var stream = fs.createWriteStream("append.csv", { flags: 'a' });

const job = schedule.scheduleJob('*/5 * * * *', async () => {
  let mpbs = 0;
  try {
    console.log(`starting at ${new Date().toISOString()}`);
    const { download } = await speedTest(options);
    mpbs = (download?.bandwidth / 1024 / 1024) * 8;
    console.log(`Speed was ${mpbs}`);
  } catch (err) {
    console.log(err.message);
  }
  stream.write(`${new Date().toISOString()},${mpbs}\n`);
})

process.on('SIGINT', () => {
  console.log("Caught SIGINT - ending stream and closing");
  stream.end();
  process.exit(1);
})

