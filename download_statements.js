const fs = require('fs');
const path = require('path');
const https = require('https');

const files = JSON.parse(fs.readFileSync('drive_files.json', 'utf8')).filter(f => f.name.endsWith('.xlsx'));
const outDir = path.resolve('temp_statements');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

function downloadFile(file) {
  return new Promise((resolve, reject) => {
    const dest = path.join(outDir, file.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`[SKIP] Already exists: ${file.name}`);
      return resolve();
    }
    const url = `https://drive.usercontent.google.com/download?id=${file.id}&export=download&authuser=0`;
    const fallbackUrl = `https://drive.google.com/uc?export=download&id=${file.id}`;

    function tryGet(fetchUrl, redirectCount = 0) {
      if (redirectCount > 5) return reject(new Error('Too many redirects for ' + file.name));
      https.get(fetchUrl, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return tryGet(res.headers.location, redirectCount + 1);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`Failed with status ${res.statusCode} for ${file.name}`));
        }
        const fileStream = fs.createWriteStream(dest);
        res.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close();
          const sz = fs.statSync(dest).size;
          console.log(`[DONE] ${file.name} (${sz} bytes)`);
          resolve();
        });
      }).on('error', err => reject(err));
    }

    tryGet(fallbackUrl);
  });
}

async function run() {
  console.log(`Starting download of ${files.length} statement files...`);
  for (const f of files) {
    try {
      await downloadFile(f);
      // Small delay between requests to be gentle
      await new Promise(r => setTimeout(r, 600));
    } catch (e) {
      console.error(`Error downloading ${f.name}:`, e.message);
    }
  }
  console.log('All downloads completed!');
}

run();
