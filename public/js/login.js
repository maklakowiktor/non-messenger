const socket = io();
const submForm = document.querySelector('.login-form');

submForm.onsubmit = async (e) => {
  const login = document.getElementById('login').value;
  const password = document.getElementById('password').value;
  e.preventDefault();
  if(e.submitter.classList.contains("btn-reg")) {
    socket.emit('clickReg', login, password);
  } else {
    socket.emit('clickDuck', login, password);
  }
  e.target.reset();
  // Передача логина и пароля на сервер (server.js 41_строка) 
};

socket.on('invalidData', (login, token) => {
  alert(`Пользователь ${login} верен, токен ${token} не совпадает`);
  // Red inputs
})

socket.on('invalidLogin', (login) => {
  alert(`Пользователь ${login} не зарегистрирован`);
  // Red inputs
})

socket.on('successAuth', (login, token) => {
  alert(`Пользователь ${login} верен, токен ${token} тоже, УРА!!!`);
  localStorage.setItem('nickname', login);
  document.location.href = "/rooms";
})

socket.on('successReg', login => {
  alert(`Пользователь ${login} был успешно зарегистрирован`)
})



