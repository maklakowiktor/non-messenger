const mongoose  = require('mongoose');
const UserSchema = new mongoose.Schema({
    name: String,
    pass: String
 });
const UserMongo =  mongoose.model('users', UserSchema);

module.exports = UserMongo;




