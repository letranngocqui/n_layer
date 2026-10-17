const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { createServer } = require('node:http');
const PORT = 3000;
