const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const formatMessage = require('./utils/messages');
const mongoose = require('mongoose');
const UserMongo = require('./public/js/user');

const urlencodedParser = bodyParser.urlencoded({extended: false});

const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Задаем параметры статических папок

// Укажем роуты                   
app.get("/", async function (req, res) {
  res.sendFile(__dirname + '/public/login.html');
});

app.get("/rooms", function(req, res) {
  res.sendFile(__dirname + '/index.html');
})




app.use(express.static(path.join(__dirname, 'public')));

const botName = 'ChatCord Bot';
let username, room

// Запуск при подключении клиентов
io.on('connection', socket => {

  app.post("/chat", urlencodedParser, function(req, res) {
    username = req.body.username
    room =  req.body.room
    res.sendFile(__dirname + '/chat.html');
  });
  
  socket.on('loadClient', () => {
    socket.emit('joinToChat', username, room);
  })


  // Прием логина и пароля c клиента (login.js)
  socket.on('clickReg', (login, password) => {
    UserMongo({ name: login, pass: password })
      .save((err) => {
        if (err) return handleError(err);
        console.log(`Пользователь ${login} был сохранён`);
      });
    socket.emit('successReg', login); 
  });

  socket.on('clickDuck', (login, password) => {
      UserMongo
        .find({ name: login, pass: password }, (err, res) => {
          if (err) return console.error(err);
          if(res.length) { 
            socket.emit('successAuth', login)
          } else {
            socket.emit('invalidLogin', login)
          }
        });
  });

  socket.on('joinRoom', (username, room) => {
    
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // Приветствие пользователя
    socket.emit('message', formatMessage(botName, 'Добро пожаловать в чат!'));

    // Броадкаст при подключении пользователя
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} присоединился к чату`)
      );
    console.log(getRoomUsers(user.room));
    // Отправляем пользователей и комнату
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });


  // Прослушивание сообщения чата
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg));
  });

  // Запуск когда пользователь отключается
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatMessage(botName, `${user.username} покинул чат`)
      );

      // Отправить пользователей и информацию о комнате
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

const PORT = process.env.PORT || 5000;

app.get("/*", function(req, res) {
  res.redirect('/');
})

async function start() {
  try {
    await mongoose.connect('mongodb+srv://lincoln:1@cluster0-bwlcs.mongodb.net/login', { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    server.listen(PORT, () => console.log(`Сервер был запущен. Порт: ${PORT}`));
  } catch (e) {
    console.log(e);
  }
}

start();
