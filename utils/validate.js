const rules = {
  name: (value) => {
    if (typeof value !== 'string' || value.trim() === '') {
      return 'Name must be a non-empty string';
    }
    return null;
  },
  price: (value) => {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
      return 'Price must be a number >= 0';
    }
    return null;
  }
};

function findUnknownFields(fields) {
  const unknownFields = Object.keys(fields).filter((key) => !Object.hasOwn(rules, key));
  return unknownFields.length > 0 ? `Fields are not allowed: ${unknownFields.join(',')}` : null;
}

// POST and PUT
function validateProduct(fields) {
  if (Object.keys(fields).length === 0)
    return 'Product must contain both name and price fields';

  if (findUnknownFields(fields)) return findUnknownFields(fields);

  for (const key of Object.keys(rules)) {
    if (!Object.hasOwn(fields, key)) {
      return `Product must have a ${key}`;
    }
    const err = rules[key](fields[key]);
    if (err) return err;
  }
  return null;
}

// PATCH
function validatePatch(fields) {
  if (Object.keys(fields).length === 0) {
    return 'PATCH request must include at least one field';
  }

  if (findUnknownFields(fields)) return findUnknownFields(fields);

  for (const key of Object.keys(rules)) {
    if (Object.hasOwn(fields, key)) {
      const err = rules[key](fields[key]);
      if (err) return err;
    }
  }
  return null;
}

module.exports = { validateProduct, validatePatch };
