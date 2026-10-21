function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      let data;
      try {
        data = JSON.parse(raw);
      } catch {
        return reject(new Error('Request body is not valid JSON'));
      }
      if (data === null || typeof data !== 'object' || Array.isArray(data))
        return reject(new Error('Request body must be a JSON object'));
      return resolve(data);
    });
    req.on('error', reject);
  });
}

module.exports = { sendJson, readJsonBody };
