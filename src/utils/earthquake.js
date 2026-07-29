const parseEarthquakeTime = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) return numericValue;
  const parsedValue = Date.parse(value);
  return Number.isNaN(parsedValue) ? null : parsedValue;
};

const getEarthquakeFingerprint = (event) => {
  if (!event) return null;
  if (event.id) return String(event.id);
  if (event.fingerprint) return String(event.fingerprint);
  return `${event.place ?? ""}|${event.time ?? event.timeISO ?? ""}|${event.mag ?? ""}`;
};

const getLatestEarthquake = (payload) =>
  payload?.results?.[0] || payload?.data?.[0] || null;

module.exports = {
  getEarthquakeFingerprint,
  getLatestEarthquake,
  parseEarthquakeTime,
};
