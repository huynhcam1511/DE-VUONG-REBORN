const fs = require('fs');
const path = require('path');

const oneDrive = path.resolve('C:/Users/zit/OneDrive');
const dirs = fs.readdirSync(oneDrive);
let targetFolder = null;
for (const d of dirs) {
  const full = path.join(oneDrive, d);
  try {
    if (fs.statSync(full).isDirectory()) {
      const sub = fs.readdirSync(full);
      for (const s of sub) {
        if (s.includes('Sao') && s.includes('ng')) {
          targetFolder = path.join(full, s);
          break;
        }
      }
    }
  } catch (e) {}
}

console.log('Target statement folder:', targetFolder);
if (targetFolder) {
  const files = fs.readdirSync(targetFolder);
  console.log('Files count:', files.length);
  files.forEach(f => console.log(' - ' + f));
}
