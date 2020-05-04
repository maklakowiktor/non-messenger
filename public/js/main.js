const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');
const preloader = document.querySelector('.square-spin');
let timeout, 
    attaches = false,
    userChat = { username: null, room: null };

const socket = io();

socket.emit('loadClient')
//Получение пользователя и комнаты
socket.on('joinToChat', (username, room, messages) => {
  userChat = {
    username,
    room
  }
  // Показать прелоадер
  
  messages.forEach( item => {
    outputOldMessage(item);
  })
  // Скрываем прелоадер
  preloader.remove();
  let msgs = document.querySelectorAll('.message');
  msgs.forEach(item => item.style.opacity = 1);
  // preloader.style = 'opacity: 0;'
  if(userChat.username) {
    socket.emit('joinRoom', userChat.username, userChat.room );
  } else {
    window.location.href = '/rooms'
  }
})

// Получить комнату и пользователя
socket.on('roomUsers', ({room, users}) => {
  outputRoomName(room);
  outputUsers(users);
});

// Сообщение от сервера 
socket.on('message', message => {
  outputMessage(message);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Скролл вниз
});

// Показываем/скрываем typing
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
  const images = e.target.elements.photo.files[0];
  if (images.length) {
    return fetchImage(e);
  }
  socket.emit('chatMessage', msg, userChat.username, userChat.room);
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});



async function fetchImage(e) {
  const msg = e.target.elements.msg.value;
  const image = e.target.elements.photo.files[0];

  const formData = new FormData();
  const fileField = document.querySelector('input[type="file"]');

  formData.append('username', userChat.username);
  formData.append('avatar', fileField.files[0]);

  try {
    const response = await fetch('/chat/upload', {
      method: 'PUT',
      body: formData
    });
    const result = await response.json();
    console.log('Успех:', JSON.stringify(result));
  } catch (error) {
    console.error('Ошибка:', error);
  }



  let response = await fetch('/article/formdata/post/user', {
    method: 'POST',
    body: new FormData(formElem)
  });
    let result = await response.json();
    console.log(result.message);

  // socket.emit('chatMessage', msg, userChat.username, userChat.room, images);
  // e.target.elements.msg.value = '';
  // e.target.elements.msg.focus();
}

function countFiles(those) {
  let outCf = document.getElementById('countFiles');
  let cf = those.files.length;
  console.log(those.files);
  if(cf == 0) {
    outCf.innerText = '';
  } else {
    outCf.innerText = cf;
  }
}

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div'); // Создаём контейнер для одного сообщения
  div.classList.add('message');
  const p = document.createElement('p'); // Тег p, содержащий имя и дату письма
  p.classList.add('meta');
  const divt = document.createElement('div');// Создаём второй контейнер, для содержимого сообщения
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

window.addEventListener("contextmenu",function(event){
  event.preventDefault();
  if(event.target.classList.contains('message') || event.target.classList.contains('meta') || event.target.classList.contains('text') || event.target.tagName == 'SPAN' ) {
    var contextElement = document.getElementById("context-menu");
    contextElement.style.top = event.clientY + "px";
    contextElement.style.left = event.clientX + "px";
    contextElement.classList.add("active");
  } else {
    document.getElementById("context-menu").classList.remove("active");
  }
  
});

window.addEventListener("click",function(){
  document.getElementById("context-menu").classList.remove("active");
});
