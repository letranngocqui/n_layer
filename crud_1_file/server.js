const http = require('http');

const products = [
  { id: 1, name: 'Áo thun', price: 100 },
  { id: 2, name: 'Quần jean', price: 250 },
  { id: 3, name: 'Giày thể thao', price: 500 },
];

let nextId = 4;

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function notFound(res) {
  sendJson(res, 404, { error: 'Not found' });
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
        return reject(new Error('Body không phải JSON hợp lệ'));
      }
      if (data === null || typeof data !== 'object' || Array.isArray(data)) {
        return reject(new Error('Body phải là một object JSON'));
      }
      resolve(data);
    });
    req.on('error', reject);
  });
}

function validateProduct(fields) {
  return (
    typeof fields.name === 'string' && fields.name.trim() !== '' &&
    typeof fields.price === 'number' && Number.isFinite(fields.price) &&  fields.price >= 0
  );
}

function validatePatch(fields) {
  if (Object.hasOwn(fields, 'name')) {
    if (typeof fields.name !== 'string' || fields.name.trim() === '')
      return 'Name must be non-empty string';
  }
  if (Object.hasOwn(fields, 'price')) {
    if (typeof fields.price !== 'number' || !Number.isFinite(fields.price) || fields.price < 0)
      return 'Price must be a number >= 0';
  }
  return null;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    const parts = url.pathname.split('/').filter(Boolean);

    if (parts[0] !== 'products' || parts.length > 2) {
      return notFound(res);
    }

    const method = req.method;

    if (parts.length === 1) {
      if (method === 'GET') {
        const limitParam = url.searchParams.get('limit');

        if (limitParam === null) {
          return sendJson(res, 200, products);
        }

        const limit = Number(limitParam);
        if (limitParam.trim() === '' || !Number.isInteger(limit) || limit < 0) {
          return sendJson(res, 400, { error: 'limit phải là số nguyên >= 0' });
        }
        return sendJson(res, 200, products.slice(0, limit));
      }

      if (method === 'POST') {
        let body;
        try {
          body = await readJsonBody(req);
        } catch (err) {
          return sendJson(res, 400, { error: err.message });
        }
        const { id: _ignored, ...fields } = body;
        if (!validateProduct(fields))
          return sendJson(res, 400, { error: 'Dữ liệu tạo product không hợp lệ' });
        const product = { id: nextId++, ...fields };
        products.push(product);
        return sendJson(res, 201, product);
      }

      return notFound(res);
    }

    const id = /^\d+$/.test(parts[1]) ? Number(parts[1]) : NaN;
    const index = products.findIndex((p) => p.id === id);

    if (method === 'GET') {
      if (index === -1) return notFound(res);
      return sendJson(res, 200, products[index]);
    }

    if (method === 'PUT' || method === 'PATCH') {
      if (index === -1) return notFound(res);

      let body;
      try {
        body = await readJsonBody(req);
      } catch (err) {
        return sendJson(res, 400, { error: err.message });
      }
      const { id: _ignored, ...fields } = body;

      if (method === 'PUT') {
        if (!validateProduct(fields))
          return sendJson(res, 400, { error: 'Invalid data for product replacement' });
        products[index] = { id: products[index].id, ...fields };
      } else {
        if (validatePatch(fields))
          return sendJson(res, 400, { error: validatePatch(fields) });
        Object.assign(products[index], fields);
      }
      return sendJson(res, 200, products[index]);
    }

    if (method === 'DELETE') {
      if (index === -1) return notFound(res);
      const [deleted] = products.splice(index, 1);
      return sendJson(res, 200, deleted);
    }

    return notFound(res);
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
