// server.js

const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let documentContent = '';

// Serve HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

wss.on('connection', (ws) => {
  // Send current document content to new client
  ws.send(JSON.stringify({ type: 'content', content: documentContent }));

  ws.on('message', (message) => {
    // Handle incoming messages (updates from clients)
    const parsedMessage = JSON.parse(message);
    if (parsedMessage.type === 'update') {
      documentContent = parsedMessage.content;
      // Broadcast the updated content to all connected clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'content', content: documentContent }));
        }
      });
    }
  });
});

// Ignore regular HTTP requests and return a 404 response
app.use((req, res, next) => {
  res.status(404).send('Not Found');
});

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
