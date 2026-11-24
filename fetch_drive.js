const fs = require('fs');
const https = require('https');

const folderId = '1VLlH9N__Q_6E-H8bMhH5-qZa6dlW0b8L';
const url = `https://drive.google.com/drive/folders/${folderId}`;

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('folder_dump.html', data, 'utf8');
    console.log('Saved folder_dump.html, length:', data.length);
    
    // Look for file metadata in Drive HTML
    // Drive HTML often contains: ["id", ["name", ...], ...] or data-id="..."
    const regex = /\["([a-zA-Z0-9_-]{28,45})",\["([^"]+\.xlsx?)"/g;
    let match;
    const files = [];
    while ((match = regex.exec(data)) !== null) {
      files.push({ id: match[1], name: match[2] });
    }
    console.log('Regex 1 found:', files.length, files);
    
    // Alternative regex
    if (files.length === 0) {
      const allXlsx = [];
      const xlsxRegex = /"([a-zA-Z0-9_-]{28,45})"[^"]*"([^"]+\.xlsx)"/g;
      while ((match = xlsxRegex.exec(data)) !== null) {
        allXlsx.push({ id: match[1], name: match[2] });
      }
      console.log('Regex 2 found:', allXlsx.length, allXlsx);
    }
  });
}).on('error', err => {
  console.error('Error fetching drive folder:', err);
});
