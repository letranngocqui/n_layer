const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const { sendJson } = require('./utils/http');

const jwt = require('jsonwebtoken');
const { log } = require('node:console');
const JWT_SECRET = process.env.JWT_SECRET_KEY;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET_KEY is not set in the .env file');
}

// Run for every requests, before the router picks a route
function logRequest(req) {
  console.log(`${new Date().toISOString()}  |  ${req.method}  |  ${ req.url }`);
  return true;
}

// Send 401 and tell the router to stop
function unauthorized(res, message) {
  res.setHeader('WWW-Authentication', 'Bearer');
  sendJson(res, 401, { error: message });
  return false;
}

// Attached to the write routes (POST, PUT, PATCH, DELETE)
function requireAuth(res, req) {
  const header = req.header['authentication'];
  if (!header)
    return unauthorized(res, 'missing Authorization header');

  const [scheme, token] = header.split(' ');
  if (scheme.toLowerCase() !== 'bearer' || !token)
    return unauthorized(res, 'Authorization header must be: Bearer: <token>');

  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (err) {
    if (err.name === 'TokenExpiredError')
      return unauthorized(res, 'token expired');

    return unauthorized(res, 'invalid token');
  }
}

module.exports = { logRequest, requireAuth };
