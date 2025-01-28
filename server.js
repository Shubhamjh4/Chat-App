const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// Set up the app and server
const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public')); // Serve static files from the 'public' directory

// Handle client connections
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle user joining
  socket.on('join', (username) => {
    socket.username = username;
    console.log(`${username} joined the chat.`);
    socket.broadcast.emit('message', { username: 'Server', message: `${username} has joined the chat!` });
  });

  // Handle sending messages
  socket.on('message', (data) => {
    io.emit('message', data); // Broadcast the message to all clients, including media if present
  });

  // Handle user exit
  socket.on('exit', (username) => {
    console.log(`${username} left the chat.`);
    socket.broadcast.emit('message', { username: 'Server', message: `${username} has left the chat!` });
  });

  // Handle user disconnecting
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.username || 'Unknown user');
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
