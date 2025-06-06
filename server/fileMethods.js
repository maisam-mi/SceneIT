const fs = require('fs');

// reading the content of the file.
function readFile(filePath) {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, '[]');
  const data = fs.readFileSync(filePath);
  return JSON.parse(data);
}

// writing the content of the file.
function writeFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

module.exports = { readFile, writeFile };
