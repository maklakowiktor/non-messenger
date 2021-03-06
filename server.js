const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const UserMongo = require('./public/js/user');
const MsgsMongo = require('./public/js/msgs');
const formatMessage = require('./utils/messages');

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

const storageConfig = multer.diskStorage({
  destination: (req, file, cb) =>{
      cb(null, "public/uploads");
  },
  filename: (req, file, cb) =>{
      cb(null, Date.now() + "-" + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
if(file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
    cb(null, true);
  }
  else{
    cb(null, false);
  }
}

let upload = multer({ storage: storageConfig, fileFilter: fileFilter });
var cpUpload = upload.fields([{ name: 'img' }]);

// Укажем роуты                   
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/public/login.html');
});

app.get("/rooms", function(req, res) {
  res.sendFile(__dirname + '/public/index.html');
})

// Задаем параметры статических папок
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Чат';
let username, room;
// Запуск при подключении клиентов
io.on('connection', socket => {

  app.post("/chat", urlencodedParser, function(req, res) {
    username = req.body.username
    room =  req.body.room
    res.sendFile(__dirname + '/public/chat.html');
  });

  app.post("/chat/upload", cpUpload, function (req, res, next) {
    // let sender = req.body.username;
    // let msg = req.body.msg;
    let file = req.files['img'][0];
    let imgMessage = { filePath: 'uploads/' + file.filename }
    res.send(imgMessage);
  });
  
  socket.on('loadClient', () => {
    let messages = [];
    // while (!messages.length) {
    MsgsMongo
      .find({ room }, (err, res) => {
        if (err) return console.error(err);
        console.log(res.length);
        messages.push(...res);
        socket.emit('joinToChat', username, room, messages);
        console.log(`Произошло извлечение ${messages.length} записей в комнату ${room}`);
      })
    // }
  })


  // Прием логина и пароля c клиента (login.js)
  socket.on('clickReg', async (login, password) => {
    await UserMongo({ name: login, pass: password })
      .save((err) => {
        if (err) return handleError(err);
        console.log(`Пользователь ${login} был сохранён`);
      });
    socket.emit('successReg', login); 
  });

  socket.on('clickDuck', async (login, password) => {
      await UserMongo
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
    // socket.emit('message', formatMessage(botName, 'Добро пожаловать в чат!'));

    // Броадкаст приветствия при подключении пользователя
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} присоединился к чату`)
      );
    // Отправляем пользователей и комнату
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });


  // Прослушивание сообщения чата
  socket.on('chatMessage', async (msg, sender, room, linkImg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatMessage(user.username, msg, linkImg));

    await MsgsMongo({message: msg, sender, send_time: Date(), room: room, img: linkImg })
      .save((err) => {
        if (err) return handleError(err);
        console.log(`New message in DB ${msg}`);
      });

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

  socket.on('serverTyping', (name, room) => {  
    socket.to(room).emit('serverTyping', name);
  })


});


const PORT = process.env.PORT || 5000;

app.get("/*", function(req, res) {
  res.redirect('/');
})
// mongodb+srv://lincoln:1@cluster0-bwlcs.mongodb.net/login
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
