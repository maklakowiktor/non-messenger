const mongoose  = require('mongoose');
const MsgsSchema = new mongoose.Schema({
    message: String,
    sender: String,
    send_time: String,
    room: String,
    img: String
 });
const MsgsMongo =  mongoose.model('messages', MsgsSchema);

module.exports = MsgsMongo;