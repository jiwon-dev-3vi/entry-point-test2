'use strict';

const http = require('http');
const { handleRequest } = require('./routes');

const port = Number(process.env.APP_PORT || process.env.PORT || 3000);

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((error) => {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'internal server error' }));
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`nested api-server listening on http://localhost:${port}`);
  console.log('  GET  /health');
  console.log('  GET  /api/items');
  console.log('  POST /api/items');
});
