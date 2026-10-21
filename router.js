const controller = require('./controller');
const { sendJson } = require('./utils/http');
const { logRequest, requireAuth } = require('./middleware');

const routes = [
  { method: 'GET', hasId: false, handler: controller.getList },
  { method: 'POST', hasId: false, handler: controller.createProduct, middlewares: [requireAuth] },
  { method: 'GET', hasId: true, handler: controller.getOne },
  { method: 'PUT', hasId: true, handler: controller.replaceProduct, middlewares: [requireAuth] },
  { method: 'PATCH', hasId: true, handler: controller.updateProduct, middlewares: [requireAuth] },
  { method: 'DELETE', hasId: true, handler: controller.removeProduct, middlewares: [requireAuth] },
];

function notFound(res) {
  return sendJson(res, 404, { error: 'not found' });
}

async function handleRequest(req, res) {
  try {
    logRequest(req, res);

    const url = new URL(req.url, 'http://localhost');
    const parts = url.pathname.split('/').filter(Boolean);

    if (parts[0] !== 'products' || parts.length > 2) {
      return notFound(res);
    }

    const hasId = parts.length === 2;
    const route = routes.find((r) => r.method === req.method && r.hasId === hasId);
    if (!route) return notFound(res);

    for (const middleware of route.middlewares || []) {
      if (!(await middleware(req, res))) return;
    }

    await route.handler(req, res, { url, id: parts[1] });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      sendJson(res, 500, { error: 'internal server error' });
    } else {
      res.end();
    }
  }
}

module.exports = { handleRequest };
