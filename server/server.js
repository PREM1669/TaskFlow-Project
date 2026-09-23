const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const app = require('./app');

require('dotenv').config();
connectDB();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

require('./sockets/boardSocket')(io);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
