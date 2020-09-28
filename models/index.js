const mongoose = require('mongoose');
const {
  MONGO_URI,
  MONGO_PORT,
  MONGO_DATABASE,
  MONGO_POOL_SIZE,
} = process.env;

const uri = `${MONGO_URI}:${MONGO_PORT}/${MONGO_DATABASE}?poolSize=${MONGO_POOL_SIZE}`;
mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology:true});

