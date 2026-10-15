const fs = require('node:fs');
const path = require('node:path');

const filePath = path.join(__dirname, 'products.json');

function load() {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch (err) {
    if (err.code == 'ENOENT') return { nextId: 1, products: [] };
    throw err;
  }
}

function save(data) {
  const tmp = filePath + 'tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, filePath);
}

module.exports = { load, save };
