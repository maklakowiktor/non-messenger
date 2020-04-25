const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

let userChat = {
  username: null,
  room: null
}

const socket = io();

socket.emit('loadClient')
//Получение пользователя и комнаты методом POST
socket.on('joinToChat', (username, room) => {
  userChat = {
    username,
    room
  }
  if(userChat.username) {
    socket.emit('joinRoom', userChat.username, userChat.room );
  } else {
    window.location.href = '/rooms'
  }
  // Присоединение к комнате
})

// Получить комнату и пользователя
socket.on('roomUsers', ({room, users}) => {
  console.log(room);
  console.log(users);
  outputRoomName(room);
  outputUsers(users);
});

// Сообщение от сервера
socket.on('message', message => {
  outputMessage(message);

  // Скролл вниз
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Поддтверждение сообщения
chatForm.addEventListener('submit', e => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit('chatMessage', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
    ${message.text}
  </p>`;
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}
