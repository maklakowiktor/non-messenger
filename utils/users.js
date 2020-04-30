const users = [];
let loh;

// Присоединение пользователя к чату
function userJoin(id, username, room) {
  const user = { id, username, room };
  if(users.length) {
    let filterUsers = users.find(item =>
      (item.username === user.username) && (item.room === user.room)
    );
    if(filterUsers === undefined) {
      users.push(user);
      return user;
    }
    loh = filterUsers;
  } else {
    users.push(user);
  }
  return user;
}

// Получить текущего пользователя
function getCurrentUser(id) {
  let find = users.find(user => user.id === id);
  if(find === undefined) {
    return loh;
  } else {
    return users.find(user => user.id === id);
  }
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
