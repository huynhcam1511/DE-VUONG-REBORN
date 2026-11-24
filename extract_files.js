const fs = require('fs');

const data = fs.readFileSync('folder_dump.html', 'utf8');

// Match pattern: data-id="<ID>" ... <strong class="DNoYtb">lich-su-giao-dich-tai-khoan YYYY.MM.xlsx</strong>
const regex = /data-id="([a-zA-Z0-9_-]{20,})"[^>]*>.*?<strong class="DNoYtb">([^<]+)<\/strong>/g;

let m;
const files = [];
const seen = new Set();
while ((m = regex.exec(data)) !== null) {
  const id = m[1];
  const name = m[2];
  if (!seen.has(name)) {
    seen.add(name);
    files.push({ id, name });
  }
}

console.log('Total files found:', files.length);
files.sort((a, b) => a.name.localeCompare(b.name));
files.forEach(f => console.log(`${f.name} -> ${f.id}`));

fs.writeFileSync('drive_files.json', JSON.stringify(files, null, 2), 'utf8');
