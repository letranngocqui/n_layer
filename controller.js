const { sendJson, readJsonBody } = require('../utils/http');
const { validateProduct, validatePatch } = require('../utils/validate');
const repo = require('./repository');

// The id from the URL is a string, so convert it to a number
function parseId(idParam) {
  return /^\d+$/.test(idParam) ? Number(idParam) : NaN;
}

// Read the body and drop id (ids are assigned by server not user)
// return { fields } on success, { error } if the body is invalid
async function readFields(req) {
  try {
    const body = await readJsonBody(req);
    const { id: _ignored, ...fields } = body;
    return { fields };
  } catch (err) {
    return { error: err.message };
  }
}

// GET /products, GET /products?limit=n
function getList(req, res, { url }) {
  const limitParam = url.searchParams.get('limit');

  if (limitParam === null) {
    return sendJson(res, 200, repo.findAll());
  }
  if ( !(/^\d+$/.test(limitParam)) ) {
    return sendJson(res, 400, { error: 'limit must be an integer >= 0' });
  }
  return sendJson(res, 200, repo.findAll(Number(limitParam)));
}

// GET /products/id
function getOne(req, res, { id }) {
  const product = repo.findById(parseId(id));
  if (product === null)
    return sendJson(res, 404, { error: 'NOT FOUND' });

  return sendJson(res, 200, product);
}

// POST /products
async function createProduct(req, res) {
  const { fields, error } = await readFields(req);

  if (error)
    return sendJson(res, 400, { error });

  const validationErr = validateProduct(fields);
  if (validationErr)
    return sendJson(res, 400, { validationErr });

  return sendJson(res, 201, repo.create(fields));
}

// PUT /products/id
async function replaceProduct(req, res, { id }) {
  const { fields, error} = await readFields(req);
  if (error)
    return sendJson(res, 400, { error });

  const validationErr = validateProduct(fields);
  if (validationErr)
    return sendJson(res, 400, { validationErr });

  const product = repo.replace(parseId(id), fields);
  if (product === null)
    return sendJson(res, 404, { error: 'NOT FOUND' });

  return sendJson(res, 200, product);
}

// PATCH /products/id
async function updateProduct(req, res, { id }) {
  const { fields, error } = await readFields(req);
  if (error)
    return sendJson(res, 400, { error });

  const validationErr = validatePatch(fields);
  if (validationErr)
    return sendJson(res, 400, { validationErr });

  const product = repo.update(parseId(id), fields);
  if (product === null)
    return sendJson(res, 404, { error: 'NOT FOUND' });

  return sendJson(res, 200, product);
}

// DELETE /products/id
function removeProduct(res, req, { id }) {
  const deleted = repo.remove(parseId(id));
  if (deleted === null)
    return sendJson(res, 404, { error: 'NOT FOUND' });

  return sendJson(res, 204, deleted);
}

module.exports = { getList, getOne, createProduct, replaceProduct, updateProduct, removeProduct };
