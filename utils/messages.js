const moment = require('moment');
moment.locale('ru');

function formatMessage(username, text, linkImg) {
  return {
    username,
    text,
    time: moment().format('LLLL'), // DD.MM.YYYY HH:mm
    linkImg
  };
}

module.exports = formatMessage;
