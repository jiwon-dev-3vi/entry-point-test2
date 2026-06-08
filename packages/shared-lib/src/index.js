'use strict';

function formatTimestamp(date = new Date()) {
  return date.toISOString();
}

function buildHealthPayload(service, entry) {
  return {
    ok: true,
    service,
    entry,
    timestamp: formatTimestamp(),
  };
}

module.exports = {
  formatTimestamp,
  buildHealthPayload,
};
