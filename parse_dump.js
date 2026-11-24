const fs = require('fs');

const data = fs.readFileSync('folder_dump.html', 'utf8');

// Search for any occurrence of .xlsx or lich-su or sao-ke
const idxs = [];
let pos = 0;
while ((pos = data.indexOf('.xlsx', pos)) !== -1) {
  idxs.push(pos);
  pos += 5;
}
console.log('Occurrences of .xlsx:', idxs.length);

idxs.forEach((idx, i) => {
  const snippet = data.substring(Math.max(0, idx - 200), Math.min(data.length, idx + 200));
  console.log(`--- [${i}] ---`);
  console.log(snippet);
});
