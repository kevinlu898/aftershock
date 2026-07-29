const parseStoredValue = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (_error) {
    return value;
  }
};

module.exports = { parseStoredValue };
