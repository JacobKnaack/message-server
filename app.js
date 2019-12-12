'use strict';

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(morgan('dev'));

const http = require('http').createServer(app);
const io = require('socket.io')(http);

const Message = require('./model/message.model');

const PORT = process.env.PORT || process.argv[2] || 3000;
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/db', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

io.on('connect', socket => {
  console.log(`Client socket connected :: ${socket.id}`);

  socket.on('POST_MESSAGE', (payload) => {
    const newMessage = new Message({ text: payload, createdAt: new Date()});
    newMessage.save()
      .then(message => {
        io.emit('MESSAGE', message);
      });
  });
});

app.get('/api/messages', (req, res, next) => {
  Message.find({})
    .then(data => res.send(data))
    .catch(next);
})

http.listen(PORT, () => {
  console.log(`Message server running on port ::: ${PORT}`);
});
