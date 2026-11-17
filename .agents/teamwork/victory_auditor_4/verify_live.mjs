import https from 'node:https';

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

const htmlRes = await fetchUrl('https://huynhkiencam.web.app');
console.log('Live HTML status:', htmlRes.statusCode);

const scriptMatch = htmlRes.body.match(/src="(\/assets\/index-[^"]+\.js)"/);
if (!scriptMatch) {
  console.error('Could not find script src in live HTML');
  process.exit(1);
}

const jsUrl = 'https://huynhkiencam.web.app' + scriptMatch[1];
console.log('Fetching live bundle:', jsUrl);
const jsRes = await fetchUrl(jsUrl);
console.log('Live JS status:', jsRes.statusCode, 'length:', jsRes.body.length);

const checks = [
  { name: 'border-rose-200/80 in live JS', pattern: /border-rose-200\/80/ },
  { name: 'border-slate-200/80 in live JS', pattern: /border-slate-200\/80/ },
  { name: 'text-[13.5px] in live JS', pattern: /text-\[13\.5px\]/ },
  { name: 'subtask indentation ml-4 pl-2 space-y-1.5', pattern: /ml-4 pl-2 space-y-1\.5 border-l border-slate-100/ },
  { name: 'circular subtask checkbox w-3.5 h-3.5', pattern: /w-3\.5 h-3\.5 rounded-full border mt-0\.5/ },
  { name: 'header font-semibold text-slate-800', pattern: /text-sm font-semibold text-slate-800 truncate/ }
];

let allPassed = true;
for (const check of checks) {
  const passed = check.pattern.test(jsRes.body);
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${check.name}`);
  if (!passed) allPassed = false;
}

if (!allPassed) {
  console.error('One or more checks failed in live bundle!');
  process.exit(1);
} else {
  console.log('ALL LIVE BUNDLE CHECKS PASSED EMPIRICALLY!');
}
