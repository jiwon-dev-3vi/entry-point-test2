'use strict';

const { buildHealthPayload } = require('../../../packages/shared-lib/src/index.js');
const store = require('./store');

const ENTRY = 'workspace/api-server/src/server.js';

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(body));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  const { method, url } = req;

  if (method === 'GET' && url === '/health') {
    sendJson(res, 200, buildHealthPayload('nested-api-server', ENTRY));
    return;
  }

  if (method === 'GET' && url === '/api/items') {
    sendJson(res, 200, { items: store.listItems() });
    return;
  }

  if (method === 'POST' && url === '/api/items') {
    try {
      const body = await readJsonBody(req);
      const title = typeof body.title === 'string' ? body.title : '';
      if (!title.trim()) {
        sendJson(res, 400, { error: 'title is required' });
        return;
      }
      const item = store.createItem(title);
      sendJson(res, 201, { item });
    } catch {
      sendJson(res, 400, { error: 'invalid JSON body' });
    }
    return;
  }

  const toggleMatch = url && url.match(/^\/api\/items\/([^/]+)\/toggle$/);
  if (method === 'PATCH' && toggleMatch) {
    const item = store.toggleItem(toggleMatch[1]);
    if (!item) {
      sendJson(res, 404, { error: 'item not found' });
      return;
    }
    sendJson(res, 200, { item });
    return;
  }

  const deleteMatch = url && url.match(/^\/api\/items\/([^/]+)$/);
  if (method === 'DELETE' && deleteMatch) {
    const removed = store.deleteItem(deleteMatch[1]);
    if (!removed) {
      sendJson(res, 404, { error: 'item not found' });
      return;
    }
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  sendJson(res, 404, { error: 'not found' });
}

module.exports = {
  handleRequest,
};
