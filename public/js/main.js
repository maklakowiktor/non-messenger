const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const preloader = document.querySelector('.square-spin');

let userChat = {
  username: null,
  room: null,
}

const socket = io();

socket.emit('loadClient')
//Получение пользователя и комнаты
socket.on('joinToChat', (username, room, messages) => {
  userChat = {
    username,
    room
  }
  // Show preloader
  
  messages.forEach( item => {
    outputOldMessage(item);
  })
  // Hide preloadery
  preloader.style = 'opacity: 0;'
  if(userChat.username) {
    socket.emit('joinRoom', userChat.username, userChat.room );
  } else {
    window.location.href = '/rooms'
  }
  // Присоединение к комнате
})

// Получить комнату и пользователя
socket.on('roomUsers', ({room, users}) => {
  outputRoomName(room);
  outputUsers(users);
});

// Сообщение от сервера 
socket.on('message', message => {
  outputMessage(message);
  // Скролл вниз
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// let typing = false;
let timeout = undefined;

socket.on('serverTyping', (name) => {
  clearTimeout(timeout);
  let tps = document.querySelector('.span-typing');
  let typingUsers = [];
  typingUsers.push(name);
  tps.innerHTML = `${typingUsers} пишет...`;
  timeout = setTimeout(() => { tps.innerHTML = '' }, 3000);
})

// Поддтверждение сообщения
chatForm.addEventListener('submit', e => {
  e.preventDefault();
    const msg = e.target.elements.msg.value;
    socket.emit('chatMessage', msg, userChat.username, userChat.room);
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  // Создаём контейнер для одного сообщения
  const div = document.createElement('div');
  div.classList.add('message');
  // Тег p, содержащий имя и дату письма
  const p = document.createElement('p');
  p.classList.add('meta');
// Создаём второй контейнер, для содержимого сообщения
  const divt = document.createElement('div');
  divt.classList.add('text');
// Добавляем содержимое внутрь созданных элементов
  p.innerHTML = `${message.username}<span> ${message.time}</span>`;
  divt.innerText = message.text;
// Соединяем всё элементы
  div.appendChild(p);
  div.appendChild(divt);
// Присоединяем готовое сообщение ко всему диалогу
  document.querySelector('.chat-messages').appendChild(div);
}

// Output messages history
function outputOldMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  const divt = document.createElement('div');
  divt.classList.add('text');
  p.innerHTML = `${message.sender}<span> ${message.send_time}</span>`;
  divt.innerText = message.message;
  div.appendChild(p);
  div.appendChild(divt);
  
  document.querySelector('.chat-messages').appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => userChat.username == user.username ? `<li><b>${user.username}</b> (Вы)</li>` : `<li>${user.username}</li>`).join('')}
  `;
}

function typing() {
  socket.emit('serverTyping', userChat.username, userChat.room);
}