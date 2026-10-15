const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { createServer } = require('node:http');
const jwt = require('jsonwebtoken');

const JWT_SERCET = process.env.JWT_SERCET_KEY;
const PORT = 3000;
