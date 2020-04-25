const users = [];

// Присоединение пользователя к чату
function userJoin(id, username, room) {
  const user = { id, username, room };
  console.log('Изначальный массив: ' + users.length);
  console.log(`Пуш-коннект нью юзера: ${user.username}`);
  if(users.length) {
    let filterUsers = users.find(item =>
      (item.username === user.username) && (item.room === user.room)
    );
    console.log('filterUsers: ' + filterUsers);
    if(filterUsers === undefined) {
      users.push(user);
      return user;
    }
  } else {
    users.push(user);
    console.log('First push > ' + users[0].username);
  }
  console.log(user);
  return user;
}

// Получить текущего пользователя
function getCurrentUser(id) {
  return users.find(user => user.id === id);
}

// Пользователь покинул чат
function userLeave(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

// Получить комнату пользователя
function getRoomUsers(room) {
  let res = users.filter(user => user.room === room);
  return res;
}

module.exports = {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
};
