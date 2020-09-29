const mongoose = require('mongoose');

const {
  MONGO_URI,
  MONGO_PORT,
  MONGO_DATABASE,
  MONGO_POOL_SIZE,
} = process.env;

const uri = `${MONGO_URI}:${MONGO_PORT}/${MONGO_DATABASE}?poolSize=${MONGO_POOL_SIZE}`;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = require('./userSchema');
const friendSchema = require('./friendSchema');

module.exports.userModel = mongoose.model('users', userSchema);
module.exports.friendModel = mongoose.model('friends', friendSchema);
