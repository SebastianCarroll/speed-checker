import speedTest from 'speedtest-net';
import fs from 'fs';
import schedule from 'node-schedule';

const options = {
  "acceptGdpr": true,
  "acceptLicense": true
}

const job = schedule.scheduleJob('*/5 * * * *', async () => {
  var stream = fs.createWriteStream("append.csv", { flags: 'a' });
  try {
    console.log(`starting at ${new Date().toISOString()}`);
    const { download } = await speedTest(options);
    const mpbs = (download?.bandwidth / 1024 / 1024) * 8;
    console.log(`Speed was ${mpbs}`);
    stream.write(`${new Date().toISOString()},${mpbs}\n`);
  } catch (err) {
    console.log(err.message);
  } finally {
    // stream.end();
    //process.exit(0);
  }
})

