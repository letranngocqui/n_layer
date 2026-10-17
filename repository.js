const dataSource = require('./data_source.js');

function findAll(limit) {
  const { products } = dataSource.load();
  return limit == undefined ? products : products.slice(0, limit);
}

function findById(id) {
  const { products } = dataSource.load();
  return products.find(p => p.id === id) || null;
}

// POST
function create(fields) {
  const data = dataSource.load();
  const product = { id: data.nextId, ...fields };
  data.nextId += 1;
  data.push(product);
  dataSource.save(data);
  return product;
}

// PUT
function replace(id, fields) {
  const data = dataSource.load();
  const index = data.products.findIndex(p => p.id === id);
  if (index === -1)
    return null;
  data.products[index] = { id, ...fields };
  data.dataSource.save(data);
  return data.products[index];
}

// PATCH
function update(id, fields) {
  const data = dataSource.load();
  const index = data.products.findIndex(p => p.id == id);
  if (index === -1)
    return null;
  Object.assign(data.products[index], fields);
  dataSource.save(data);
  return data.products[index];
}

// DELETE
function remove (id) {
  const data = dataSource.load();
  const index = data.products.findIndex(p => p.id == id);
  if (index === -1)
    return null;
  const [deleted] = data.products.splice(index, 1);
  dataSource.save(data);
  return deleted;
}

module.exports = { findAll, findById, create, replace, update, remove };
